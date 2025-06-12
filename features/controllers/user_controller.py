from fastapi import APIRouter, HTTPException, Depends, Header, Request
from sqlalchemy.orm import Session
from database import get_db
from features.models.user_model import UserCreate, UserLogin, UserResponse
from features.services import user_service
from fastapi.responses import JSONResponse
import jwt
from features.repository import user_repository

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = user_service.create_user_service(db, user)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        result = user_service.login_user_service(db, user)
        # Return token and user info
        return JSONResponse(content=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Token verification endpoint
@router.get("/verify-token")
def verify_token(Authorization: str = Header(...)):
    try:
        token = Authorization.split("Bearer ")[-1]
        payload = jwt.decode(token, user_service.SECRET_KEY, algorithms=[user_service.ALGORITHM])
        return {"valid": True, "payload": payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/users")
def list_users(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[-1]
    try:
        jwt.decode(token, user_service.SECRET_KEY, algorithms=[user_service.ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    users = user_repository.get_all_users(db)
    user_list = []
    for user in users:
        user_token = user_service.create_access_token({"sub": user.email, "name": user.name})
        user_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "token": user_token
        })
    return user_list
