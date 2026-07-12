from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date

from db.database import get_db
from db.fuel_logs import FuelLog
from db.vehicles import Vehicle
from db.drivers import Driver
from db.trips import Trip
from auth.dependencies import DispatcherOrAbove, ManagerOrAbove, AnyAuthenticatedUser
from auth.schemas_fuel_logs import (
    FuelLogCreate,
    FuelLogUpdate,
    FuelLogResponse,
    FuelLogDetailResponse,
    FuelLogListResponse,
    FuelSummaryItem,
)

router = APIRouter(prefix="/fuel-logs", tags=["Fuel Logs"])


def _build_fuel_log_detail(f: FuelLog) -> FuelLogDetailResponse:
    vehicle_plate = f.vehicle.license_plate if f.vehicle else "Unknown"
    driver_name = None
    if f.driver and f.driver.user:
        driver_name = f"{f.driver.user.first_name} {f.driver.user.last_name}".strip()

    return FuelLogDetailResponse(
        id=f.id,
        vehicle_id=f.vehicle_id,
        driver_id=f.driver_id,
        trip_id=f.trip_id,
        liters=f.liters,
        cost_per_liter=f.cost_per_liter,
        total_cost=f.total_cost,
        odometer_at_fill=f.odometer_at_fill,
        fuel_date=f.fuel_date,
        vehicle_plate=vehicle_plate,
        driver_name=driver_name,
    )


@router.get("", response_model=FuelLogListResponse)
def list_fuel_logs(
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all fuel logs with optional filtering."""
    query = db.query(FuelLog)

    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(FuelLog.driver_id == driver_id)
    if trip_id:
        query = query.filter(FuelLog.trip_id == trip_id)
    if date_from:
        query = query.filter(FuelLog.fuel_date >= date_from)
    if date_to:
        query = query.filter(FuelLog.fuel_date <= date_to)

    total = query.count()
    logs = query.order_by(FuelLog.fuel_date.desc(), FuelLog.id.desc()).offset(skip).limit(limit).all()

    data = [_build_fuel_log_detail(f) for f in logs]
    return FuelLogListResponse(data=data, total=total)


@router.get("/summary/by-vehicle", response_model=list[FuelSummaryItem])
def get_fuel_summary_by_vehicle(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get fuel consumption summary by vehicle."""
    query = db.query(
        FuelLog.vehicle_id,
        func.sum(FuelLog.liters).label("total_liters"),
        func.sum(FuelLog.total_cost).label("total_cost")
    )

    if date_from:
        query = query.filter(FuelLog.fuel_date >= date_from)
    if date_to:
        query = query.filter(FuelLog.fuel_date <= date_to)

    results = query.group_by(FuelLog.vehicle_id).all()

    # Load vehicle plates
    vehicle_ids = [r[0] for r in results]
    vehicles = db.query(Vehicle.id, Vehicle.license_plate).filter(Vehicle.id.in_(vehicle_ids)).all() if vehicle_ids else []
    vehicle_map = {v[0]: v[1] for v in vehicles}

    return [
        {
            "vehicle_id": r[0],
            "license_plate": vehicle_map.get(r[0], "Unknown"),
            "total_liters": float(r[1]),
            "total_cost": float(r[2]),
        }
        for r in results
    ]


@router.get("/{log_id}", response_model=FuelLogDetailResponse)
def get_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single fuel log by ID."""
    f = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return _build_fuel_log_detail(f)


@router.post("", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Create a new fuel log record."""
    # Validate vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    # Validate driver if provided
    if log_in.driver_id:
        driver = db.query(Driver).filter(Driver.id == log_in.driver_id).first()
        if not driver:
            raise HTTPException(status_code=400, detail="Driver not found")

    # Validate trip if provided
    if log_in.trip_id:
        trip = db.query(Trip).filter(Trip.id == log_in.trip_id).first()
        if not trip:
            raise HTTPException(status_code=400, detail="Trip not found")
        if trip.vehicle_id != log_in.vehicle_id:
            raise HTTPException(status_code=400, detail="Trip vehicle mismatch")

    # Inserting fuel log.
    # Note: total_cost is generated automatically in Neon Postgres. 
    # Since we set server_default=FetchedValue(), SQLAlchemy expects the DB to populate it.
    new_log = FuelLog(
        vehicle_id=log_in.vehicle_id,
        driver_id=log_in.driver_id,
        trip_id=log_in.trip_id,
        liters=log_in.liters,
        cost_per_liter=log_in.cost_per_liter,
        odometer_at_fill=log_in.odometer_at_fill,
        fuel_date=log_in.fuel_date,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.put("/{log_id}", response_model=FuelLogResponse)
def update_fuel_log(
    log_id: int,
    log_in: FuelLogUpdate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Update a fuel log record."""
    f = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fuel log not found")

    update_data = log_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for key, value in update_data.items():
        setattr(f, key, value)

    db.commit()
    db.refresh(f)
    return f


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Delete a fuel log record. Requires Manager or Admin role."""
    f = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fuel log not found")

    db.delete(f)
    db.commit()
    return None
