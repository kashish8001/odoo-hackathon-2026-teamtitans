from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import date
from auth.enums import DutyStatus

class DriverBase(BaseModel):
    user_id: int
    license_number: str = Field(..., max_length=50)
    license_expiry: date
    safety_score: Decimal = Field(default=Decimal("100.00"), ge=0, le=100)
    duty_status: DutyStatus = DutyStatus.off_duty

class DriverCreate(BaseModel):
    user_id: int
    license_number: str = Field(..., max_length=50)
    license_expiry: date
    safety_score: Optional[Decimal] = Field(default=Decimal("100.00"), ge=0, le=100)

class DriverUpdate(BaseModel):
    license_number: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[date] = None
    safety_score: Optional[Decimal] = Field(None, ge=0, le=100)
    duty_status: Optional[DutyStatus] = None

class DriverResponse(DriverBase):
    id: int

    class Config:
        from_attributes = True

class DriverWithUserResponse(BaseModel):
    """Driver info joined with user data."""
    id: int
    user_id: int
    license_number: str
    license_expiry: date
    safety_score: Decimal
    duty_status: DutyStatus
    # User fields
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class DriverListResponse(BaseModel):
    data: list[DriverWithUserResponse]
    total: int

# For dropdowns
class DriverOption(BaseModel):
    id: int
    name: str
    license_number: str
    is_available: bool
