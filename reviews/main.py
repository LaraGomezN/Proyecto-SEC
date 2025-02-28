from fastapi import APIRouter, Depends, HTTPException, Request, FastAPI
from pydantic import BaseModel, confloat
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Reviews
from starlette import status
import httpx
import conf
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)
router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Depends(get_db)

class ReviewBase(BaseModel):
    post_id: int
    score: confloat(ge=0, le=5)  # de 0 a 5, no ?
    comment: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_review(review: ReviewBase, db: Session = db_dependency, request: Request=None):
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
    urlPosts = f"http://{conf.POSTS_PATH}/posts/{review.post_id}"
    async with httpx.AsyncClient() as client:
        responsePosts = await client.get(urlPosts, headers=headers)
    if responsePosts.status_code!=200:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    idUsuario=response.json()['User']['id']
    db_review = Reviews(post_id=review.post_id, user_id=idUsuario, score=review.score, comment=review.comment)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/", status_code=status.HTTP_200_OK)
async def get_reviews(db: Session = db_dependency, request: Request=None):
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
    return db.query(Reviews).all()


@router.get("/{review_id}", status_code=status.HTTP_200_OK)
async def get_review(review_id: int, db: Session = db_dependency, request: Request=None):
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
    review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review

# Actualizar
@router.put("/{review_id}", status_code=status.HTTP_200_OK)
async def update_review(review_id: int, review: ReviewBase, db: Session = db_dependency, request: Request=None):
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
    db_review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    urlPosts = f"http://{conf.POSTS_PATH}/posts/{review.post_id}"
    async with httpx.AsyncClient() as client:
        responsePosts = await client.get(urlPosts, headers=headers)
    if responsePosts.status_code!=200:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    
    db_review.post_id = review.post_id
    db_review.score = review.score
    db_review.comment= review.comment
    db.commit()
    db.refresh(db_review)
    return db_review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: int, db: Session = db_dependency, request: Request=None):
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
    db_review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    db.delete(db_review)
    db.commit()
    return "Review Deleted"

@app.get("/posts/{post_id}/reviews", status_code=status.HTTP_200_OK)
async def get_reviews(post_id:int,db: Session = db_dependency, request: Request=None):
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
    urlPosts = f"http://{conf.POSTS_PATH}/posts/{post_id}"
    async with httpx.AsyncClient() as client:
        responsePosts = await client.get(urlPosts, headers=headers)
    if responsePosts.status_code!=200:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")
    return db.query(Reviews).filter(Reviews.post_id==post_id).all()



app.include_router(router)