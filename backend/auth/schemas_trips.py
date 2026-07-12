from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: Decimal = Field(..., gt=0)
    origin: str = Field(..., max_length=500)
    destination: str = Field(..., max_length=500)
    distance_km: Optional[Decimal] = Field(None, ge=0)
    revenue: Decimal = Field(default=Decimal("0"), ge=0)
    scheduled_departure: datetime

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    cargo_weight_kg: Optional[Decimal] = Field(None, gt=0)
    origin: Optional[str] = Field(None, max_length=500)
    destination: Optional[str] = Field(None, max_length=500)
    distance_km: Optional[Decimal] = Field(None, ge=0)
    revenue: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None
    scheduled_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None

class TripResponse(TripBase):
    id: int
    status: str = "scheduled"
    actual_arrival: Optional[datetime] = None

    class Config:
        from_attributes = True

class TripDetailResponse(BaseModel):
    """Trip with joined vehicle and driver info."""
    id: int
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: Decimal
    origin: str
    destination: str
    distance_km: Optional[Decimal]
    revenue: Decimal
    status: str
    scheduled_departure: datetime
    actual_arrival: Optional[datetime]
    # Joined fields
    vehicle_plate: str
    vehicle_model: str
    vehicle_type: str
    driver_name: str

    class Config:
        from_attributes = True

class TripListResponse(BaseModel):
    data: list[TripDetailResponse]
    total: int
