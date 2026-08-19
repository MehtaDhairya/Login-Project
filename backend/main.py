from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base
from schemas import UserCreate
from models import User
from pwdlib import PasswordHash
from schemas import UserCreate, UserLogin
from database import get_db
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
password_hash = PasswordHash.recommended()


@app.get("/")
def root():
    return {"message": "Database connected!"}


@app.post("/register")
def register(user: UserCreate):
    with Session(engine) as session:

        hashed_password = password_hash.hash(user.password)

        new_user = User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return {
            "message": "User registered successfully",
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }

@app.post("/login")
def login(user: UserLogin):
    with Session(engine) as session:

        existing_user = (
            session.query(User)
            .filter(User.email == user.email and User.is_deleted == False)
            .first()
        )

        if not existing_user:
            return {"message": "Invalid email or password"}

        if not password_hash.verify(
            user.password,
            existing_user.password_hash
        ):
            return {"message": "Invalid email or password"}

        return {
            "message": "Login successful",
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email
        }

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.is_deleted == False)
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]
@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_deleted == False
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.name = user_data.name

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_deleted == False
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_deleted = True

    db.commit()

    return {
        "message": "User deleted successfully"
    }
