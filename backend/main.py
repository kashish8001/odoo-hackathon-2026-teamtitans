from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from db.users import User
from db.vehicles import Vehicle
from db.drivers import Driver
from db.trips import Trip
from db.maintenance import MaintenanceLog
from db.expenses import Expense
from db.fuel_logs import FuelLog

from auth.router import router as auth_router
from auth.router_trips import router as trips_router
from auth.router_vehicles import router as vehicles_router
from auth.router_drivers import router as drivers_router
from auth.router_maintenance import router as maintenance_router
from auth.router_expenses import router as expenses_router
from auth.router_fuel_logs import router as fuel_logs_router
from auth.router_analytics import router as analytics_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TransitOps Backend",
    version="1.0.0",
    description="Authentication and Transport Operations API for Odoo Hackathon 2026"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
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

app.include_router(trips_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(maintenance_router)
app.include_router(expenses_router)
app.include_router(fuel_logs_router)
app.include_router(analytics_router)


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