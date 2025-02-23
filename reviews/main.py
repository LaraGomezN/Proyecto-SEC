from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, confloat
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Reviews
from starlette import status

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Depends(get_db)

class ReviewBase(BaseModel):
    post_id: int
    user_id: int
    score: confloat(ge=0, le=5)  # de 0 a 5, no ?

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_review(review: ReviewBase, db: Session = db_dependency):
    db_review = Reviews(post_id=review.post_id, user_id=review.user_id, score=review.score)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/", status_code=status.HTTP_200_OK)
async def get_reviews(db: Session = db_dependency):
    return db.query(Reviews).all()


@router.get("/{review_id}", status_code=status.HTTP_200_OK)
async def get_review(review_id: int, db: Session = db_dependency):
    review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review


@router.put("/{review_id}", status_code=status.HTTP_200_OK)
async def update_review(review_id: int, review: ReviewBase, db: Session = db_dependency):
    db_review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    db_review.post_id = review.post_id
    db_review.user_id = review.user_id
    db_review.score = review.score
    db.commit()
    db.refresh(db_review)
    return db_review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: int, db: Session = db_dependency):
    db_review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    db.delete(db_review)
    db.commit()
    return {"message": "Review deleted"}
