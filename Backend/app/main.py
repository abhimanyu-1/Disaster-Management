from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import assessment, claims, reports, verification

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
