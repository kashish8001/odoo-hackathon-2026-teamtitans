from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from db.database import Base

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    service_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    completion_date = Column(Date, nullable=True)
    cost = Column(Numeric(12, 2), nullable=False, default=0.0)
    status = Column(String, nullable=False, default="new")

    # Relationship
    vehicle = relationship("Vehicle", backref="maintenance_logs")

    __table_args__ = (
        CheckConstraint(
            "completion_date IS NULL OR start_date IS NULL OR completion_date >= start_date",
            name="chk_maintenance_dates"
        ),
    )
