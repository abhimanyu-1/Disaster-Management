from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import assessment
from .database import init_db

app = FastAPI(title="Disaster Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(assessment.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Disaster Assessment API is running"}
