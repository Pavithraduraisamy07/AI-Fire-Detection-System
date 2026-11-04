import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import User
from models.schemas import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_pw(user_in.password),
        full_name=user_in.full_name or "Operator",
        role=user_in.role or "OPERATOR"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    fake_jwt = f"token_bearer_{new_user.id}_{hash_pw(new_user.username)[:16]}"
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        token=fake_jwt
    )

@router.post("/login", response_model=UserResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_in.username).first()
    if not user or user.hashed_password != hash_pw(login_in.password):
        # Demo fallback for instant testing if db was freshly seeded
        if login_in.username in ["admin", "operator"] and login_in.password in ["admin123", "operator123"]:
            return UserResponse(
                id=1,
                username=login_in.username,
                email=f"{login_in.username}@fireprevention.iot",
                full_name="Fire Chief Administrator" if login_in.username == "admin" else "Control Room Operator",
                role="ADMIN" if login_in.username == "admin" else "OPERATOR",
                token=f"token_bearer_{login_in.username}_verified_session"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Try username: admin, password: admin123"
        )

    fake_jwt = f"token_bearer_{user.id}_{hash_pw(user.username)[:16]}"
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=fake_jwt
    )
