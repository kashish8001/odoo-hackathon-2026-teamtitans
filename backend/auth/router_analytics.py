from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from datetime import date

from db.database import get_db
from db.vehicles import Vehicle
from db.drivers import Driver
from db.trips import Trip
from auth.dependencies import DispatcherOrAbove, AnyAuthenticatedUser
from auth.schemas_analytics import (
    DashboardKPIs,
    VehicleCostSummary,
    DriverPerformance,
    MonthlyFinancialSummary,
    AnalyticsSummary,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get dashboard KPIs from the database view."""
    try:
        res = db.execute(text("SELECT active_fleet, maintenance_alerts, utilization_rate, pending_cargo FROM vw_dashboard_kpis;")).first()
        if res:
            return DashboardKPIs(
                active_fleet=int(res[0]),
                maintenance_alerts=int(res[1]),
                utilization_rate=float(res[2]),
                pending_cargo=int(res[3]),
            )
    except Exception as e:
        print("KPI View execution failed, doing manual fallback:", e)

    # Manual Fallback
    total_vehicles = db.query(Vehicle).filter(Vehicle.status != "retired").count()
    on_trip = db.query(Vehicle).filter(Vehicle.status == "on_trip").count()
    in_shop = db.query(Vehicle).filter(Vehicle.status == "in_shop").count()
    pending_cargo = db.query(Trip).filter(Trip.status == "scheduled").count()

    utilization_rate = round((on_trip * 100.0) / total_vehicles, 1) if total_vehicles > 0 else 0.0

    return DashboardKPIs(
        active_fleet=on_trip,
        maintenance_alerts=in_shop,
        utilization_rate=utilization_rate,
        pending_cargo=pending_cargo,
    )


@router.get("/vehicles/cost-summary", response_model=list[VehicleCostSummary])
def get_vehicle_cost_summary(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get vehicle cost breakdown from the database view."""
    try:
        results = db.execute(
            text(
                "SELECT vehicle_id, license_plate, vehicle_name, total_fuel_cost, total_maintenance_cost, total_cost, total_revenue, net_profit, km_per_liter FROM vw_vehicle_cost_summary LIMIT :limit;"
            ),
            {"limit": limit}
        ).fetchall()
        return [
            VehicleCostSummary(
                vehicle_id=r[0],
                license_plate=r[1],
                vehicle_name=r[2],
                total_fuel_cost=r[3],
                total_maintenance_cost=r[4],
                total_cost=r[5],
                total_revenue=r[6],
                net_profit=r[7],
                km_per_liter=r[8],
            )
            for r in results
        ]
    except Exception as e:
        print("Cost Summary View execution failed:", e)
        return []


@router.get("/drivers/performance", response_model=list[DriverPerformance])
def get_driver_performance_report(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get driver performance metrics from the database view."""
    try:
        results = db.execute(
            text(
                "SELECT driver_id, driver_name, license_number, license_expiry, license_expired, safety_score, duty_status, is_available, total_trips, completed_trips, cancelled_trips, completion_rate, total_complaints FROM vw_driver_performance LIMIT :limit;"
            ),
            {"limit": limit}
        ).fetchall()
        return [
            DriverPerformance(
                driver_id=r[0],
                driver_name=r[1],
                license_number=r[2],
                license_expiry=r[3],
                license_expired=bool(r[4]),
                safety_score=r[5],
                duty_status=r[6],
                is_available=bool(r[7]),
                total_trips=r[8],
                completed_trips=r[9],
                cancelled_trips=r[10],
                completion_rate=r[11],
                total_complaints=r[12],
            )
            for r in results
        ]
    except Exception as e:
        print("Driver Performance View execution failed:", e)
        return []


@router.get("/financial/monthly", response_model=list[MonthlyFinancialSummary])
def get_monthly_financial_summary(
    limit: int = 6,
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get monthly financial summary from the database view."""
    try:
        results = db.execute(
            text(
                "SELECT month, total_revenue, total_fuel_cost, total_maintenance_cost, net_profit FROM vw_monthly_financial_summary LIMIT :limit;"
            ),
            {"limit": limit}
        ).fetchall()
        return [
            MonthlyFinancialSummary(
                month=r[0],
                total_revenue=r[1],
                total_fuel_cost=r[2],
                total_maintenance_cost=r[3],
                net_profit=r[4],
            )
            for r in results
        ]
    except Exception as e:
        print("Monthly Financial View execution failed:", e)
        return []


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get combined analytics summary for the analytics dashboard."""
    kpis = get_dashboard_kpis(db, current_user)
    top_vehicles = get_vehicle_cost_summary(5, db, current_user)
    driver_perf = get_driver_performance_report(10, db, current_user)
    monthly = get_monthly_financial_summary(6, db, current_user)

    return AnalyticsSummary(
        kpis=kpis,
        top_vehicles=top_vehicles,
        driver_performance=driver_perf,
        monthly_summary=monthly,
    )


@router.get("/fleet/stats")
def get_fleet_stats(
    db: Session = Depends(get_db),
    current_user=AnyAuthenticatedUser,
):
    """Get quick fleet statistics for dashboard."""
    vehicles = db.query(Vehicle.status).filter(Vehicle.status != "retired").all()
    drivers = db.query(Driver.duty_status).all()
    trips = db.query(Trip.status).all()

    vehicle_counts = {}
    for v in vehicles:
        status = v[0]
        vehicle_counts[status] = vehicle_counts.get(status, 0) + 1

    driver_counts = {}
    for d in drivers:
        status = d[0]
        driver_counts[status] = driver_counts.get(status, 0) + 1

    trip_counts = {}
    for t in trips:
        status = t[0]
        trip_counts[status] = trip_counts.get(status, 0) + 1

    return {
        "vehicles": {
            "total": len(vehicles),
            "by_status": vehicle_counts,
        },
        "drivers": {
            "total": len(drivers),
            "by_status": driver_counts,
        },
        "trips": {
            "total": len(trips),
            "by_status": trip_counts,
        },
    }
