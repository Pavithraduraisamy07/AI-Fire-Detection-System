from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = "Operator"
    role: Optional[str] = "OPERATOR"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    token: str

class SensorReadingCreate(BaseModel):
    device_id: Optional[str] = "ESP32-DEVICE-01"
    temperature: float
    humidity: float
    smoke_ppm: float
    flame_detected: bool
    flame_raw: Optional[int] = 1023
    is_simulated: Optional[bool] = False

class SensorReadingResponse(BaseModel):
    id: int
    device_id: str
    temperature: float
    humidity: float
    smoke_ppm: float
    flame_detected: bool
    flame_raw: int
    fire_risk: str
    risk_score: float
    is_simulated: bool
    created_at: datetime

class PredictRequest(BaseModel):
    temperature: float
    humidity: float
    smoke_ppm: float
    flame_detected: bool

class PredictResponse(BaseModel):
    risk_level: str
    confidence: float
    risk_score: float
    probabilities: dict
    feature_importance: dict
    decision_factors: List[str]
    recommended_actions: List[str]

class AlertResponse(BaseModel):
    id: int
    device_id: str
    risk_level: str
    title: str
    message: str
    temperature: float
    humidity: float
    smoke_ppm: float
    flame_detected: bool
    acknowledged: bool
    resolved: bool
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

class ActuatorControlRequest(BaseModel):
    buzzer_active: Optional[bool] = None
    relay_exhaust_fan: Optional[bool] = None
    relay_suppression: Optional[bool] = None
    suppression_armed: Optional[bool] = None
    reason: Optional[str] = "Manual operator control"
