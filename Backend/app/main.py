from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import assessment, claims, reports, verification
import logging
import os

# Ensure the log file is created in the backend root
log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'disaster.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_path),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
logger.info("Starting Disaster Assessment API...")

app = FastAPI(title="Disaster Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(assessment.router, prefix="/api")
app.include_router(claims.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(verification.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Disaster Assessment API is running"}
