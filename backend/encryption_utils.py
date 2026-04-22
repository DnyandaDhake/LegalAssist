# encryption_utils.py

import os
from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv

# Load .env values
load_dotenv()

# Read key from .env
FERNET_KEY = os.getenv("FERNET_KEY")

if not FERNET_KEY:
    raise ValueError("FERNET_KEY is missing in .env file")

try:
    fernet = Fernet(FERNET_KEY.encode())
except Exception:
    raise ValueError("Invalid FERNET_KEY format in .env")


def encrypt_file(file_path: str):
    """
    Encrypts file in-place.
    Original file content is replaced by encrypted bytes.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "rb") as f:
        original_data = f.read()

    encrypted_data = fernet.encrypt(original_data)

    with open(file_path, "wb") as f:
        f.write(encrypted_data)

    return file_path


def decrypt_file(file_path: str):
    """
    Decrypts encrypted file and creates temporary PDF copy.
    Returns temp decrypted file path.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    try:
        decrypted_data = fernet.decrypt(encrypted_data)
    except InvalidToken:
        raise ValueError("Decryption failed: Invalid key or corrupted file")

    base, ext = os.path.splitext(file_path)
    temp_path = f"{base}_temp{ext}"

    with open(temp_path, "wb") as f:
        f.write(decrypted_data)

    return temp_path


def delete_temp_file(temp_path: str):
    """
    Deletes temporary decrypted file safely.
    """
    if os.path.exists(temp_path):
        os.remove(temp_path)