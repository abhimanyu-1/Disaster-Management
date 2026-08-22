from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import assessment

app = FastAPI(title="Disaster Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(assessment.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Disaster Assessment API is running"}
