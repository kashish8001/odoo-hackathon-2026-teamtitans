from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.vehicles import Vehicle
from db.drivers import Driver
from db.trips import Trip
from auth.dependencies import DispatcherOrAbove, AnyAuthenticatedUser
from auth.schemas_trips import (
    TripCreate,
    TripUpdate,
    TripResponse,
    TripDetailResponse,
    TripListResponse,
)

router = APIRouter(prefix="/trips", tags=["Trips"])


def _build_trip_detail(t: Trip) -> TripDetailResponse:
    """Helper to convert Trip SQLAlchemy model to TripDetailResponse."""
    v = t.vehicle
    d = t.driver
    u = d.user if d else None
    
    return TripDetailResponse(
        id=t.id,
        vehicle_id=t.vehicle_id,
        driver_id=t.driver_id,
        cargo_weight_kg=t.cargo_weight_kg,
        origin=t.origin,
        destination=t.destination,
        distance_km=t.distance_km,
        revenue=t.revenue,
        status=t.status,
        scheduled_departure=t.scheduled_departure,
        actual_arrival=t.actual_arrival,
        vehicle_plate=v.license_plate if v else "Unknown",
        vehicle_model=f"{v.make} {v.model}".strip() if v else "Unknown",
        vehicle_type=v.vehicle_type if v else "Unknown",
        driver_name=f"{u.first_name} {u.last_name}".strip() if u else "Unknown",
    )


@router.get("", response_model=TripListResponse)
def list_trips(
    status: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all trips with search and filters."""
    query = db.query(Trip)
    
    if status:
        query = query.filter(Trip.status == status)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)
    if search:
        query = query.filter(
            (Trip.origin.ilike(f"%{search}%")) | (Trip.destination.ilike(f"%{search}%"))
        )
        
    total = query.count()
    trips = query.order_by(Trip.scheduled_departure.desc()).offset(skip).limit(limit).all()
    
    data = [_build_trip_detail(t) for t in trips]
    return TripListResponse(data=data, total=total)


@router.get("/{trip_id}", response_model=TripDetailResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single trip by ID."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _build_trip_detail(t)


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """
    Create a new trip. Validates:
    - Vehicle exists and is idle
    - Driver exists and is eligible
    - Cargo weight doesn't exceed vehicle capacity
    """
    # 1. Validate Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")
    if vehicle.status != "idle":
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle is '{vehicle.status}' — only idle vehicles can be dispatched"
        )
    if float(trip_in.cargo_weight_kg) > float(vehicle.max_load_capacity_kg):
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight ({trip_in.cargo_weight_kg} kg) exceeds vehicle capacity ({vehicle.max_load_capacity_kg} kg)"
        )

    # 2. Validate Driver
    driver = db.query(Driver).filter(Driver.id == trip_in.driver_id).first()
    if not driver:
        raise HTTPException(status_code=400, detail="Driver not found")
    if driver.duty_status == "suspended":
        raise HTTPException(status_code=400, detail="Driver is currently suspended")
    if driver.duty_status == "on_duty":
        raise HTTPException(status_code=400, detail="Driver is currently on duty")
    if driver.license_expiry < datetime.now().date():
        raise HTTPException(status_code=400, detail=f"Driver license expired on {driver.license_expiry}")

    # 3. Create Trip
    new_trip = Trip(
        vehicle_id=trip_in.vehicle_id,
        driver_id=trip_in.driver_id,
        cargo_weight_kg=trip_in.cargo_weight_kg,
        origin=trip_in.origin,
        destination=trip_in.destination,
        distance_km=trip_in.distance_km,
        revenue=trip_in.revenue,
        status="scheduled",
        scheduled_departure=trip_in.scheduled_departure,
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Update a trip."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if t.status in ["delivered", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot modify trip with status '{t.status}'"
        )
        
    update_data = trip_in.model_dump(exclude_unset=True)
    
    # Pre-checks for vehicle if vehicle is changing
    if "vehicle_id" in update_data and update_data["vehicle_id"] != t.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == update_data["vehicle_id"]).first()
        if not vehicle:
            raise HTTPException(status_code=400, detail="Vehicle not found")
        if vehicle.status != "idle":
            raise HTTPException(
                status_code=400,
                detail=f"Vehicle is '{vehicle.status}' — only idle vehicles can be dispatched"
            )
        cargo_wt = update_data.get("cargo_weight_kg", t.cargo_weight_kg)
        if float(cargo_wt) > float(vehicle.max_load_capacity_kg):
            raise HTTPException(
                status_code=400,
                detail=f"Cargo weight ({cargo_wt} kg) exceeds vehicle capacity ({vehicle.max_load_capacity_kg} kg)"
            )
            
    # Pre-checks for driver if driver is changing
    if "driver_id" in update_data and update_data["driver_id"] != t.driver_id:
        driver = db.query(Driver).filter(Driver.id == update_data["driver_id"]).first()
        if not driver:
            raise HTTPException(status_code=400, detail="Driver not found")
        if driver.duty_status == "suspended":
            raise HTTPException(status_code=400, detail="Driver is currently suspended")
        if driver.duty_status == "on_duty":
            raise HTTPException(status_code=400, detail="Driver is currently on duty")
        if driver.license_expiry < datetime.now().date():
            raise HTTPException(status_code=400, detail=f"Driver license expired on {driver.license_expiry}")

    for key, value in update_data.items():
        setattr(t, key, value)
        
    db.commit()
    db.refresh(t)
    return t


@router.post("/{trip_id}/start")
@router.put("/{trip_id}/start")
def start_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Mark a trip as in_transit and update vehicle/driver statuses."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if t.status != "scheduled":
        raise HTTPException(status_code=400, detail="Only scheduled trips can be started")
        
    t.status = "in_transit"
    
    # Sync statuses (also done by trigger, but updating here in python ensures session status matches)
    if t.vehicle:
        t.vehicle.status = "on_trip"
    if t.driver:
        t.driver.duty_status = "on_duty"
        
    db.commit()
    db.refresh(t)
    return {"message": "Trip started", "trip": t}


@router.post("/{trip_id}/complete")
@router.put("/{trip_id}/complete")
def complete_trip(
    trip_id: int,
    end_odometer_km: Optional[Decimal] = Query(None),
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Mark a trip as delivered, update actual arrival, and free up vehicle/driver."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if t.status != "in_transit":
        raise HTTPException(status_code=400, detail="Only in_transit trips can be completed")
        
    t.status = "delivered"
    t.actual_arrival = datetime.now(timezone.utc)
    
    if t.vehicle:
        t.vehicle.status = "idle"
        if end_odometer_km is not None:
            t.vehicle.current_odometer_km = max(t.vehicle.current_odometer_km, end_odometer_km)
            
    if t.driver:
        t.driver.duty_status = "off_duty"
        
    db.commit()
    db.refresh(t)
    return {"message": "Trip completed", "trip": t}


@router.post("/{trip_id}/cancel")
@router.put("/{trip_id}/cancel")
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Cancel a trip and free up vehicle/driver."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if t.status in ["delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Trip is already completed or cancelled")
        
    old_status = t.status
    t.status = "cancelled"
    
    # If it was in transit, free up vehicle and driver
    if old_status == "in_transit":
        if t.vehicle:
            t.vehicle.status = "idle"
        if t.driver:
            t.driver.duty_status = "off_duty"
            
    db.commit()
    db.refresh(t)
    return {"message": "Trip cancelled", "trip": t}


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Delete a trip (only scheduled trips can be deleted)."""
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if t.status != "scheduled":
        raise HTTPException(
            status_code=400,
            detail="Only scheduled trips can be deleted. Use cancel for active trips."
        )
        
    db.delete(t)
    db.commit()
    return None
