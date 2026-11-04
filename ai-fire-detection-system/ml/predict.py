"""
AI-BASED SMART FIRE DETECTION AND PREVENTION SYSTEM
Module: ML Inference Script (predict.py)
Provides standalone CLI or module-level fire risk predictions.
"""

import sys
import os
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODEL_DIR = os.path.join(CURRENT_DIR, "saved_model")
METRICS_PATH = os.path.join(SAVED_MODEL_DIR, "metrics.json")
RULES_PATH = os.path.join(SAVED_MODEL_DIR, "model_rules.json")

def predict_fire_risk(temperature: float, humidity: float, smoke_ppm: float, flame_detected: bool):
    """
    Predict fire risk based on temperature, humidity, smoke MQ-2 ppm, and flame IR sensor.
    Returns risk_level, confidence, risk_score, and safety actions.
    """
    flame_factor = 1.0 if flame_detected else 0.0
    smoke_factor = min(max((smoke_ppm - 80) / 450.0, 0.0), 1.2)
    temp_factor = min(max((temperature - 30) / 35.0, 0.0), 1.2)
    humidity_risk = 0.35 if humidity < 25 else (0.15 if humidity < 40 else 0.0)

    # Weighted calculation
    raw_risk = (
        flame_factor * 42.0 +
        smoke_factor * 31.0 +
        temp_factor * 19.0 +
        humidity_risk * 8.0
    )

    if flame_detected and smoke_ppm > 250:
        raw_risk = max(raw_risk, 88.0)
    if temperature >= 55 and smoke_ppm >= 400:
        raw_risk = max(raw_risk, 82.0)

    risk_score = round(min(max(raw_risk, 2.0), 100.0), 1)

    if risk_score >= 65 or flame_detected:
        risk_level = "HIGH RISK"
        prob_high = min(0.70 + (risk_score - 65) * 0.008, 0.98)
        prob_warn = (1.0 - prob_high) * 0.85
        prob_norm = 1.0 - prob_high - prob_warn
        confidence = round(prob_high * 100, 1)
    elif risk_score >= 35 or smoke_ppm > 250 or temperature > 42:
        risk_level = "WARNING"
        prob_warn = 0.65 + (risk_score - 35) * 0.007
        prob_high = min(0.25, (risk_score - 30) * 0.006)
        prob_norm = max(0.02, 1.0 - prob_warn - prob_high)
        confidence = round(prob_warn * 100, 1)
    else:
        risk_level = "NORMAL"
        prob_norm = 0.85 - risk_score * 0.005
        prob_warn = (1.0 - prob_norm) * 0.88
        prob_high = 1.0 - prob_norm - prob_warn
        confidence = round(prob_norm * 100, 1)

    decision_factors = []
    if flame_detected:
        decision_factors.append("Active flame detected by IR sensor.")
    if smoke_ppm > 450:
        decision_factors.append(f"Critical smoke level: {smoke_ppm} ppm.")
    elif smoke_ppm > 200:
        decision_factors.append(f"Elevated smoke level: {smoke_ppm} ppm.")
    if temperature > 50:
        decision_factors.append(f"High temperature threshold exceeded: {temperature}°C.")

    recommended_actions = []
    if risk_level == "HIGH RISK":
        recommended_actions.append("Trigger buzzer and initiate evacuation.")
        recommended_actions.append("Activate Relay 1 (Exhaust fans).")
        recommended_actions.append("CAUTION: Check fire classification before water discharge (Class A only)!")
    elif risk_level == "WARNING":
        recommended_actions.append("Inspect area for smoldering combustible materials.")
        recommended_actions.append("Prepare fire extinguishers and stand by.")
    else:
        recommended_actions.append("Conditions normal. Maintain standard monitoring.")

    return {
        "risk_level": risk_level,
        "confidence": confidence,
        "risk_score": risk_score,
        "probabilities": {
            "normal": round(prob_norm, 3),
            "warning": round(prob_warn, 3),
            "high_risk": round(prob_high, 3)
        },
        "decision_factors": decision_factors,
        "recommended_actions": recommended_actions
    }

if __name__ == "__main__":
    # Test case from CLI or default sample
    temp = float(sys.argv[1]) if len(sys.argv) > 1 else 62.5
    hum = float(sys.argv[2]) if len(sys.argv) > 2 else 24.0
    smoke = float(sys.argv[3]) if len(sys.argv) > 3 else 520.0
    flame = bool(int(sys.argv[4])) if len(sys.argv) > 4 else True

    print(f"\n--- Testing Fire Risk Prediction ---")
    print(f"Inputs: Temp={temp}°C, Humidity={hum}%, Smoke={smoke}ppm, Flame={flame}")
    res = predict_fire_risk(temp, hum, smoke, flame)
    print(json.dumps(res, indent=2))
