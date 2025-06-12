import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from features.models.user_model import User, UserCreate, UserLogin
from features.repository import user_repository
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRETKEY") 
ALGORITHM = os.getenv("ALGO")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # Store as string

def verify_password(input_password: str, stored_hash: str) -> bool:
    # Compare input password with stored hashed password
    return bcrypt.checkpw(input_password.encode('utf-8'), stored_hash.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_user_service(db: Session, user_data: UserCreate):
    if user_repository.get_user_by_email(db, user_data.email):
        raise ValueError("User already exists")

    hashed_password = hash_password(user_data.password)
    print(user_data.name, user_data.email, hashed_password)  # Debugging line
    new_user = User(name=user_data.name, email=user_data.email, hashed_password=hashed_password)
    return user_repository.create_user(db, new_user)

def login_user_service(db: Session, login_data: UserLogin):
    user = user_repository.get_user_by_email(db, login_data.email)
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(login_data.password, user.hashed_password):
        raise ValueError("Invalid email or password")

    access_token = create_access_token({"sub": user.email, "name": user.name})
    return {"name": user.name, "email": user.email, "access_token": access_token}
