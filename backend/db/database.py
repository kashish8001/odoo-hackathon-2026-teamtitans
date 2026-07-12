import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env
load_dotenv(find_dotenv())

DATABASE_URL = os.getenv("POSTGRES_NEON_DB")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./odoo.db"


if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        }
    )
else:
    engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()