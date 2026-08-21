# Disaster Management AI Platform

A powerful, multimodal AI orchestration platform designed to assess disaster zones, estimate damage, and prioritize emergency response using advanced multi-agent workflows.

## 🚀 Overview

This application provides a "Mission Control" interface where operators can upload a single image of a disaster zone (or select from a built-in demo dropdown of global disasters). The image is passed through a highly advanced backend pipeline consisting of multiple specialized AI agents powered by **Google Gemini 2.5 Flash**. 

These agents work in sequence, passing JSON-structured knowledge between each other to produce a comprehensive, tactical situation report that visualizes AI damage detection via **dynamic spatial bounding boxes** on the frontend. The platform also features a **Human-in-the-Loop (HITL)** system, allowing operators to manually redraw bounding boxes to override the AI's assessment.

## 🧠 Multi-Agent Workflow Architecture

The core orchestration happens in the backend `disaster_workflow.py`. The pipeline consists of the following autonomous agents:

1. **Vision Agent (`vision_agent.py`)**
   - **Input**: Raw disaster image (via Base64 upload or Unsplash URL) & coordinates.
   - **Role**: Performs structural damage analysis and explicitly categorizes the disaster type (Flood, Earthquake, Hurricane, Wildfire).
   - **Spatial Analysis**: Prompts Gemini 2.5 Flash to return exact, normalized `[ymin, xmin, ymax, xmax]` coordinates tightly wrapping the most severe damage, which the UI dynamically renders.
   
2. **Geo Agent (`geo_agent.py`)**
   - **Input**: GPS Coordinates.
   - **Role**: Analyzes the geographical context, determines the affected population density, and evaluates the criticality of nearby infrastructure (hospitals, roads).

3. **Assessment Engine**
   - **Role**: A deterministic engine that calculates the absolute **Severity Score** (0-1.0) based strictly on the Vision Agent's analysis.

4. **Claim Agent (`claim_agent.py`)**
   - **Input**: Field reports, severity scores, and estimated claim amounts.
   - **Role**: Evaluates the consistency of the field report against the AI's visual analysis to detect potential insurance fraud and assess claim risk.

5. **Priority Agent (`priority_agent.py`)**
   - **Input**: All previous context (Severity, Population, Criticality, Confidence, Risk).
   - **Role**: Synthesizes the data to output a final priority level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) to guide first responders.

6. **Verification Agent (`verification_agent.py`)**
   - **Role**: Acts as the final gatekeeper. If the AI's confidence is low or there is conflicting evidence, it flags the assessment for `REVIEW_REQUIRED`. If the evidence aligns perfectly, it marks it as `AUTO_APPROVED`.

## 🎨 Interactive Frontend Features

- **Human-in-the-Loop (HITL) Override**: Operators can click and drag directly on the image canvas to manually redraw bounding boxes, instantly overriding the AI's red bounding box with a custom orange override box.
- **Dynamic Image Uploads**: Real-time Base64 encoding allows you to seamlessly drag and drop local disaster images into Mission Control.
- **Demo Scenarios**: Built-in dropdown options to run the multi-agent pipeline on pre-configured Earthquake, Flood, Hurricane, or Wildfire imagery.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Python, FastAPI, Pydantic (Strict Schema Enforcement), Google GenAI SDK.
- **AI Model**: Gemini 2.5 Flash (`gemini-2.5-flash`).

## ⚙️ Running Locally

1. **Start the Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```
   *(Ensure your `GEMINI_API_KEY` is set in the `.env` file!)*

2. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173` to access Mission Control!
