# AI Smart Fire Detection & Prevention System — REST API Documentation

Base URL: `http://localhost:8000` (FastAPI Swagger UI available at `http://localhost:8000/docs`)

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST /api/auth/register`
- **Request Body:**
```json
{
  "username": "fire_officer_01",
  "email": "officer@firestation.org",
  "password": "SecurePassword123!",
  "full_name": "Chief Safety Officer",
  "role": "ADMIN"
}
```
- **Response (200 OK):**
```json
{
  "id": 2,
  "username": "fire_officer_01",
  "email": "officer@firestation.org",
  "full_name": "Chief Safety Officer",
  "role": "ADMIN",
  "token": "token_bearer_2_..."
}
```

### 1.2 Login
- **Method:** `POST /api/auth/login`
- **Default Credentials:**
  - Admin: `admin` / `admin123`
  - Operator: `operator` / `operator123`
- **Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@fireprevention.iot",
  "full_name": "Lead Fire Safety Architect",
  "role": "ADMIN",
  "token": "token_bearer_1_verified_session"
}
```

---

## 2. IoT Sensor & ML Inference Endpoints

### 2.1 Ingest Telemetry from ESP32
- **Method:** `POST /api/sensor/readings`
- **Headers:** `Content-Type: application/json`
- **Request Body (from ESP32 or Simulator):**
```json
{
  "device_id": "ESP32-FIRE-ZONE-01",
  "temperature": 58.4,
  "humidity": 21.0,
  "smoke_ppm": 520.0,
  "flame_detected": true,
  "flame_raw": 190,
  "is_simulated": false
}
```
- **Response (200 OK):**
```json
{
  "id": 105,
  "device_id": "ESP32-FIRE-ZONE-01",
  "temperature": 58.4,
  "humidity": 21.0,
  "smoke_ppm": 520.0,
  "flame_detected": true,
  "flame_raw": 190,
  "fire_risk": "HIGH RISK",
  "risk_score": 92.5,
  "is_simulated": false,
  "created_at": "2026-11-03T06:45:00.000Z"
}
```

### 2.2 Direct Machine Learning Prediction
- **Method:** `POST /api/sensor/predict`
- **Request Body:**
```json
{
  "temperature": 45.0,
  "humidity": 30.0,
  "smoke_ppm": 290.0,
  "flame_detected": false
}
```
- **Response (200 OK):**
```json
{
  "risk_level": "WARNING",
  "confidence": 76.5,
  "risk_score": 48.0,
  "probabilities": {
    "normal": 0.18,
    "warning": 0.765,
    "high_risk": 0.055
  },
  "feature_importance": {
    "flame_sensor": 0.42,
    "smoke_mq2": 0.31,
    "temperature_dht11": 0.19,
    "humidity_dht11": 0.08
  },
  "decision_factors": [
    "Infrared flame sensor: No active flame spectrum detected.",
    "Elevated MQ-2 gas/smoke level 290.0 ppm",
    "Temperature elevated to 45.0°C"
  ],
  "recommended_actions": [
    "Dispatch inspection personnel to investigate smoke source.",
    "Stand by fire extinguishers (CO2 / ABC Dry Powder)."
  ]
}
```

### 2.3 Retrieve Model Evaluation Metrics
- **Method:** `GET /api/sensor/model-metrics`
- **Response (200 OK):**
```json
{
  "model_name": "Random Forest Fire Risk Classifier",
  "total_samples": 1000,
  "accuracy": 0.98,
  "precision": 0.978,
  "recall": 0.981,
  "f1_score": 0.98,
  "confusion_matrix": {
    "labels": ["NORMAL", "WARNING", "HIGH RISK"],
    "matrix": [
      [88, 0, 0],
      [0, 50, 4],
      [0, 0, 58]
    ]
  }
}
```

---

## 3. Alert Management Endpoints

### 3.1 Get Recent Alerts
- **Method:** `GET /api/alerts/?limit=50&unresolved_only=false`
- **Response (200 OK):** List of alert objects with timestamp and sensor snapshot.

### 3.2 Acknowledge Alert
- **Method:** `PUT /api/alerts/{alert_id}/acknowledge`

### 3.3 Resolve Alert
- **Method:** `PUT /api/alerts/{alert_id}/resolve?notes=Evacuated+and+extinguished`

---

## 4. Prevention Actuators Endpoints

### 4.1 Get Actuator Status
- **Method:** `GET /api/prevention/status`
- **Response:**
```json
{
  "buzzer_active": false,
  "relay_exhaust_fan": false,
  "relay_suppression": false,
  "suppression_armed": false,
  "system_lockdown": false
}
```

### 4.2 Actuator Control (Manual & Autonomous)
- **Method:** `POST /api/prevention/control`
- **Request Body:**
```json
{
  "buzzer_active": true,
  "relay_exhaust_fan": true,
  "suppression_armed": true,
  "relay_suppression": false,
  "reason": "Operator tested exhaust fan ventilation"
}
```

### 4.3 Emergency Stop (Failsafe)
- **Method:** `POST /api/prevention/emergency-stop`
- **Response:** Disengages all relays and alarms immediately.
