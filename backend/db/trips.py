from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from db.vehicles import Vehicle
from db.drivers import Driver

class Trip(Base):
    __tablename__ = "trips"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="RESTRICT"),
        nullable=False
    )
    driver_id = Column(
        Integer,
        ForeignKey("drivers.id", ondelete="RESTRICT"),
        nullable=False
    )
    cargo_weight_kg = Column(
        Numeric(10, 2),
        nullable=False
    )
    origin = Column(
        String(500),
        nullable=False
    )
    destination = Column(
        String(500),
        nullable=False
    )
    distance_km = Column(
        Numeric(10, 2),
        nullable=True
    )
    revenue = Column(
        Numeric(14, 2),
        nullable=False,
        default=0.0
    )
    status = Column(
        String,
        nullable=False,
        default="scheduled"
    )
    scheduled_departure = Column(
        DateTime(timezone=True),
        nullable=False
    )
    actual_arrival = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    vehicle = relationship("Vehicle", backref="trips")
    driver = relationship("Driver", backref="trips")
