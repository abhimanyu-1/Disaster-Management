# DisasterIQ — Enterprise Disaster Intelligence & Multi-Agent EOC Platform

An enterprise-grade, multimodal AI orchestration platform for rapid disaster reconnaissance, damage severity classification, geospatial operations, insurance/relief claims triage, and Human-in-the-Loop (HITL) verification.

---

## 🚀 Key Operational Views

The dashboard is organized into **7 Core Operational Command Views**:

1. **🛰️ Optical Recon & Damage Assessment (`/recon`)**
   - **Dual-Satellite Optical Viewer:** Before/After imagery comparison with `Split View`, `Curtain Slider`, and `Alpha Overlay` modes.
   - **Multi-Hazard Scenarios:** Earthquakes (Urban & Heritage), Floods (River Basin & Suburban), Agricultural Crop Inundation, Critical Bridge Infrastructure, False Positive roof shadows, and Cloud Occlusion Edge Cases.
   - **Bounding Box & Polygon Overlays:** Spatial damage localization and manual ROI drawing tool.
   - **HITL Verification Console:** Actionable human reviews (`Approve Relief`, `Order Field Inspection`, `Reject / Flag`, `Mark Uncertain`).
   - **Multi-Agent Telemetry Log:** Real-time visibility into Vision, Geo, Claim Fraud, and Priority agents.

2. **🗺️ Geospatial Tactical Ops (`/gis`)**
   - **Interactive Tactical Coordination Map:** Coordinate projection grid with sector zones (Alpha, Bravo, Charlie, Delta), severity-coded damage pins, and flood inundation polygons.
   - **Multi-Criteria Filtering:** Filter by Region (Americas, South Asia, Gulf Coast), Disaster Type, and Severity Level.
   - **Incident Inspector Drawer:** Click any map marker to view satellite thumbnails, GPS accuracy, claim status, and jump directly to Optical Recon.

3. **📋 Field Operations & Offline Resilience (`/field`)**
   - **Field Reconnaissance Log:** On-ground responder reports, structural integrity audits, GPS accuracy metadata, and photo evidence.
   - **Offline Mode Simulation:** Header toggle to simulate disconnected field operations.
   - **Local Queue & One-Click Sync:** Queues reports in local storage when offline; auto-increments sync counter; reconciles with central registry when reconnected.

4. **💳 Claims & Relief Triage (`/claims`)**
   - **Claims Registry:** Policyholder dossiers, claimed payout amounts, AI-verified loss estimates, and variance percentages.
   - **Fraud Risk Detection:** Discrepancy scoring protecting against over-claiming.
   - **Financial Workflow:** Fast-track approval, adjuster dispatch, and CSV manifest export.

5. **📊 Model Evaluation & Benchmarks (`/model`)**
   - **Segregated Benchmark Suite:** Evaluated against an annotated ground-truth test suite ($N=250$) strictly separated from operational data.
   - **Multi-Class Confusion Matrix:** 6x6 matrix (Destroyed, Major, Minor, No Damage, Crop Loss, Infrastructure Failure).
   - **Performance Scorecard:** Precision (91.8%), Recall (89.4%), F1-Score (90.6%), mAP @ 0.50 (88.2%), Accuracy (93.1%), and Latency breakdown (637ms average).
   - **Confidence Calibration Histogram:** Calibration curve validating probability accuracy.
   - **Edge Case Analysis:** Case studies on false positive roof shadow filtering and cloud occlusion handling.

6. **📜 Audit & Observability Telemetry (`/audit`)**
   - **Structured Event Timeline:** Real-time audit logs with timestamps, asset IDs, event types, and execution payloads.
   - **External Feed Ingestion Adapters:** Pluggable connector statuses for USGS ShakeMap, Copernicus Sentinel-2, Maxar OpenData, NOAA Flood, and Tactical UAV feeds.
   - **JSON Audit Export:** Cryptographically signed log export.

7. **🛡️ Architecture & Restricted Data Trust (`/arch`)**
   - **End-to-End Pipeline:** Visual representation of:
     $$\text{Ingestion} \longrightarrow \text{Private Inference} \longrightarrow \text{Geospatial Store} \longrightarrow \text{REST Gateway} \longrightarrow \text{EOC UI} \longrightarrow \text{HITL Review} \longrightarrow \text{Claims Dispatch}$$
   - **Restricted Data Boundary:** Local on-premise SQLite storage with zero citizen PII egress.
   - **Model Provider Abstraction:** Switch between Gemini 2.5 Flash, Local ONNX/TensorRT runtime, and Synthetic Benchmark stubs.

8. **📄 Official Disaster Assessment Dossier (`Export Dossier`)**
   - One-click generation of printable/PDF disaster assessment dossiers, Markdown copy, and JSON export.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, SQLite, Pydantic, Google GenAI SDK.
- **AI Models**: Gemini 2.5 Flash (`gemini-2.5-flash`) with multimodal image understanding.

---

## ⚙️ Running Locally

### 1. Start the Backend API
```bash
cd Backend
source .venv/bin/activate
python run.py
```
*(Ensure your `GEMINI_API_KEY` is configured in `Backend/.env`)*

### 2. Start the Frontend Application
```bash
cd Frontend
npm run dev
```

### 3. Access the Command Center
Open [http://localhost:5173](http://localhost:5173) in your browser.
