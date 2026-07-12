from sqlalchemy import Column, Integer, String, Numeric
from db.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    license_plate = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )
    make = Column(
        String(100),
        nullable=False
    )
    model = Column(
        String(100),
        nullable=False
    )
    year = Column(
        Integer,
        nullable=False
    )
    vehicle_type = Column(
        String,
        nullable=False
    )
    fuel_type = Column(
        String,
        nullable=False,
        default="diesel"
    )
    max_load_capacity_kg = Column(
        Numeric(10, 2),
        nullable=False
    )
    current_odometer_km = Column(
        Numeric(12, 2),
        nullable=False,
        default=0.0
    )
    status = Column(
        String,
        nullable=False,
        default="idle"
    )
