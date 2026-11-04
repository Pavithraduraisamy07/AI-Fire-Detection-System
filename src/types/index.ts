export type RiskLevel = 'NORMAL' | 'WARNING' | 'HIGH RISK';

export interface SensorReading {
  id: string;
  timestamp: string;
  temperature: number; // Celsius (°C)
  humidity: number; // Percentage (%)
  smoke_ppm: number; // Parts Per Million from MQ-2
  flame_detected: boolean; // Digital/Analog flame sensor IR detection
  flame_raw: number; // 0-1023 (lower means closer fire in IR sensor)
  fire_risk: RiskLevel;
  risk_score: number; // 0 to 100
  device_id: string;
  is_simulated: boolean;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  device_id: string;
  risk_level: RiskLevel;
  title: string;
  message: string;
  sensor_snapshot: {
    temperature: number;
    humidity: number;
    smoke_ppm: number;
    flame_detected: boolean;
  };
  acknowledged: boolean;
  resolved: boolean;
  resolved_at?: string;
  notes?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  location: string;
  ip_address: string;
  mac_address: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ALERT';
  last_seen: string;
  firmware_version: string;
  sensor_count: number;
}

export interface MLPredictionResult {
  risk_level: RiskLevel;
  confidence: number;
  risk_score: number;
  probabilities: {
    normal: number;
    warning: number;
    high_risk: number;
  };
  feature_importance: {
    flame: number;
    smoke: number;
    temperature: number;
    humidity: number;
  };
  decision_factors: string[];
  recommended_actions: string[];
}

export interface ModelMetrics {
  model_name: string;
  algorithm: string;
  dataset_size: number;
  train_samples: number;
  test_samples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    labels: string[];
    matrix: number[][]; // [actual][predicted]
  };
  feature_weights: {
    feature: string;
    importance: number;
  }[];
  training_timestamp: string;
}

export interface PreventionState {
  buzzer_active: boolean;
  buzzer_auto_mode: boolean;
  relay_exhaust_fan: boolean; // Relay 1
  relay_suppression: boolean; // Relay 2 (Solenoid / Sprinkler)
  suppression_armed: boolean; // Safety interlock flag
  system_lockdown: boolean;
  last_activation_reason?: string;
  activated_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  token: string;
}

export interface SystemThresholds {
  temp_warning: number; // °C (default: 45)
  temp_critical: number; // °C (default: 55)
  smoke_warning: number; // ppm (default: 300)
  smoke_critical: number; // ppm (default: 500)
  humidity_low_warning: number; // % (default: 25)
  buzzer_on_warning: boolean;
  auto_ventilation_enabled: boolean;
  auto_suppression_enabled: boolean;
}
