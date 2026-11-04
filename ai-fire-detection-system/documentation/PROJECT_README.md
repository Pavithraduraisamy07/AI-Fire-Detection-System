# AI-Based Smart Fire Detection and Prevention System Using IoT and Machine Learning

An end-to-end mission-critical cyber-physical system combining ESP32 IoT telemetry, Machine Learning fire risk inference, automated actuator prevention (ventilation, buzzer alarm, and safety-interlocked suppression), and a real-time web dashboard.

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 20.04+)
- **Python:** **Python 3.10.x or Python 3.11.x** (64-bit)
- **Node.js:** **Node.js v18.x, v20.x, or v22.x LTS**
- **npm:** **npm v9.x or v10.x**
- **IDE:** Visual Studio Code (Recommended extensions: Python, ESLint, Tailwind CSS IntelliSense)
- **Microcontroller Toolchain:** Arduino IDE 2.x with ESP32 Board Support package

---

## 2. Directory Structure

```text
ai-fire-detection-system/
│
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/           # Reusable UI widgets, Navbar, Sidebar
│   │   ├── context/              # State management for IoT & Prevention controls
│   │   ├── views/                # Dashboard, Live Monitoring, ML Prediction, Alerts, Analytics
│   │   ├── utils/                # Audio Synthesizer, ML Engine, JSZip Bundler
│   │   └── types/                # Strict TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── backend/                      # Python FastAPI REST API Backend
│   ├── app/
│   ├── database/                 # SQLite database engine (db.py)
│   ├── models/                   # SQLAlchemy models (models.py) & Pydantic schemas (schemas.py)
│   ├── routes/                   # Auth, Sensor Telemetry, Alerts, Prevention controls
│   ├── services/                 # ML Inference service & scoring
│   ├── main.py                   # FastAPI server entry point
│   └── requirements.txt          # Python dependencies
│
├── ml/                           # Machine Learning Pipeline
│   ├── dataset/                  # 1,000+ IoT fire sensor dataset (fire_sensor_data.csv)
│   ├── train_model.py            # Train & evaluate Random Forest / Decision Tree model
│   ├── predict.py                # Standalone CLI and programmatic prediction runner
│   └── saved_model/              # Saved model weights & evaluation metrics.json
│
├── esp32/                        # ESP32 Firmware
│   └── fire_detection_esp32.ino  # Production Arduino C++ code for WiFi + Sensors + Relays
│
├── documentation/                # Complete technical manuals
│   ├── PROJECT_README.md         # Full project execution manual
│   ├── API_DOCUMENTATION.md      # OpenAPI / REST API schemas & testing
│   └── HARDWARE_CONNECTIONS.md   # Pinouts, circuit schematics, and fire class safety rules
│
├── start_project.bat             # One-click Windows starter script
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Step-by-Step Installation & Run Guide (Windows 10/11)

### Option A: One-Click Startup (Recommended for Windows)

Simply double-click `start_project.bat` in the root folder, or execute via PowerShell / Command Prompt:
```cmd
cd ai-fire-detection-system
start_project.bat
```
This batch script will automatically:
1. Verify Python & Node.js environments.
2. Create Python virtual environment (`backend/venv`).
3. Install backend dependencies from `requirements.txt`.
4. Train the ML model and compute evaluation metrics.
5. Initialize the SQLite database.
6. Install frontend packages (`npm install`).
7. Spawn the FastAPI backend on `http://localhost:8000` and Vite frontend on `http://localhost:3000` in separate consoles.

---

### Option B: Manual Step-by-Step Execution

#### Step 1: Backend Setup & ML Training
Open a terminal in `backend/`:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Train the Machine Learning model:
```bash
cd ../ml
python train_model.py
cd ../backend
```

Run the FastAPI Backend server:
```bash
python main.py
```
> Server starts at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

#### Step 2: Frontend Setup
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
> Frontend launches at `http://localhost:3000`.

---

## 4. Default Demo Login Credentials

- **Admin Account:**
  - **Username:** `admin`
  - **Password:** `admin123`
  - **Permissions:** Full control over actuator relays, threshold adjustments, emergency stops, alert resolutions.

- **Operator Account:**
  - **Username:** `operator`
  - **Password:** `operator123`
  - **Permissions:** Live sensor telemetry view, alert acknowledgement, manual fan test.

---

## 5. ESP32 Hardware Deployment Guide

1. Open Arduino IDE 2.0+.
2. Install the **ESP32 by Espressif Systems** board package (`Tools -> Board -> Boards Manager`).
3. Install the required libraries via `Sketch -> Include Library -> Manage Libraries`:
   - `DHT sensor library` (Adafruit)
   - `ArduinoJson` (Benoit Blanchon, v6 or v7)
4. Open `esp32/fire_detection_esp32.ino`.
5. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `SERVER_URL` with your local network settings.
6. Select Board **ESP32 Dev Module** and the appropriate COM Port.
7. Click **Upload**. Open Serial Monitor at **115200 baud** to view live sensor telemetry streaming to your backend server!

---

## 6. Fire Prevention Protocol & Safety Interlocks

- **Multi-Sensor Voting Logic:** A physical fire requires corroborated signals. Optical IR flame detection carries 42% weight, MQ-2 smoke carries 31%, thermal surge carries 19%, and dry air carries 8%.
- **Zero Latency Hardware Failsafe:** The ESP32 firmware executes a local hardware loop that sounds the buzzer immediately if optical flame is detected, even if Wi-Fi network latency occurs.
- **Safety Armed Interlock:** The automated liquid fire suppression solenoid valve cannot be triggered unless the physical safety arm switch is toggled ON.
- **Fire Class Classification Rules:** Water suppression is strictly limited to Class A fires (wood/paper). Water is strictly prohibited on electrical (Class C) and flammable liquid (Class B) fires.

---

## 7. Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`python: command not found`** | Python not added to system PATH | Reinstall Python 3.10/3.11 with "Add Python to PATH" checked. |
| **`npm ERR! code ENOENT`** | Node.js not installed | Install Node.js LTS from https://nodejs.org. |
| **ESP32 fails to connect to WiFi** | 5 GHz network selected | ESP32 only supports 2.4 GHz Wi-Fi networks. Ensure 2.4 GHz SSID is used. |
| **ESP32 HTTP -1 error** | Backend IP inaccessible from ESP32 | Ensure PC and ESP32 are on the same Wi-Fi subnet; verify Windows Firewall allows port 8000. |
| **MQ-2 sensor reads 0 or false alarms** | MQ-2 requires preheating | Let MQ-2 run for 5-10 minutes to reach chemical equilibrium. |
