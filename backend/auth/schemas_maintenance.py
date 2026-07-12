from pydantic import BaseModel, Field, model_validator
from typing import Optional
from decimal import Decimal
from datetime import date
from auth.enums import MaintenanceStatus, ServiceType

class MaintenanceBase(BaseModel):
    vehicle_id: int
    service_type: ServiceType
    description: str
    start_date: Optional[date] = None
    completion_date: Optional[date] = None
    cost: Decimal = Field(default=Decimal("0"), ge=0)
    status: MaintenanceStatus = MaintenanceStatus.new

    @model_validator(mode="after")
    def check_dates(self):
        if self.completion_date and self.start_date:
            if self.completion_date < self.start_date:
                raise ValueError("completion_date must be >= start_date")
        return self

class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: ServiceType
    description: str
    start_date: Optional[date] = None
    cost: Optional[Decimal] = Field(default=Decimal("0"), ge=0)

class MaintenanceUpdate(BaseModel):
    service_type: Optional[ServiceType] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    completion_date: Optional[date] = None
    cost: Optional[Decimal] = Field(None, ge=0)
    status: Optional[MaintenanceStatus] = None

class MaintenanceResponse(MaintenanceBase):
    id: int

    class Config:
        from_attributes = True

class MaintenanceDetailResponse(BaseModel):
    """Maintenance log with vehicle info."""
    id: int
    vehicle_id: int
    service_type: ServiceType
    description: str
    start_date: Optional[date] = None
    completion_date: Optional[date] = None
    cost: Decimal
    status: MaintenanceStatus
    # Joined fields
    vehicle_plate: str
    vehicle_model: str

    class Config:
        from_attributes = True

class MaintenanceListResponse(BaseModel):
    data: list[MaintenanceDetailResponse]
    total: int
