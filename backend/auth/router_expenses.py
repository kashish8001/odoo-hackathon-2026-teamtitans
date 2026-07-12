from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date

from db.database import get_db
from db.expenses import Expense
from db.vehicles import Vehicle
from db.trips import Trip
from db.drivers import Driver
from db.users import User
from auth.dependencies import DispatcherOrAbove, ManagerOrAbove, AnyAuthenticatedUser
from auth.schemas_expenses import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseDetailResponse,
    ExpenseListResponse,
    ExpenseSummaryItem,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def _build_expense_detail(e: Expense) -> ExpenseDetailResponse:
    vehicle_plate = e.vehicle.license_plate if e.vehicle else "Unknown"
    driver_name = None
    distance_km = None
    if e.trip:
        distance_km = e.trip.distance_km
        if e.trip.driver and e.trip.driver.user:
            driver_name = f"{e.trip.driver.user.first_name} {e.trip.driver.user.last_name}".strip()

    return ExpenseDetailResponse(
        id=e.id,
        trip_id=e.trip_id,
        vehicle_id=e.vehicle_id,
        expense_type=e.expense_type,
        amount=e.amount,
        description=e.description,
        expense_date=e.expense_date,
        vehicle_plate=vehicle_plate,
        driver_name=driver_name,
        distance_km=distance_km,
    )


@router.get("", response_model=ExpenseListResponse)
def list_expenses(
    expense_type: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """List all expenses with optional filtering."""
    query = db.query(Expense)

    if expense_type:
        query = query.filter(Expense.expense_type == expense_type)
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(Expense.trip_id == trip_id)
    if date_from:
        query = query.filter(Expense.expense_date >= date_from)
    if date_to:
        query = query.filter(Expense.expense_date <= date_to)

    total = query.count()
    expenses = query.order_by(Expense.expense_date.desc(), Expense.id.desc()).offset(skip).limit(limit).all()

    data = [_build_expense_detail(e) for e in expenses]
    return ExpenseListResponse(data=data, total=total)


@router.get("/summary/by-type", response_model=list[ExpenseSummaryItem])
def get_expenses_summary_by_type(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get expense totals grouped by type."""
    query = db.query(Expense.expense_type, func.sum(Expense.amount).label("total"))

    if date_from:
        query = query.filter(Expense.expense_date >= date_from)
    if date_to:
        query = query.filter(Expense.expense_date <= date_to)

    results = query.group_by(Expense.expense_type).all()

    return [{"type": r[0], "total": float(r[1])} for r in results]


@router.get("/{expense_id}", response_model=ExpenseDetailResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get a single expense by ID."""
    e = db.query(Expense).filter(Expense.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense not found")
    return _build_expense_detail(e)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Create a new expense record."""
    # Validate vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == expense_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    # Validate trip if provided
    if expense_in.trip_id:
        trip = db.query(Trip).filter(Trip.id == expense_in.trip_id).first()
        if not trip:
            raise HTTPException(status_code=400, detail="Trip not found")
        if trip.vehicle_id != expense_in.vehicle_id:
            raise HTTPException(status_code=400, detail="Trip vehicle mismatch")

    new_expense = Expense(
        trip_id=expense_in.trip_id,
        vehicle_id=expense_in.vehicle_id,
        expense_type=expense_in.expense_type.value if hasattr(expense_in.expense_type, 'value') else expense_in.expense_type,
        amount=expense_in.amount,
        description=expense_in.description,
        expense_date=expense_in.expense_date,
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user=DispatcherOrAbove,
):
    """Update an expense record."""
    e = db.query(Expense).filter(Expense.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for key, value in update_data.items():
        if key == "expense_type" and hasattr(value, 'value'):
            setattr(e, key, value.value)
        else:
            setattr(e, key, value)

    db.commit()
    db.refresh(e)
    return e


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=ManagerOrAbove,
):
    """Delete an expense record. Requires Manager or Admin role."""
    e = db.query(Expense).filter(Expense.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(e)
    db.commit()
    return None
