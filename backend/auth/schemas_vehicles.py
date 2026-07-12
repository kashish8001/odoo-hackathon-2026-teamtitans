from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from auth.enums import VehicleStatus, VehicleType, FuelType

class VehicleBase(BaseModel):
    license_plate: str = Field(..., max_length=20)
    make: str = Field(..., max_length=100)
    model: str = Field(..., max_length=100)
    year: int = Field(..., ge=1900, le=2100)
    vehicle_type: VehicleType
    fuel_type: FuelType = FuelType.diesel
    max_load_capacity_kg: Decimal = Field(..., gt=0)
    current_odometer_km: Decimal = Field(default=Decimal("0"), ge=0)

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    license_plate: Optional[str] = Field(None, max_length=20)
    make: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    vehicle_type: Optional[VehicleType] = None
    fuel_type: Optional[FuelType] = None
    max_load_capacity_kg: Optional[Decimal] = Field(None, gt=0)
    current_odometer_km: Optional[Decimal] = Field(None, ge=0)
    status: Optional[VehicleStatus] = None

class VehicleResponse(VehicleBase):
    id: int
    status: VehicleStatus = VehicleStatus.idle

    class Config:
        from_attributes = True

class VehicleListResponse(BaseModel):
    data: list[VehicleResponse]
    total: int
