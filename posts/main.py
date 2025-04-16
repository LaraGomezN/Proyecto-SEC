from fastapi import FastAPI, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import conf
import httpx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)

class PostInput(BaseModel):
    titulo: str
    contenido:str



def get_db():
    db= SessionLocal()
    try:
        yield db
    finally:
        db.close()

# crear post
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
    db_post = models.Post(titulo=post.titulo, contenido=post.contenido, idUsuario=idUsuario)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# actualizar post
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
    db_post.contenido=post.contenido
    db_post.idUsuario=idUsuario
    db.commit()
    db.refresh(db_post)
    return db_post

# listar posts
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
    return db_post


@app.post("/posts/{post_id}/tags/{tag_id}", status_code=status.HTTP_201_CREATED)
async def create_post_tag(post_id:int, tag_id:int, db: db_dependency, request: Request):
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
    urlTags=f"http://{conf.TAGS_PATH}/tags/{tag_id}"
    async with httpx.AsyncClient() as client:
        responseTags = await client.get(urlTags, headers=headers)
    if responseTags.status_code!=200:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag no encontrado")
    db_post=db.query(models.Post).filter(models.Post.id== post_id).first()
    if not db_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    db_post=models.PostTags(idPost=post_id, idTag=tag_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

#Obtener los tags de un post
@app.get("/posts/{post_id}/tags", status_code=status.HTTP_200_OK)
async def get_tags(post_id:int,db: db_dependency, request: Request=None):
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
    allTags=db.query(models.PostTags).filter(models.PostTags.idPost==post_id).all()
    tag_ids = [tag.idTag for tag in allTags]
    tags_info = []
    for tag_id in tag_ids:
        url = f"http://{conf.TAGS_PATH}/tags/{tag_id}"
        response = httpx.get(url, headers=headers)
        if response.status_code == 200:
            tags_info.append(response.json()) 
        else:
            print(f"Error al obtener el tag {tag_id}: {response.status_code}")
    
    return tags_info
    
#post por tag    
@app.get("/posts/tags/{tag_id}", status_code=status.HTTP_200_OK)
async def get_posts_by_tag(tag_id: int, db: db_dependency, request: Request):
    headers = dict(request.headers)
    authHeader = request.headers.get("Authorization")
    if not authHeader:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No hay token")

    # Verificar el token con USERS_PATH
    url = f"http://{conf.USERS_PATH}/"
    headers = {"Authorization": f"{authHeader}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    # Obtener todos los posts que tienen el tag especificado
    post_tags = db.query(models.PostTags).filter(models.PostTags.idTag == tag_id).all()
    if not post_tags:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay posts con este tag")

    # Obtener los IDs de los posts con este tag
    post_ids = [pt.idPost for pt in post_tags]
    posts = db.query(models.Post).filter(models.Post.id.in_(post_ids)).all()

    return posts
    
@app.get("/ping", status_code=status.HTTP_200_OK)
async def healthCheck():
    """
    Health check endpoint.
    """
    return {"status": "pong"}




    
