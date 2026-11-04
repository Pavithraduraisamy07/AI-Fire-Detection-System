import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  SensorReading,
  AlertItem,
  RiskLevel,
  UserProfile,
  PreventionState,
  SystemThresholds,
  IoTDevice
} from '../types';
import { predictFireRisk, generateHistoricalReadings } from '../utils/mlEngine';
import { buzzerAudio } from '../utils/audio';

interface AppContextType {
  // Auth
  user: UserProfile | null;
  login: (username: string, role?: 'ADMIN' | 'OPERATOR') => void;
  logout: () => void;

  // Sensor telemetry
  currentReading: SensorReading;
  historyReadings: SensorReading[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  refreshRateMs: number;
  setRefreshRateMs: (rate: number) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  // Manual stimulus injection for testing
  injectStimulus: (scenario: 'NORMAL' | 'SMOKE' | 'FLAME' | 'OVERHEAT' | 'EXTREME_FIRE') => void;

  // Actuator Prevention
  prevention: PreventionState;
  toggleBuzzer: (active?: boolean) => void;
  toggleExhaustFan: (active?: boolean) => void;
  toggleSuppressionArmed: (armed?: boolean) => void;
  triggerSuppressionValve: () => { success: boolean; message: string };
  emergencyStopAll: () => void;

  // Sound
  isMuted: boolean;
  toggleMute: () => void;

  // Alerts
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, notes?: string) => void;
  clearResolvedAlerts: () => void;

  // Devices
  devices: IoTDevice[];
  activeDevice: IoTDevice;
  setActiveDevice: (device: IoTDevice) => void;

  // Threshold settings
  thresholds: SystemThresholds;
  updateThresholds: (newThresholds: Partial<SystemThresholds>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  username: 'admin',
  email: 'admin@fireprevention.iot',
  full_name: 'Lead Fire Safety Architect',
  role: 'ADMIN',
  token: 'mock-jwt-token-admin'
};

const DEFAULT_THRESHOLDS: SystemThresholds = {
  temp_warning: 45,
  temp_critical: 58,
  smoke_warning: 250,
  smoke_critical: 450,
  humidity_low_warning: 25,
  buzzer_on_warning: false,
  auto_ventilation_enabled: true,
  auto_suppression_enabled: false
};

const DEFAULT_DEVICE: IoTDevice = {
  id: 'ESP32-FIRE-ZONE-01',
  name: 'Zone A - Main Electrical & Server Vault',
  location: 'Building 4, Sector 2',
  ip_address: '192.168.1.50',
  mac_address: '24:6F:28:B4:9C:12',
  status: 'ONLINE',
  last_seen: 'Just now',
  firmware_version: 'v2.4.1-esp32',
  sensor_count: 4
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state - defaults to null so the user sees the dedicated Login Page on startup
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fire_safety_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [refreshRateMs, setRefreshRateMs] = useState<number>(2000);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Prevention state
  const [prevention, setPrevention] = useState<PreventionState>({
    buzzer_active: false,
    buzzer_auto_mode: true,
    relay_exhaust_fan: false,
    relay_suppression: false,
    suppression_armed: false,
    system_lockdown: false
  });

  // Thresholds
  const [thresholds, setThresholds] = useState<SystemThresholds>(() => {
    const saved = localStorage.getItem('fire_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  // Devices
  const [devices] = useState<IoTDevice[]>([
    DEFAULT_DEVICE,
    {
      id: 'ESP32-FIRE-ZONE-02',
      name: 'Zone B - Chemical Storage & Flammables',
      location: 'Warehouse Dock 3',
      ip_address: '192.168.1.52',
      mac_address: '24:6F:28:C2:5E:88',
      status: 'ONLINE',
      last_seen: '2 mins ago',
      firmware_version: 'v2.4.1-esp32',
      sensor_count: 4
    },
    {
      id: 'ESP32-FIRE-ZONE-03',
      name: 'Zone C - Cafeteria Kitchen Exhaust',
      location: 'Level 1 Kitchen Annex',
      ip_address: '192.168.1.55',
      mac_address: '24:6F:28:D1:4A:23',
      status: 'ONLINE',
      last_seen: '45 secs ago',
      firmware_version: 'v2.4.0-esp32',
      sensor_count: 4
    }
  ]);
  const [activeDevice, setActiveDevice] = useState<IoTDevice>(DEFAULT_DEVICE);

  // History & current readings
  const [historyReadings, setHistoryReadings] = useState<SensorReading[]>(() => generateHistoricalReadings(24));

  const [currentReading, setCurrentReading] = useState<SensorReading>(() => {
    const prediction = predictFireRisk({
      temperature: 24.8,
      humidity: 53,
      smoke_ppm: 68,
      flame_detected: false
    });
    return {
      id: 'live-init',
      timestamp: new Date().toISOString(),
      temperature: 24.8,
      humidity: 53,
      smoke_ppm: 68,
      flame_detected: false,
      flame_raw: 940,
      fire_risk: prediction.risk_level,
      risk_score: prediction.risk_score,
      device_id: DEFAULT_DEVICE.id,
      is_simulated: true
    };
  });

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    return [
      {
        id: 'alt-prev-1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        device_id: DEFAULT_DEVICE.id,
        risk_level: 'WARNING',
        title: 'Elevated Smoke Reading - Smoldering Test',
        message: 'Smoke concentration spiked to 285 ppm in Zone A. Operator checked HVAC filter.',
        sensor_snapshot: {
          temperature: 32.4,
          humidity: 44,
          smoke_ppm: 285,
          flame_detected: false
        },
        acknowledged: true,
        resolved: true,
        resolved_at: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        notes: 'False trigger due to maintenance dust. Exhaust vented.'
      }
    ];
  });

  // Persistent user
  const login = (username: string, role: 'ADMIN' | 'OPERATOR' = 'ADMIN') => {
    const u: UserProfile = {
      id: `usr-${Date.now()}`,
      username,
      email: `${username}@fireprevention.iot`,
      full_name: username === 'admin' ? 'Lead Fire Safety Architect' : 'Duty Control Officer',
      role,
      token: `token_verified_${username}_${Date.now()}`
    };
    setUser(u);
    localStorage.setItem('fire_safety_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fire_safety_user');
  };

  const updateThresholds = (newThresholds: Partial<SystemThresholds>) => {
    setThresholds((prev) => {
      const updated = { ...prev, ...newThresholds };
      localStorage.setItem('fire_thresholds', JSON.stringify(updated));
      return updated;
    });
  };

  // Sound muting
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    buzzerAudio.setMuted(next);
  };

  // Actuators
  const toggleBuzzer = (active?: boolean) => {
    setPrevention((prev) => {
      const nextActive = active !== undefined ? active : !prev.buzzer_active;
      if (nextActive) {
        buzzerAudio.startAlertTone('critical');
      } else {
        buzzerAudio.stop();
      }
      return { ...prev, buzzer_active: nextActive, activated_at: new Date().toISOString() };
    });
  };

  const toggleExhaustFan = (active?: boolean) => {
    setPrevention((prev) => ({
      ...prev,
      relay_exhaust_fan: active !== undefined ? active : !prev.relay_exhaust_fan
    }));
  };

  const toggleSuppressionArmed = (armed?: boolean) => {
    setPrevention((prev) => {
      const nextArmed = armed !== undefined ? armed : !prev.suppression_armed;
      return {
        ...prev,
        suppression_armed: nextArmed,
        // If disarming, also shut off suppression relay
        relay_suppression: nextArmed ? prev.relay_suppression : false
      };
    });
  };

  const triggerSuppressionValve = (): { success: boolean; message: string } => {
    if (!prevention.suppression_armed) {
      return {
        success: false,
        message: 'SAFETY INTERLOCK BLOCKED: The physical Arming Safety Switch must be toggled ON before suppression relay can activate!'
      };
    }

    setPrevention((prev) => ({
      ...prev,
      relay_suppression: true,
      last_activation_reason: 'Manual emergency suppression actuation',
      activated_at: new Date().toISOString()
    }));

    return {
      success: true,
      message: 'SUPPRESSION RELAY 2 ACTIVATED: Solenoid valve engaged. Ensure Fire Class conforms to extinguishing agent!'
    };
  };

  const emergencyStopAll = () => {
    buzzerAudio.stop();
    setPrevention({
      buzzer_active: false,
      buzzer_auto_mode: true,
      relay_exhaust_fan: false,
      relay_suppression: false,
      suppression_armed: false,
      system_lockdown: false,
      last_activation_reason: 'Emergency Halt invoked by operator'
    });
  };

  // Alert management
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const resolveAlert = (alertId: string, notes = 'Resolved by operator') => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              resolved: true,
              resolved_at: new Date().toISOString(),
              notes
            }
          : a
      )
    );
  };

  const clearResolvedAlerts = () => {
    setAlerts((prev) => prev.filter((a) => !a.resolved));
  };

  // Manual stimulus injection for rapid testing
  const injectStimulus = useCallback((scenario: 'NORMAL' | 'SMOKE' | 'FLAME' | 'OVERHEAT' | 'EXTREME_FIRE') => {
    let t = 24.5;
    let h = 54;
    let s = 65;
    let f = false;
    let fRaw = 950;

    switch (scenario) {
      case 'NORMAL':
        t = 24.0 + Math.random();
        h = 52 + Math.random() * 4;
        s = 60 + Math.random() * 20;
        f = false;
        fRaw = 940;
        break;
      case 'SMOKE':
        t = 36.5;
        h = 38;
        s = 380;
        f = false;
        fRaw = 620;
        break;
      case 'FLAME':
        t = 48.0;
        h = 24;
        s = 290;
        f = true;
        fRaw = 180;
        break;
      case 'OVERHEAT':
        t = 65.5;
        h = 18;
        s = 210;
        f = false;
        fRaw = 720;
        break;
      case 'EXTREME_FIRE':
        t = 78.0;
        h = 14;
        s = 650;
        f = true;
        fRaw = 90;
        break;
    }

    const prediction = predictFireRisk({
      temperature: t,
      humidity: h,
      smoke_ppm: s,
      flame_detected: f,
      flame_raw: fRaw
    });

    const newReading: SensorReading = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      temperature: Number(t.toFixed(1)),
      humidity: Math.round(h),
      smoke_ppm: Math.round(s),
      flame_detected: f,
      flame_raw: fRaw,
      fire_risk: prediction.risk_level,
      risk_score: prediction.risk_score,
      device_id: activeDevice.id,
      is_simulated: true
    };

    setCurrentReading(newReading);
    setHistoryReadings((prev) => [...prev.slice(1), newReading]);

    // Handle automated safety responses
    handleRiskLevelResponse(prediction.risk_level, newReading);
  }, [activeDevice.id]);

  // Handle automated safety response when risk elevates
  const handleRiskLevelResponse = (risk: RiskLevel, reading: SensorReading) => {
    if (risk === 'HIGH RISK') {
      // Engage buzzer
      toggleBuzzer(true);

      // Auto ventilation if configured
      if (thresholds.auto_ventilation_enabled) {
        setPrevention((p) => ({ ...p, relay_exhaust_fan: true }));
      }

      // Generate alert if not already recently created
      setAlerts((prev) => {
        const lastAlert = prev[0];
        const isRecent = lastAlert && (Date.now() - new Date(lastAlert.timestamp).getTime() < 15000);
        if (isRecent && lastAlert.risk_level === 'HIGH RISK') {
          return prev;
        }

        const newAlert: AlertItem = {
          id: `alt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          device_id: reading.device_id,
          risk_level: 'HIGH RISK',
          title: 'HIGH RISK: COMBUSTION DETECTED',
          message: `Corroborated fire detection at ${reading.device_id}! Flame IR: ${reading.flame_detected ? 'ACTIVE' : 'NO'}, Smoke: ${reading.smoke_ppm} ppm, Temp: ${reading.temperature}°C.`,
          sensor_snapshot: {
            temperature: reading.temperature,
            humidity: reading.humidity,
            smoke_ppm: reading.smoke_ppm,
            flame_detected: reading.flame_detected
          },
          acknowledged: false,
          resolved: false
        };
        return [newAlert, ...prev];
      });
    } else if (risk === 'WARNING') {
      if (thresholds.buzzer_on_warning) {
        buzzerAudio.playSingleBeep(1200, 200);
      }
      setAlerts((prev) => {
        const lastAlert = prev[0];
        const isRecent = lastAlert && (Date.now() - new Date(lastAlert.timestamp).getTime() < 30000);
        if (isRecent) return prev;

        const newAlert: AlertItem = {
          id: `alt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          device_id: reading.device_id,
          risk_level: 'WARNING',
          title: 'WARNING: ABNORMAL SENSOR READINGS',
          message: `Elevated environmental indices in ${reading.device_id}. Smoke: ${reading.smoke_ppm} ppm, Temp: ${reading.temperature}°C. Inspect location.`,
          sensor_snapshot: {
            temperature: reading.temperature,
            humidity: reading.humidity,
            smoke_ppm: reading.smoke_ppm,
            flame_detected: reading.flame_detected
          },
          acknowledged: false,
          resolved: false
        };
        return [newAlert, ...prev];
      });
    } else {
      // Normal: stop buzzer if it was on auto mode
      if (prevention.buzzer_auto_mode && prevention.buzzer_active) {
        toggleBuzzer(false);
      }
    }
  };

  // Background streaming loop for Demo mode
  const streamIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      return;
    }

    streamIntervalRef.current = window.setInterval(() => {
      // Slight stochastic drift around current baseline
      setCurrentReading((prev) => {
        // If current state was high risk, slowly normalize unless injected
        const targetTemp = prev.temperature > 35 ? prev.temperature - 0.4 : 24.5 + (Math.random() * 2 - 1);
        const targetHum = prev.humidity < 40 ? prev.humidity + 0.3 : 52 + (Math.random() * 3 - 1.5);
        const targetSmoke = prev.smoke_ppm > 150 ? prev.smoke_ppm - 8 : 65 + (Math.random() * 15 - 7.5);
        const targetFlame = prev.smoke_ppm > 400 && prev.temperature > 50 ? prev.flame_detected : false;

        const prediction = predictFireRisk({
          temperature: targetTemp,
          humidity: targetHum,
          smoke_ppm: targetSmoke,
          flame_detected: targetFlame,
          flame_raw: targetFlame ? 160 : 930
        });

        const next: SensorReading = {
          id: `live-${Date.now()}`,
          timestamp: new Date().toISOString(),
          temperature: Number(targetTemp.toFixed(1)),
          humidity: Math.round(targetHum),
          smoke_ppm: Math.round(targetSmoke),
          flame_detected: targetFlame,
          flame_raw: targetFlame ? 160 : 930,
          fire_risk: prediction.risk_level,
          risk_score: prediction.risk_score,
          device_id: activeDevice.id,
          is_simulated: isDemoMode
        };

        setHistoryReadings((hist) => [...hist.slice(1), next]);
        return next;
      });
    }, refreshRateMs);

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isStreaming, refreshRateMs, isDemoMode, activeDevice.id]);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        currentReading,
        historyReadings,
        isDemoMode,
        setIsDemoMode,
        refreshRateMs,
        setRefreshRateMs,
        isStreaming,
        setIsStreaming,
        injectStimulus,
        prevention,
        toggleBuzzer,
        toggleExhaustFan,
        toggleSuppressionArmed,
        triggerSuppressionValve,
        emergencyStopAll,
        isMuted,
        toggleMute,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        clearResolvedAlerts,
        devices,
        activeDevice,
        setActiveDevice,
        thresholds,
        updateThresholds
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
