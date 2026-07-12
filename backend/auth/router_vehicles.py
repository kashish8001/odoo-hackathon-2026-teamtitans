from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.vehicles import Vehicle
from auth.dependencies import DispatcherOrAbove, AnyAuthenticatedUser

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("/options")
def get_vehicle_options(
    db: Session = Depends(get_db),
    current_user = AnyAuthenticatedUser
):
    vehicles = db.query(Vehicle).filter(Vehicle.status != "retired").order_by(Vehicle.license_plate).all()
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
