from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import SensorData, Alert, PreventionActuatorState
from models.schemas import (
    SensorReadingCreate,
    SensorReadingResponse,
    PredictRequest,
    PredictResponse,
)
from services.ml_service import ml_service

router = APIRouter(prefix="/api/sensor", tags=["Sensors & AI"])

@router.post("/readings", response_model=SensorReadingResponse)
def receive_sensor_reading(payload: SensorReadingCreate, db: Session = Depends(get_db)):
    """
    Ingest endpoint for ESP32 hardware via HTTP POST or simulation engine.
    Applies real-time ML risk scoring and triggers alerts automatically if hazardous.
    """
    # Run ML prediction
    prediction = ml_service.predict(
        temperature=payload.temperature,
        humidity=payload.humidity,
        smoke_ppm=payload.smoke_ppm,
        flame_detected=payload.flame_detected
    )

    db_reading = SensorData(
        device_id=payload.device_id or "ESP32-DEVICE-01",
        temperature=payload.temperature,
        humidity=payload.humidity,
        smoke_ppm=payload.smoke_ppm,
        flame_detected=payload.flame_detected,
        flame_raw=payload.flame_raw or 1023,
        fire_risk=prediction["risk_level"],
        risk_score=prediction["risk_score"],
        is_simulated=payload.is_simulated or False
    )
    db.add(db_reading)

    # Auto-generate Alert if WARNING or HIGH RISK
    if prediction["risk_level"] in ["WARNING", "HIGH RISK"]:
        title = "CRITICAL FIRE HAZARD DETECTED" if prediction["risk_level"] == "HIGH RISK" else "FIRE RISK WARNING"
        msg = f"Alert at {db_reading.device_id}: Temp={payload.temperature}°C, Smoke={payload.smoke_ppm}ppm, Flame={payload.flame_detected}. Risk Score: {prediction['risk_score']}%"
        alert = Alert(
            device_id=db_reading.device_id,
            risk_level=prediction["risk_level"],
            title=title,
            message=msg,
            temperature=payload.temperature,
            humidity=payload.humidity,
            smoke_ppm=payload.smoke_ppm,
            flame_detected=payload.flame_detected,
            acknowledged=False,
            resolved=False
        )
        db.add(alert)

        # In HIGH RISK, engage buzzer in actuator table
        if prediction["risk_level"] == "HIGH RISK":
            state = db.query(PreventionActuatorState).first()
            if state:
                state.buzzer_active = True
                if state.suppression_armed:
                    state.relay_exhaust_fan = True

    db.commit()
    db.refresh(db_reading)
    return db_reading

@router.get("/readings", response_model=List[SensorReadingResponse])
def get_sensor_readings(
    limit: int = Query(50, ge=1, le=500),
    device_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SensorData)
    if device_id:
        query = query.filter(SensorData.device_id == device_id)
    readings = query.order_by(SensorData.created_at.desc()).limit(limit).all()
    return readings

@router.post("/predict", response_model=PredictResponse)
def predict_risk(payload: PredictRequest):
    """
    Direct ML Prediction API. Returns classified risk level, probability vectors,
    decision factors, and safety protocols without requiring database commit.
    """
    res = ml_service.predict(
        temperature=payload.temperature,
        humidity=payload.humidity,
        smoke_ppm=payload.smoke_ppm,
        flame_detected=payload.flame_detected
    )
    return PredictResponse(**res)

@router.get("/model-metrics")
def get_model_evaluation_metrics():
    """
    Returns actual ML evaluation metrics from trained dataset (Accuracy, Confusion Matrix, etc.)
    """
    return ml_service.metrics
