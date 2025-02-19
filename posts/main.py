from fastapi import FastAPI, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import conf
import httpx

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class PostInput(BaseModel):
    titulo: str
    idUsuario: int

def get_db():
    db= SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency= Annotated[Session, Depends(get_db)]
@app.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_posts(post: PostInput, db: db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    response = httpx.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    if not post.titulo or not post.idUsuario:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faltan campos")
    db_post=models.Post(titulo=post.titulo, idUsuario=post.idUsuario)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.put("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def update_posts(post_id:int,post: PostInput, db: db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    response = httpx.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    db_post.titulo=post.titulo
    db_post.idUsuario=post.idUsuario
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts" ,status_code=status.HTTP_200_OK)
async def get_posts(db:db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    response = httpx.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).all()
    return db_post

@app.get("/posts/{post_id}" ,status_code=status.HTTP_200_OK)
async def get_posts(post_id:int,db:db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    response = httpx.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    return db_post


@app.delete("/posts/{post_id}" ,status_code=status.HTTP_200_OK)
async def get_posts(post_id:int,db:db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    response = httpx.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    db.delete(db_post)
    db.commit()
    return "El post fue eliminado"


    




    