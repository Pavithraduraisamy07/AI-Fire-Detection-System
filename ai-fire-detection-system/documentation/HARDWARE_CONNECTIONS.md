# ESP32 IoT Fire Detection & Prevention Hardware Connections Guide

## 1. Bill of Materials (BOM)

| Component | Specification | Function |
| :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32 (38-pin or 30-pin) | Core processor, WiFi connectivity, ADC sampling |
| **Temperature/Humidity** | DHT11 / DHT22 Sensor module | Ambient thermal & moisture monitoring |
| **Smoke/Gas Sensor** | MQ-2 Combustible Gas & Smoke Sensor | Ionization / chemical gas detection (LPG, Propane, Methane, Smoke) |
| **Flame Sensor** | YG1006 Infrared Flame Sensor module (760nm - 1100nm) | Instant line-of-sight optical combustion detection |
| **Acoustic Alarm** | 5V Active Piezo Buzzer | Local auditory evacuation alarm |
| **Actuator Relays** | 2-Channel 5V Relay Module (Optocoupler isolated) | Switching 12V/240V ventilation fan and solenoid valves |
| **Power Supply** | 5V 2A DC Power Adapter | Powering ESP32 and sensor heating coils |

---

## 2. Complete ESP32 GPIO Pinout Table

| Sensor / Actuator | Sensor Pin | ESP32 Pin | Logic Level | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **DHT11** | VCC | 3.3V / 5V | Power | Include 10kΩ pull-up between DATA and VCC if bare sensor |
| | GND | GND | Ground | Common ground |
| | DATA | **GPIO 4** | Digital I/O | Reads ambient temperature (°C) & humidity (%) |
| **MQ-2 Smoke** | VCC | 5V (VIN) | Power | MQ-2 internal heater requires 5V ~150mA |
| | GND | GND | Ground | Common ground |
| | AOUT (Analog) | **GPIO 34** | ADC Input (0-3.3V) | *Important: Use voltage divider (10k / 20k) if MQ-2 output > 3.3V* |
| | DOUT (Digital) | Not connected / GPIO 33 | Optional | Digital trigger threshold |
| **Flame Sensor** | VCC | 3.3V | Power | Safe with ESP32 3.3V rails |
| | GND | GND | Ground | Common ground |
| | DO (Digital) | **GPIO 14** | Digital Input | Active LOW: Output drops to 0V when fire is detected |
| | AO (Analog) | **GPIO 35** | ADC Input | Raw analog IR intensity reading (0-4095) |
| **Active Buzzer** | VCC (+) | **GPIO 26** | Digital Output | Transistor driver recommended (e.g. 2N2222) for loud sound |
| | GND (-) | GND | Ground | Common ground |
| **Relay 1 (Exhaust Fan)** | IN1 | **GPIO 27** | Digital Output | Active LOW: Switches on smoke extraction ventilation |
| **Relay 2 (Solenoid Valve)**| IN2 | **GPIO 32** | Digital Output | Active LOW: Triggers suppression valve under software interlock |
| **Relay Module Power** | VCC / JD-VCC | 5V (VIN) | Power | External 5V rail for relay coils |
| | GND | GND | Ground | Shared system ground |

---

## 3. Critical Fire Safety Advisory & Prevention Classifications

> **WARNING — LIFE & ASSET PROTECTION PROTOCOL:**
> **Never activate an automated liquid suppression system without hardware safeguards, human interlocks, and fire class classification.**

### Fire Classes & Appropriate Extinguishing Agents:

1. **Class A (Ordinary Combustibles - Wood, Paper, Fabric, Plastics):**
   - **Allowed Agent:** Pressurized Water, Water Mist, Multi-purpose ABC Dry Powder.
   - **Mechanism:** Cooling combustion zone below ignition temperature.

2. **Class B (Flammable Liquids - Gasoline, Alcohol, Solvents, Oil):**
   - **PROHIBITED AGENT: WATER.** Spraying water will boil instantly, causing explosive fuel splatter (slop-over) and spreading the flame across the room.
   - **Mandated Agent:** Carbon Dioxide (CO2), AFFF Foam, Clean Agents (FM-200, Novec 1230).

3. **Class C (Energized Electrical Equipment - Server Racks, Transformers, Distribution Panels):**
   - **PROHIBITED AGENT: WATER.** Water conducts electricity, causing catastrophic short circuits, electrical fires, and lethal electrocution hazards for occupants and firefighters.
   - **Mandated Agent:** Clean Agent Gas (FK-5-1-12 / FM-200), CO2 gas, ABC Dry Chemical. Main power breaker MUST be interlocked to trip before any sprinkler activation.

4. **Class D (Combustible Metals - Lithium, Magnesium, Titanium, Sodium):**
   - **PROHIBITED AGENT: WATER.** Water reacts violently with burning alkali metals to release hydrogen gas, generating severe explosive blasts.
   - **Mandated Agent:** Specialized Class D dry powder (Sodium Chloride, Copper-based powder).

5. **Class K / F (Commercial Kitchen Cooking Oils & Grease Fryers):**
   - **PROHIBITED AGENT: WATER.** Adding water to burning grease produces a massive grease fireball.
   - **Mandated Agent:** Wet Chemical Potassium Acetate extinguisher.

---

## 4. Hardware Verification & Calibration Steps

1. **MQ-2 Burn-in Period:** MQ-2 requires an initial 24-48 hour pre-heat burn-in period to stabilize its tin dioxide (SnO2) sensing element.
2. **Flame Sensor Sensitivity Trimmer:** Rotate the onboard potentiometer until the digital LED turns OFF in ambient room light and turns ON when exposed to a small lighter or match flame at 1-2 meters.
3. **Common Ground:** Ensure ESP32 GND and External 5V Relay Power Supply GND are tied together to avoid floating ground trigger issues.
