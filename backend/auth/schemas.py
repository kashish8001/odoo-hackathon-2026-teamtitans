from pydantic import BaseModel, EmailStr
from typing import Literal


# =============================================================================
# REQUEST SCHEMAS
# =============================================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================

from typing import Literal
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    role: Literal[
        "admin",
        "manager",
        "dispatcher",
        "driver",
        "viewer"
    ]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# =============================================================================
# JWT PAYLOAD
# =============================================================================

class TokenData(BaseModel):
    sub: int
    email: EmailStr
    role: Literal[
        "admin",
        "manager",
        "dispatcher",
        "driver",
        "viewer"
    ]


# =============================================================================
# DATABASE MODEL
# =============================================================================

class UserInDB(BaseModel):
    id: int
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    role: Literal[
        "admin",
        "manager",
        "dispatcher",
        "driver",
        "viewer"
    ]


# =============================================================================
# LOGIN RESPONSE
# =============================================================================

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse