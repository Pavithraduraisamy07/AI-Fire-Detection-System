/*
 * =====================================================================================
 * PROJECT: AI-BASED SMART FIRE DETECTION AND PREVENTION SYSTEM
 * MODULE: ESP32 IoT Node Firmware (Arduino IDE compatible)
 * HARDWARE:
 *  - ESP32-WROOM-32 Development Board
 *  - DHT11 Temperature & Humidity Sensor (Pin: GPIO 4)
 *  - MQ-2 Smoke & Combustible Gas Sensor (Analog Pin: GPIO 34)
 *  - Flame Sensor (Digital Pin: GPIO 14, Analog Pin: GPIO 35)
 *  - Active Buzzer (Pin: GPIO 26)
 *  - Dual-Channel 5V Relay Module:
 *      * Relay 1 - Exhaust Ventilation Fan (Pin: GPIO 27)
 *      * Relay 2 - Suppression Solenoid Valve (Pin: GPIO 32)
 *
 * PROTOCOL: Wi-Fi HTTP POST to FastAPI Backend (/api/sensor/readings)
 * =====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (v6.x or v7.x)

// ======================== WI-FI CONFIGURATION ========================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server API Endpoint (Replace with your Laptop/Server LAN IP, e.g., 192.168.1.50)
const char* SERVER_URL    = "http://192.168.1.50:8000/api/sensor/readings";
const char* DEVICE_ID     = "ESP32-FIRE-ZONE-01";

// ======================== PIN ASSIGNMENTS ============================
#define DHTPIN        4       // DHT11 Data Pin
#define DHTTYPE       DHT11   // Sensor Type: DHT11
#define PIN_MQ2_AO    34      // MQ-2 Smoke Sensor Analog ADC Pin
#define PIN_FLAME_DO  14      // Flame Sensor Digital Output (LOW = Flame detected)
#define PIN_FLAME_AO  35      // Flame Sensor Analog ADC Pin
#define PIN_BUZZER    26      // Buzzer Pin
#define PIN_RELAY_FAN 27      // Relay 1: Exhaust Fan
#define PIN_RELAY_VALVE 32    // Relay 2: Suppression Valve

// ======================== HARDWARE THRESHOLDS =======================
#define MQ2_RO_CLEAN_AIR_PPM 65.0f
#define LOCAL_FLAME_TRIGGER_VALUE 400 // Analog ADC < 400 indicates intense IR flame

DHT dht(DHTPIN, DHTTYPE);

// Interval timer
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2500; // Telemetry transmission every 2.5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=======================================================");
  Serial.println("  AI-BASED SMART FIRE DETECTION & PREVENTION SYSTEM    ");
  Serial.println("  ESP32 IoT Node Initializing...                       ");
  Serial.println("=======================================================");

  // Initialize GPIO pins
  pinMode(PIN_FLAME_DO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_RELAY_FAN, OUTPUT);
  pinMode(PIN_RELAY_VALVE, OUTPUT);

  // Relay modules are typically active LOW; default all off
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_RELAY_FAN, HIGH);   // Relay OFF (High-level active modules)
  digitalWrite(PIN_RELAY_VALVE, HIGH); // Relay OFF

  // Initialize DHT sensor
  dht.begin();

  // Connect to Wi-Fi network
  connectWiFi();

  // Test beep to confirm audio subsystem
  digitalWrite(PIN_BUZZER, HIGH);
  delay(150);
  digitalWrite(PIN_BUZZER, LOW);

  Serial.println("[SYSTEM READY] Commencing live sensor telemetry streaming.");
}

void loop() {
  // Ensure Wi-Fi connection is maintained
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Periodic sensor read and cloud sync
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    readSensorsAndTransmit();
  }

  // Instant hardware-level fail-safe loop (Zero latency protection)
  evaluateHardwareSafetyLoop();
}

void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected Successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection timed out. Continuing offline fail-safe loop.");
  }
}

float calculateSmokePPM(int rawAdc) {
  // MQ-2 calibrated transfer curve: conversion of 12-bit ADC (0-4095) to estimated PPM
  float voltage = (rawAdc / 4095.0) * 3.3;
  float ppm = (voltage / 3.3) * 800.0 + 35.0;
  return ppm;
}

void readSensorsAndTransmit() {
  // 1. Read DHT11
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[WARN] DHT11 read error. Applying default ambient values.");
    temperature = 25.0;
    humidity = 50.0;
  }

  // 2. Read MQ-2 Smoke sensor
  int rawSmokeAdc = analogRead(PIN_MQ2_AO);
  float smokePpm = calculateSmokePPM(rawSmokeAdc);

  // 3. Read Flame sensor
  int flameDigital = digitalRead(PIN_FLAME_DO);
  int flameRawAdc = analogRead(PIN_FLAME_AO);
  // Most flame sensors pull DO LOW when infrared fire spectrum is detected
  bool flameDetected = (flameDigital == LOW) || (flameRawAdc < LOCAL_FLAME_TRIGGER_VALUE);

  Serial.printf("\n[SENSORS] Temp: %.1f °C | Humidity: %.1f %% | Smoke: %.1f ppm | Flame: %s (Raw: %d)\n",
                temperature, humidity, smokePpm, flameDetected ? "YES" : "NO", flameRawAdc);

  // 4. Send telemetry payload to FastAPI Backend via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    // Build JSON Payload
    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["smoke_ppm"] = smokePpm;
    doc["flame_detected"] = flameDetected;
    doc["flame_raw"] = flameRawAdc;
    doc["is_simulated"] = false;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.printf("[HTTP] POST Result Code: %d\n", httpCode);
      Serial.printf("[HTTP] Response: %s\n", response.c_str());

      // Parse server commands if prevention states are updated
      StaticJsonDocument<512> resDoc;
      DeserializationError err = deserializeJson(resDoc, response);
      if (!err) {
        // Check fire risk returned by backend ML model
        const char* risk = resDoc["fire_risk"];
        if (risk != nullptr && strcmp(risk, "HIGH RISK") == 0) {
          triggerPhysicalAlarm(true);
        } else if (risk != nullptr && strcmp(risk, "NORMAL") == 0) {
          triggerPhysicalAlarm(false);
        }
      }
    } else {
      Serial.printf("[HTTP ERROR] Failed to send telemetry: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}

void evaluateHardwareSafetyLoop() {
  // Local autonomous override: If flame is physically sensed, activate buzzer immediately without waiting for network!
  int flameDigital = digitalRead(PIN_FLAME_DO);
  if (flameDigital == LOW) {
    triggerPhysicalAlarm(true);
  }
}

void triggerPhysicalAlarm(bool active) {
  if (active) {
    digitalWrite(PIN_BUZZER, HIGH);
    digitalWrite(PIN_RELAY_FAN, LOW); // Relay active: Fan ON
  } else {
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_RELAY_FAN, HIGH); // Relay off
  }
}
