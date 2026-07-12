import bcrypt

# =============================================================================
# Password Hashing Configuration & Helpers
# =============================================================================

def hash_password(password: str) -> str:
    """
    Hash a plain text password before storing it in PostgreSQL.
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


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
    plain_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


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