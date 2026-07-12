from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from auth.schemas import TokenData

# =============================================================================
# JWT Configuration
# =============================================================================

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY_FOR_HACKATHON"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours


# =============================================================================
# Create JWT Token
# =============================================================================

def create_access_token(
    user_id: int,
    role: str,
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# =============================================================================
# Decode JWT Token
# =============================================================================

def decode_access_token(
    token: str,
) -> Optional[TokenData]:

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")

        if (
            user_id is None
            or email is None
            or role is None
        ):
            return None

        return TokenData(
            sub=int(user_id),
            email=email,
            role=role,
        )

    except JWTError:
        return None


# =============================================================================
# Test
# =============================================================================

if __name__ == "__main__":

    token = create_access_token(
        user_id=1,
        email="admin@test.com",
        role="admin",
    )

    print("TOKEN:\n")
    print(token)

    print("\nDECODED:\n")
    print(decode_access_token(token))