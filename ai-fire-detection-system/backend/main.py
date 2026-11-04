"""
AI-BASED SMART FIRE DETECTION AND PREVENTION SYSTEM USING IoT & ML
Backend Server: FastAPI + SQLite + Machine Learning Inference Engine
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base, SessionLocal
from models.models import User, PreventionActuatorState, SensorData, Alert
from routes.auth_routes import router as auth_router, hash_pw
from routes.sensor_routes import router as sensor_router
from routes.alert_routes import router as alert_router
from routes.prevention_routes import router as prevention_router

# Initialize all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Smart Fire Detection & Prevention API",
    description="IoT telemetry ingestion for ESP32, real-time ML fire risk classification, and prevention control API.",
    version="1.0.0"
)

# Enable CORS for React Vite frontend and IoT devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_populate():
    """Seed initial administrator and actuator defaults if database is newly created."""
    db = SessionLocal()
    try:
        # Check users
        if not db.query(User).filter(User.username == "admin").first():
            admin_user = User(
                username="admin",
                email="admin@fireprevention.iot",
                hashed_password=hash_pw("admin123"),
                full_name="Lead Fire Safety Architect",
                role="ADMIN"
            )
            op_user = User(
                username="operator",
                email="operator@fireprevention.iot",
                hashed_password=hash_pw("operator123"),
                full_name="Duty Control Officer",
                role="OPERATOR"
            )
            db.add_all([admin_user, op_user])

        # Check actuator state
        if not db.query(PreventionActuatorState).first():
            state = PreventionActuatorState(
                buzzer_active=False,
                relay_exhaust_fan=False,
                relay_suppression=False,
                suppression_armed=False,
                system_lockdown=False
            )
            db.add(state)

        # Check sensor initial readings
        if db.query(SensorData).count() == 0:
            sample_readings = [
                SensorData(
                    device_id="ESP32-DEVICE-01",
                    temperature=24.5,
                    humidity=52.0,
                    smoke_ppm=65.0,
                    flame_detected=False,
                    flame_raw=940,
                    fire_risk="NORMAL",
                    risk_score=12.0,
                    is_simulated=True
                ),
                SensorData(
                    device_id="ESP32-DEVICE-01",
                    temperature=26.2,
                    humidity=48.0,
                    smoke_ppm=185.0,
                    flame_detected=False,
                    flame_raw=780,
                    fire_risk="WARNING",
                    risk_score=42.0,
                    is_simulated=True
                )
            ]
            db.add_all(sample_readings)

        db.commit()
    finally:
        db.close()

# Mount API Routers
app.include_router(auth_router)
app.include_router(sensor_router)
app.include_router(alert_router)
app.include_router(prevention_router)

@app.get("/")
def root():
    return {
        "system": "AI-Based Smart Fire Detection and Prevention System",
        "status": "ONLINE",
        "documentation": "/docs",
        "esp32_endpoint": "/api/sensor/readings",
        "ml_inference": "/api/sensor/predict"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
