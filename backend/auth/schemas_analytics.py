from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date

class DashboardKPIs(BaseModel):
    """Dashboard KPI metrics from vw_dashboard_kpis."""
    active_fleet: int
    maintenance_alerts: int
    utilization_rate: Decimal
    pending_cargo: int

class VehicleCostSummary(BaseModel):
    """Vehicle cost breakdown from vw_vehicle_cost_summary."""
    vehicle_id: int
    license_plate: str
    vehicle_name: str
    total_fuel_cost: Decimal
    total_maintenance_cost: Decimal
    total_cost: Decimal
    total_revenue: Decimal
    net_profit: Decimal
    km_per_liter: Decimal

    class Config:
        from_attributes = True

class DriverPerformance(BaseModel):
    """Driver stats from vw_driver_performance."""
    driver_id: int
    driver_name: str
    license_number: str
    license_expiry: date
    license_expired: bool
    safety_score: Decimal
    duty_status: str
    is_available: bool
    total_trips: int
    completed_trips: int
    cancelled_trips: int
    completion_rate: Decimal
    total_complaints: int

    class Config:
        from_attributes = True

class MonthlyFinancialSummary(BaseModel):
    """Monthly financial report from vw_monthly_financial_summary."""
    month: date
    total_revenue: Decimal
    total_fuel_cost: Decimal
    total_maintenance_cost: Decimal
    net_profit: Decimal

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    """Combined analytics response."""
    kpis: DashboardKPIs
    top_vehicles: list[VehicleCostSummary]
    driver_performance: list[DriverPerformance]
    monthly_summary: list[MonthlyFinancialSummary]
