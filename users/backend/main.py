from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Annotated
import models as models
from starlette import status
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import auth as auth
from auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth.router)
models.Base.metadata.create_all(bind=engine) #Create table and columns in postgres

class UserBase(BaseModel):
    name: str
    email: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

#POST
"""@app.post("/users")
async def createUser(user: UserBase, db: db_dependency):
    db_user = models.Users(name = user.name, email = user.email, password = user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)"""

#GET
"""@app.get("/users/{user_id}")
async def getUser(user_id: int, db: db_dependency):
    result = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not result:
        raise HTTPException(status_code=404, deatil='Usuario no encontrado')
    return result"""


#GET con validacion
@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, deatil='No se pudo validar el usuario.')
    return {"User": user}


#FRONT
origins = [
    "http://localhost:3000", #Revisar el puerto
    "https://dominio.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
