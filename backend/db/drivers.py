from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from db.users import User

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    license_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )
    license_expiry = Column(
        Date,
        nullable=False
    )
    safety_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=100.00
    )
    duty_status = Column(
        String,
        nullable=False,
        default="off_duty"
    )

    # Relationship to user
    user = relationship("User", backref="driver")
