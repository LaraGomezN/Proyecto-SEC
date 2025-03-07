from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import Users
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

#import secrets
#print(secrets.token_urlsafe(50))

router = APIRouter(
    prefix = "/auth",
    tags = ["auth"]
)

SECRET_KEY = "OSyy8YWFQZE4OSFqDVNUu502pHA_x7k8Sd2FpYdiEaoka7i-VH3bh_W9HOUk-rD2Nbc"
ALGORITHM = "HS256"

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="token")  #Se cambio la ruta de auth/token a token

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

"""@router.post("/", status_code=status.HTTP_201_CREATED) #Verificar la ruta /users
async def createUser(db: db_dependency, create_user_request: CreateUserRequest):
    create_user_model = Users(
        name = create_user_request.name,
        email = create_user_request.email,
        password = bcrypt_context.hash(create_user_request.password)
    )
    db.add(create_user_model)
    db.commit()"""

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar el usuario.")
    
    token = create_access_token(user.name, user.id, timedelta(minutes=20))

    return {"access_token": token, "token_type": "bearer"}


#####NUEVO

def get_user_by_username(db: db_dependency, username:str):
    return db.query(Users).filter(Users.name == username).first()

def create_user(db: db_dependency, user:CreateUserRequest):
    password = bcrypt_context.hash(user.password)
    db_user = Users(name = user.name, email = user.email, password = password)
    db.add(db_user)
    db.commit()
    return "Complete"


#Esto funciona joya
@router.post("/register")
def register_user(user: CreateUserRequest, db:db_dependency):
    db_user = get_user_by_username(db, username=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="Usuario ya registrado")
    return create_user(db=db, user=user)


def verify_token(token: str = Depends(oauth2_bearer)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Token no es válido o ya expiró")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token no es válido o ya expiró")
    
@router.get("/verify-token/{token}")
async def verify_user_token(token: str):
    verify_token(token = token)
    return {"message": "Token invalido"}


######  

def authenticate_user(username: str, password:str, db):
    user = db.query(Users).filter(Users.name == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user
    

def create_access_token(username:str, user_id:str, expires_delta: timedelta):
    encode = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)



async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar el usuario.")
        return {"username": username, "id": user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar el usuario.")
    