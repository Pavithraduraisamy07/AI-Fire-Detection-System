from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100), default="Administrator")
    role = Column(String(20), default="ADMIN") # ADMIN, OPERATOR
    created_at = Column(DateTime, default=datetime.utcnow)

class SensorData(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True, default="ESP32-DEVICE-01")
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    smoke_ppm = Column(Float, nullable=False)
    flame_detected = Column(Boolean, nullable=False)
    flame_raw = Column(Integer, default=1023)
    fire_risk = Column(String(20), nullable=False) # NORMAL, WARNING, HIGH RISK
    risk_score = Column(Float, default=0.0)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True)
    risk_level = Column(String(20), nullable=False)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    temperature = Column(Float)
    humidity = Column(Float)
    smoke_ppm = Column(Float)
    flame_detected = Column(Boolean)
    acknowledged = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class PreventionActuatorState(Base):
    __tablename__ = "prevention_state"

    id = Column(Integer, primary_key=True)
    buzzer_active = Column(Boolean, default=False)
    relay_exhaust_fan = Column(Boolean, default=False)
    relay_suppression = Column(Boolean, default=False)
    suppression_armed = Column(Boolean, default=False)
    system_lockdown = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
