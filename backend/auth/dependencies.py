from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from auth.jwt import decode_access_token
from auth.schemas import TokenData
from db.database import get_db
from db.users import User

bearer_scheme = HTTPBearer(auto_error=True)

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)

async def get_current_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenData:
    token_data = decode_access_token(credentials.credentials)
    if token_data is None:
        raise _CREDENTIALS_EXCEPTION
    return token_data

async def get_current_user(
    token_data: TokenData = Depends(get_current_token),
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.id == token_data.sub).first()
    if user is None:
        raise _CREDENTIALS_EXCEPTION
    print("DEBUG: Loaded user", user.email, "with role", user.role)
    return user

# Role hierarchy: higher index = more access
_ROLE_HIERARCHY = [
    "viewer",
    "driver",
    "dispatcher",
    "manager",
    "admin",
]

def _role_rank(role: str) -> int:
    try:
        return _ROLE_HIERARCHY.index(role)
    except ValueError:
        return -1

def require_roles(*allowed_roles: str) -> Callable:
    allowed_set = set(allowed_roles)

    async def _guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(allowed_roles)}.",
            )
        return user

    return _guard

def require_min_role(minimum: str) -> Callable:
    min_rank = _role_rank(minimum)

    async def _guard(user: User = Depends(get_current_user)) -> User:
        user_rank = _role_rank(user.role)
        print("DEBUG: Checking role", user.role, "against minimum", minimum, f"({user_rank} vs {min_rank})")
        if user_rank < min_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Minimum required role: {minimum}.",
            )
        return user

    return _guard

AdminOnly = Depends(require_roles("admin"))
ManagerOrAbove = Depends(require_min_role("manager"))
DispatcherOrAbove = Depends(require_min_role("dispatcher"))
DriverOrAbove = Depends(require_min_role("driver"))
AnyAuthenticatedUser = Depends(get_current_user)
