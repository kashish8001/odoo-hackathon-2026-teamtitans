from sqlalchemy import Column, Integer, Numeric, Date, ForeignKey, func, FetchedValue
from sqlalchemy.orm import relationship
from db.database import Base

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    driver_id = Column(
        Integer,
        ForeignKey("drivers.id", ondelete="SET NULL"),
        nullable=True
    )
    trip_id = Column(
        Integer,
        ForeignKey("trips.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    liters = Column(Numeric(8, 2), nullable=False)
    cost_per_liter = Column(Numeric(8, 2), nullable=False)
    # total_cost is GENERATED ALWAYS AS (liters * cost_per_liter) STORED in Postgres.
    # We use server_default=FetchedValue() to let SQLAlchemy know the DB handles it.
    total_cost = Column(Numeric(12, 2), nullable=False, server_default=FetchedValue())
    odometer_at_fill = Column(Numeric(12, 2), nullable=False)
    fuel_date = Column(Date, nullable=False, default=func.current_date())

    # Relationships
    vehicle = relationship("Vehicle", backref="fuel_logs")
    driver = relationship("Driver", backref="fuel_logs")
    trip = relationship("Trip", backref="fuel_logs")
