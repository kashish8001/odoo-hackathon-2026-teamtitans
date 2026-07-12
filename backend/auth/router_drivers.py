from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from db.drivers import Driver
from db.users import User
from auth.dependencies import DispatcherOrAbove, ManagerOrAbove, AnyAuthenticatedUser
from auth.schemas_drivers import (
    DriverCreate,
    DriverUpdate,
    DriverResponse,
    DriverWithUserResponse,
    DriverListResponse,
)

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.get("", response_model=DriverListResponse)
def list_drivers(
    duty_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all drivers with user information."""
    query = db.query(Driver).join(User, Driver.user_id == User.id)

    if duty_status:
        query = query.filter(Driver.duty_status == duty_status)

    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (Driver.license_number.ilike(f"%{search}%"))
        )

    total = query.count()
    drivers = query.order_by(Driver.id.desc()).offset(skip).limit(limit).all()

    data = []
    for d in drivers:
        data.append(
            DriverWithUserResponse(
                id=d.id,
                user_id=d.user_id,
                license_number=d.license_number,
                license_expiry=d.license_expiry,
                safety_score=d.safety_score,
                duty_status=d.duty_status,
                first_name=d.user.first_name if d.user else "Unknown",
                last_name=d.user.last_name if d.user else "Unknown",
                email=d.user.email if d.user else "Unknown",
            )
        )

    return DriverListResponse(data=data, total=total)


@router.get("/options")
def get_driver_options(
    available_only: bool = True,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get driver options for dropdown selection."""
    query = db.query(Driver).join(User, Driver.user_id == User.id)

    if available_only:
        # Available = not on_duty and not suspended
        query = query.filter(~Driver.duty_status.in_(["on_duty", "suspended"]))

    drivers = query.order_by(Driver.id).all()

    options = []
    for d in drivers:
        name = f"{d.user.first_name} {d.user.last_name}".strip() if d.user else "Unknown Driver"
        is_available = d.duty_status not in ["on_duty", "suspended"]
        options.append({
            "id": d.id,
            "name": name,
            "label": f"{name} - {d.license_number}",
            "license_number": d.license_number,
            "is_available": is_available,
            "duty_status": d.duty_status,
        })
    return options


@router.get("/{driver_id}", response_model=DriverWithUserResponse)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single driver by ID with user info."""
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found")

    return DriverWithUserResponse(
        id=d.id,
        user_id=d.user_id,
        license_number=d.license_number,
        license_expiry=d.license_expiry,
        safety_score=d.safety_score,
        duty_status=d.duty_status,
        first_name=d.user.first_name if d.user else "Unknown",
        last_name=d.user.last_name if d.user else "Unknown",
        email=d.user.email if d.user else "Unknown",
    )


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Create a driver profile for an existing user. Requires Manager or Admin role."""
    # Check if user exists
    user = db.query(User).filter(User.id == driver_in.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Check if driver already exists for this user
    existing_driver = db.query(Driver).filter(Driver.user_id == driver_in.user_id).first()
    if existing_driver:
        raise HTTPException(status_code=400, detail="Driver profile already exists for this user")

    # Check for duplicate license
    existing_license = db.query(Driver).filter(Driver.license_number == driver_in.license_number).first()
    if existing_license:
        raise HTTPException(status_code=400, detail="License number already registered")

    new_driver = Driver(
        user_id=driver_in.user_id,
        license_number=driver_in.license_number,
        license_expiry=driver_in.license_expiry,
        safety_score=driver_in.safety_score,
        duty_status="off_duty",
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Update a driver profile. Requires Manager or Admin role."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    update_data = driver_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for key, value in update_data.items():
        if key == "duty_status" and hasattr(value, 'value'):
            setattr(driver, key, value.value)
        else:
            setattr(driver, key, value)

    db.commit()
    db.refresh(driver)
    return driver


@router.post("/{driver_id}/suspend")
@router.put("/{driver_id}/suspend")
def suspend_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Suspend a driver. Requires Manager or Admin role."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.duty_status == "suspended":
        raise HTTPException(status_code=400, detail="Driver is already suspended")

    if driver.duty_status == "on_duty":
        raise HTTPException(status_code=400, detail="Cannot suspend driver who is currently on duty")

    driver.duty_status = "suspended"
    db.commit()
    return {"message": f"Driver {driver_id} suspended successfully"}


@router.post("/{driver_id}/activate")
@router.put("/{driver_id}/activate")
def activate_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Reactivate a suspended driver. Requires Manager or Admin role."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.duty_status = "off_duty"
    db.commit()
    return {"message": f"Driver {driver_id} activated successfully"}


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Delete a driver profile. Requires Manager or Admin role."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.duty_status == "on_duty":
        raise HTTPException(status_code=400, detail="Cannot delete driver who is currently on duty")

    db.delete(driver)
    db.commit()
    return None
