from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import Alert
from models.schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alert Management"])

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    risk_level: Optional[str] = None,
    unresolved_only: bool = False,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if risk_level:
        query = query.filter(Alert.risk_level == risk_level)
    if unresolved_only:
        query = query.filter(Alert.resolved == False)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()

@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} acknowledged"}

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, notes: Optional[str] = "Resolved by operator", db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.notes = notes
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as resolved"}

@router.delete("/clear")
def clear_resolved_alerts(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.resolved == True).delete()
    db.commit()
    return {"status": "success", "message": "Cleared all resolved alerts"}
