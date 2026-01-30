# Sat-Fusion-AI: Sovereign Geospatial Intelligence Agent

## 🚀 Overview
Sat-Fusion-AI is an autonomous agent capable of fusing sovereign **ISRO** satellite data (LISS-IV, Cartosat) with global archives (**Sentinel, Landsat**). It solves the "Resolution-Revisit Trade-off" by intelligently selecting and merging data sources based on the user's need (e.g., "See through clouds" via SAR, or "See farm boundaries" via High-Res Optical).

---

## 🛠️ How to Run the System

You need to run **two terminals** simultaneously: one for the Frontend (React) and one for the Backend (Python FastAPI).

### Terminal 1: The Backend (The Brain)
This runs the Python Agent, Fusion Engine, and Data Connectors.
```bash
# 1. Navigate to the project folder
cd d:\hackathons\unity\uniearth

# 2. Install Dependencies (First time only)
pip install -r backend/requirements.txt

# 3. Start the Server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
*Wait until you see:* `Application startup complete.`

### Terminal 2: The Frontend (The Dashboard)
This runs the React UI.
```bash
# 1. Navigate to project folder
cd d:\hackathons\unity\uniearth

# 2. Install Node Dependencies (First time only)
npm install

# 3. Start the UI
npm run dev
```
*Open your browser at:* `http://localhost:8080` (or the port shown in terminal).

---

## 🚦 System Status: Real vs. Mocked

| Component | Status | Real-Time? | Description |
| :--- | :--- | :--- | :--- |
| **Agent Core (Brain)** | ✅ **LIVE** | **YES** | The "Reasoning Loop" (ReAct) is real. It analyzes your text and decides which tools to call. |
| **ISRO Connector** | ✅ **LIVE** | **YES** | It really connects to `isro-bhuvan` WMS logic and identifies available layers. |
| **Sentinel/Landsat** | ✅ **LIVE** | **YES** | It executes logic to query the Microsoft Planetary Computer API (Free Tier). |
| **Health Check** | ✅ **LIVE** | **YES** | The "Fusion Engine: ONLINE" badge on the UI checks the server every 30s. |
| **Fusion Math** | ✅ **LIVE** | **YES** | The algorithms (Brovey, HSV) are implemented in `backend/fusion`. |
| **Image Downloading** | ⚠️ **MOCKED** | **NO** | We do not download the actual 500MB+ images yet. The system returns metadata links. |
| **Fusion Output** | ⚠️ **MOCKED** | **NO** | The "Fusion Job" runs logically but returns a JSON success message, not a generated GeoTIFF file. |

## 🧠 Key Features to Try
1.  **Ask the Agent:** Click "Ask Agent" in the header and type *"Assess flood damage in Assam"* -> Watch it decide to use SAR (Radar).
2.  **Health Check:** Stop the backend (`Ctrl+C`) and watch the UI badge turn RED. Start it again, and it turns GREEN.