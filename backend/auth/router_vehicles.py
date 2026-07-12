from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal

from db.database import get_db
from db.vehicles import Vehicle
from auth.dependencies import DispatcherOrAbove, ManagerOrAbove, AnyAuthenticatedUser
from auth.schemas_vehicles import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleListResponse,
)

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=VehicleListResponse)
def list_vehicles(
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all vehicles with optional filters."""
    query = db.query(Vehicle)

    if status:
        query = query.filter(Vehicle.status == status)
    else:
        # Exclude retired by default
        query = query.filter(Vehicle.status != "retired")

    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)

    if search:
        query = query.filter(
            (Vehicle.license_plate.ilike(f"%{search}%")) |
            (Vehicle.make.ilike(f"%{search}%")) |
            (Vehicle.model.ilike(f"%{search}%"))
        )

    total = query.count()
    vehicles = query.order_by(Vehicle.id.desc()).offset(skip).limit(limit).all()

    return VehicleListResponse(data=vehicles, total=total)


@router.get("/options")
def get_vehicle_options(
    status: Optional[str] = "idle",
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get vehicle options for dropdowns."""
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    else:
        query = query.filter(Vehicle.status != "retired")

    vehicles = query.order_by(Vehicle.license_plate).all()
    return [
        {
            "id": v.id,
            "label": f"{v.make} {v.model} - {v.license_plate}",
            "license_plate": v.license_plate,
            "max_load_capacity_kg": v.max_load_capacity_kg,
            "status": v.status,
        }
        for v in vehicles
    ]


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single vehicle by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Register a new vehicle. Requires Manager or Admin role."""
    # Check duplicate license plate
    existing = db.query(Vehicle).filter(Vehicle.license_plate == vehicle_in.license_plate).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this license plate already exists")

    new_vehicle = Vehicle(
        license_plate=vehicle_in.license_plate,
        make=vehicle_in.make,
        model=vehicle_in.model,
        year=vehicle_in.year,
        vehicle_type=vehicle_in.vehicle_type.value if hasattr(vehicle_in.vehicle_type, 'value') else vehicle_in.vehicle_type,
        fuel_type=vehicle_in.fuel_type.value if hasattr(vehicle_in.fuel_type, 'value') else vehicle_in.fuel_type,
        max_load_capacity_kg=vehicle_in.max_load_capacity_kg,
        current_odometer_km=vehicle_in.current_odometer_km,
        status="idle",
    )
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Update a vehicle. Requires Manager or Admin role."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = vehicle_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for key, value in update_data.items():
        if key in ["vehicle_type", "fuel_type", "status"] and hasattr(value, 'value'):
            setattr(vehicle, key, value.value)
        else:
            setattr(vehicle, key, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Retire a vehicle (soft delete by setting status to 'retired')."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status == "on_trip":
        raise HTTPException(status_code=400, detail="Cannot retire a vehicle that is on a trip")

    vehicle.status = "retired"
    db.commit()
    return None
