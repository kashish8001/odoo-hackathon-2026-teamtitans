from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import date
from auth.enums import ExpenseType

class ExpenseBase(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: int
    expense_type: ExpenseType
    amount: Decimal = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)
    expense_date: date = Field(default_factory=date.today)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    expense_type: Optional[ExpenseType] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)
    expense_date: Optional[date] = None

class ExpenseResponse(ExpenseBase):
    id: int

    class Config:
        from_attributes = True

class ExpenseDetailResponse(BaseModel):
    """Expense with joined trip and vehicle info."""
    id: int
    trip_id: Optional[int] = None
    vehicle_id: int
    expense_type: ExpenseType
    amount: Decimal
    description: Optional[str] = None
    expense_date: date
    # Joined fields
    vehicle_plate: str
    driver_name: Optional[str] = None
    distance_km: Optional[Decimal] = None

    class Config:
        from_attributes = True

class ExpenseListResponse(BaseModel):
    data: list[ExpenseDetailResponse]
    total: int

class ExpenseSummaryItem(BaseModel):
    type: str
    total: float
