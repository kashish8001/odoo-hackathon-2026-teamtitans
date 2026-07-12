from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from db.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(
        Integer,
        ForeignKey("trips.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    expense_type = Column(String, nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String(500), nullable=True)
    expense_date = Column(Date, nullable=False, default=func.current_date())

    # Relationships
    vehicle = relationship("Vehicle", backref="expenses")
    trip = relationship("Trip", backref="expenses")
