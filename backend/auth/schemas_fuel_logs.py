from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import date

class FuelLogBase(BaseModel):
    vehicle_id: int
    driver_id: Optional[int] = None
    trip_id: Optional[int] = None
    liters: Decimal = Field(..., gt=0)
    cost_per_liter: Decimal = Field(..., gt=0)
    odometer_at_fill: Decimal = Field(..., ge=0)
    fuel_date: date = Field(default_factory=date.today)

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    trip_id: Optional[int] = None
    liters: Optional[Decimal] = Field(None, gt=0)
    cost_per_liter: Optional[Decimal] = Field(None, gt=0)
    odometer_at_fill: Optional[Decimal] = Field(None, ge=0)
    fuel_date: Optional[date] = None

class FuelLogResponse(FuelLogBase):
    id: int
    total_cost: Decimal

    class Config:
        from_attributes = True

class FuelLogDetailResponse(BaseModel):
    """Fuel log with joined vehicle and driver info."""
    id: int
    vehicle_id: int
    driver_id: Optional[int] = None
    trip_id: Optional[int] = None
    liters: Decimal
    cost_per_liter: Decimal
    total_cost: Decimal
    odometer_at_fill: Decimal
    fuel_date: date
    # Joined fields
    vehicle_plate: str
    driver_name: Optional[str] = None

    class Config:
        from_attributes = True

class FuelLogListResponse(BaseModel):
    data: list[FuelLogDetailResponse]
    total: int

class FuelSummaryItem(BaseModel):
    vehicle_id: int
    license_plate: str
    total_liters: float
    total_cost: float
