from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import PreventionActuatorState
from models.schemas import ActuatorControlRequest

router = APIRouter(prefix="/api/prevention", tags=["Fire Prevention Controls"])

def get_or_create_state(db: Session) -> PreventionActuatorState:
    state = db.query(PreventionActuatorState).first()
    if not state:
        state = PreventionActuatorState(
            buzzer_active=False,
            relay_exhaust_fan=False,
            relay_suppression=False,
            suppression_armed=False,
            system_lockdown=False
        )
        db.add(state)
        db.commit()
        db.refresh(state)
    return state

@router.get("/status")
def get_actuator_status(db: Session = Depends(get_db)):
    state = get_or_create_state(db)
    return {
        "buzzer_active": state.buzzer_active,
        "relay_exhaust_fan": state.relay_exhaust_fan,
        "relay_suppression": state.relay_suppression,
        "suppression_armed": state.suppression_armed,
        "system_lockdown": state.system_lockdown,
        "safety_advisory": (
            "CRITICAL PROTOCOL: Water suppression must only be deployed on Class A fires (wood/paper/cloth). "
            "NEVER deploy water on Class B (flammable liquids), Class C (energized electrical), or Class D (combustible metals). "
            "Use CO2 or Clean Agent FM-200 for server rooms and electrical enclosures."
        )
    }

@router.post("/control")
def control_actuators(cmd: ActuatorControlRequest, db: Session = Depends(get_db)):
    state = get_or_create_state(db)

    if cmd.buzzer_active is not None:
        state.buzzer_active = cmd.buzzer_active

    if cmd.relay_exhaust_fan is not None:
        state.relay_exhaust_fan = cmd.relay_exhaust_fan

    if cmd.suppression_armed is not None:
        state.suppression_armed = cmd.suppression_armed
        if not cmd.suppression_armed:
            state.relay_suppression = False

    # Safety guard: Relay suppression cannot be activated unless system is explicitly armed!
    if cmd.relay_suppression is not None:
        if cmd.relay_suppression and not state.suppression_armed:
            return {
                "status": "error",
                "message": "SAFETY INTERLOCK: Suppression system cannot be actuated while Safety Armed Switch is OFF.",
                "state": get_actuator_status(db)
            }
        state.relay_suppression = cmd.relay_suppression

    db.commit()
    db.refresh(state)

    return {
        "status": "success",
        "message": f"Actuator state updated. Reason: {cmd.reason}",
        "state": {
            "buzzer_active": state.buzzer_active,
            "relay_exhaust_fan": state.relay_exhaust_fan,
            "relay_suppression": state.relay_suppression,
            "suppression_armed": state.suppression_armed,
            "system_lockdown": state.system_lockdown
        }
    }

@router.post("/emergency-stop")
def emergency_stop(db: Session = Depends(get_db)):
    state = get_or_create_state(db)
    state.buzzer_active = False
    state.relay_exhaust_fan = False
    state.relay_suppression = False
    state.suppression_armed = False
    state.system_lockdown = False
    db.commit()
    return {"status": "success", "message": "EMERGENCY HALT: All relays and alarms disengaged safely."}
