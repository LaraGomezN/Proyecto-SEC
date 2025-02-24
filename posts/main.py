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
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    if not post.titulo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faltan campos")
    idUsuario=response.json()['User']['id']
    db_post=models.Post(titulo=post.titulo, idUsuario=idUsuario)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    print("La respuesta es")
    print(response.json())
    return db_post


@app.put("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def update_posts(post_id:int,post: PostInput, db: db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    idUsuario=response.json()['User']['id']
    db_post.titulo=post.titulo
    db_post.idUsuario=idUsuario
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
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
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
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
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
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    db.delete(db_post)
    db.commit()
    return "El post fue eliminado"

@app.get("/users/posts" ,status_code=status.HTTP_200_OK)
async def get_posts(db:db_dependency, request: Request):
    headers=dict(request.headers)
    authHeader= request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code!=200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    idUsuario=response.json()['User']['id']
    db_post=db.query(models.Post).filter(models.Post.idUsuario== idUsuario).all()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    return db_post


    




    