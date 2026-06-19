from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2 with SHA256.
    """
    return generate_password_hash(password, method='pbkdf2:sha256')

def check_password(password_hash: str, password: str) -> bool:
    """
    Checks if a password matches its hash.
    """
    return check_password_hash(password_hash, password)
