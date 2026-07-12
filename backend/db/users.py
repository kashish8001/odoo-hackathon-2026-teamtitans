from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="viewer"
    )

    first_name = Column(
        String,
        nullable=True
    )

    last_name = Column(
        String,
        nullable=True
    )


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    email: str,
    password_hash: str,
    first_name: str = "",
    last_name: str = "",
    role: str = "viewer",
):
    user = User(
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
