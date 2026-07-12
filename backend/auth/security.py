from passlib.context import CryptContext

# =============================================================================
# Password Hashing Configuration
# =============================================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =============================================================================
# Hash Password
# =============================================================================

def hash_password(password: str) -> str:
    """
    Hash a plain text password before storing it in PostgreSQL.
    """
    return pwd_context.hash(password)


# =============================================================================
# Verify Password
# =============================================================================

def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Compare plain password with bcrypt hash.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# =============================================================================
# Utility (Only for testing)
# =============================================================================

if __name__ == "__main__":

    password = "admin123"

    hashed = hash_password(password)

    print("Password :", password)
    print("Hash     :", hashed)

    print(
        "Verified :",
        verify_password(password, hashed)
    )