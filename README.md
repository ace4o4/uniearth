# Uniearth: Multi-Satellite Data Fusion Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Prototype-orange.svg)

**Uniearth** (powered by **Sat-Fusion-AI**) is a next-generation geospatial analysis platform designed to fuse multi-source Satellite data into a unified, cloud-free, and analysis-ready stream. It intelligently selects and merges sovereign **ISRO** satellite data (LISS-IV, Cartosat) with global archives (**Sentinel, Landsat**)..

---

## 🚀 Key Features

-   **Multi-Constellation Support**: Seamlessly query Sentinel-2, Landsat, and ISRO catalogues.
-   **Intelligent Data Fusion**:
    -   **Cloud Gap Filling**: Automatically replaces cloudy pixels.
    -   **Pan-Sharpening**: Enhances resolution by merging bands.
-   **Live Analysis Dashboard___**:
    -   Interactive map with time-slider controls.
    -   On-the-fly spectral index calculation (NDVI, NDWI).
-   **Sovereign AI Agent**: "Sat-Fusion-AI" agent that autonomously plans data retrieval strategies.

---

## 🚦 System Status: Real vs. Mocked

| Component | Status | Real-Time? | Description |
| :--- | :--- | :--- | :--- |
| **Agent Core** | ✅ **LIVE** | **YES** | The "Reasoning Loop" (ReAct) analyzes text and selects tools. |
| **ISRO Connector** | ✅ **LIVE** | **YES** | Connects to `isro-bhuvan` WMS logic. |
| **Sentinel/Landsat** | ✅ **LIVE** | **YES** | Queries Microsoft Planetary Computer / STAC APIs. |
| **Fusion Engine** | ✅ **LIVE** | **YES** | Visual simulation of blur/cloud removal is implemented. |

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance UI framework. |
| **Mapping** | MapLibre GL JS | 3D Maps with Vector Tile support. |
| **Backend** | FastAPI (Python) | High-speed async web framework. |
| **Data** | STAC API | SpatioTemporal Asset Catalog standard. |

---

## 🛠️ How to Run the System

You need to run **two terminals** simultaneously:

### Terminal 1: The Backend (The Brain)
```bash
cd backend
# Install Dependencies (First time only)
pip install -r requirements.txt

# Start the Server
python main.py
```
*Server runs at `http://localhost:8000`*

### Terminal 2: The Frontend (The Dashboard)
```bash
# Install Dependencies (First time only)
npm install

# Start the UI
npm run dev
```
*Dashboard runs at `http://localhost:5173`*

---

## 📡 API Reference

-   `POST /search`: Query for satellite scenes.
-   `POST /fuse`: Trigger fusion algorithms.
-   `GET /health`: Check system status.

---

**Team CYBER SOULZ** © 2026. Built for the Future of Earth Observation.
