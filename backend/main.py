from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from db.users import User

from auth.router import router as auth_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TransitOps Backend",
    version="1.0.0",
    description="Authentication API for Odoo Hackathon 2026"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)


@app.get("/")
async def root():
    return {
        "message": "TransitOps Backend Running 🚀",
        "status": "OK"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }