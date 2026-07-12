from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from db.database import get_db
from db.maintenance import MaintenanceLog
from db.vehicles import Vehicle
from auth.dependencies import DispatcherOrAbove, ManagerOrAbove, AnyAuthenticatedUser
from auth.schemas_maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    MaintenanceDetailResponse,
    MaintenanceListResponse,
)

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


def _build_maintenance_detail(m: MaintenanceLog) -> MaintenanceDetailResponse:
    v = m.vehicle
    return MaintenanceDetailResponse(
        id=m.id,
        vehicle_id=m.vehicle_id,
        service_type=m.service_type,
        description=m.description,
        start_date=m.start_date,
        completion_date=m.completion_date,
        cost=m.cost,
        status=m.status,
        vehicle_plate=v.license_plate if v else "Unknown",
        vehicle_model=f"{v.make} {v.model}".strip() if v else "Unknown",
    )


@router.get("", response_model=MaintenanceListResponse)
def list_maintenance_logs(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all maintenance logs with optional filters."""
    query = db.query(MaintenanceLog)

    if status:
        query = query.filter(MaintenanceLog.status == status)
    if service_type:
        query = query.filter(MaintenanceLog.service_type == service_type)
    if vehicle_id:
        query = query.filter(MaintenanceLog.vehicle_id == vehicle_id)
    if search:
        query = query.filter(MaintenanceLog.description.ilike(f"%{search}%"))

    total = query.count()
    logs = query.order_by(MaintenanceLog.id.desc()).offset(skip).limit(limit).all()

    data = [_build_maintenance_detail(m) for m in logs]
    return MaintenanceListResponse(data=data, total=total)


@router.get("/{log_id}", response_model=MaintenanceDetailResponse)
def get_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single maintenance log by ID."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return _build_maintenance_detail(m)


@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    log_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Create a new maintenance log."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    if vehicle.status == "on_trip":
        raise HTTPException(status_code=400, detail="Cannot create maintenance for vehicle on trip")

    # In PostgreSQL schema, the trigger trg_maintenance_status will auto-update vehicle status to in_shop
    new_log = MaintenanceLog(
        vehicle_id=log_in.vehicle_id,
        service_type=log_in.service_type.value if hasattr(log_in.service_type, 'value') else log_in.service_type,
        description=log_in.description,
        start_date=log_in.start_date,
        completion_date=None,
        cost=log_in.cost if log_in.cost is not None else 0.0,
        status="new",
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.put("/{log_id}", response_model=MaintenanceResponse)
def update_maintenance_log(
    log_id: int,
    log_in: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Update a maintenance log."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    update_data = log_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for key, value in update_data.items():
        if key in ["service_type", "status"] and hasattr(value, 'value'):
            setattr(m, key, value.value)
        else:
            setattr(m, key, value)

    db.commit()
    db.refresh(m)
    return m


@router.post("/{log_id}/start")
@router.put("/{log_id}/start")
def start_maintenance(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Mark maintenance as in_progress."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if m.status != "new":
        raise HTTPException(status_code=400, detail="Only new maintenance logs can be started")

    m.status = "in_progress"
    m.start_date = date.today()
    db.commit()
    db.refresh(m)
    return {"message": "Maintenance started", "log": m}


@router.post("/{log_id}/complete")
@router.put("/{log_id}/complete")
def complete_maintenance(
    log_id: int,
    final_cost: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Mark maintenance as completed."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if m.status not in ["new", "in_progress"]:
        raise HTTPException(status_code=400, detail="Maintenance is already completed or cancelled")

    m.status = "completed"
    m.completion_date = date.today()
    if final_cost is not None:
        m.cost = final_cost

    db.commit()
    db.refresh(m)
    return {"message": "Maintenance completed", "log": m}


@router.post("/{log_id}/cancel")
@router.put("/{log_id}/cancel")
def cancel_maintenance(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Cancel a maintenance log."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if m.status in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Maintenance is already completed or cancelled")

    m.status = "cancelled"
    db.commit()
    db.refresh(m)
    return {"message": "Maintenance cancelled", "log": m}


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Delete a maintenance log. Requires Manager or Admin role."""
    m = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if m.status == "in_progress":
        raise HTTPException(status_code=400, detail="Cannot delete in-progress maintenance")

    db.delete(m)
    db.commit()
    return None
