from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.drivers import Driver
from auth.dependencies import DispatcherOrAbove, AnyAuthenticatedUser

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/options")
def get_driver_options(
    db: Session = Depends(get_db),
    current_user = AnyAuthenticatedUser
):
    # Retrieve all drivers who are not suspended
    drivers = (
        db.query(Driver)
        .filter(Driver.duty_status != "suspended")
        .order_by(Driver.id)
        .all()
    )
    return [
        {
            "id": d.id,
            "label": f"{d.user.first_name} {d.user.last_name}".strip() if d.user else "Unknown Driver",
            "license_number": d.license_number,
            "duty_status": d.duty_status,
        }
        for d in drivers
    ]
