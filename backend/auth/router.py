from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

from auth.security import (
    verify_password,
    hash_password,
)
from auth.jwt import create_access_token

from db.users import (
    get_user_by_email,
    create_user,
)
from db.database import get_db


router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing = get_user_by_email(db, data.email)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = create_user(
        db=db,
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
    )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = get_user_by_email(
        db,
        data.email
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    token = create_access_token(
        user_id=user.id,
        role=user.role,
        email=user.email,
    )


    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },
    }


@router.post("/logout")
def logout():
    return {
        "message": "Logged out successfully"
    }