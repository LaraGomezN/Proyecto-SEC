from sqlalchemy import Column, Integer, Float, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Reviews(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    score = Column(Float, nullable=False)

    # Relationships
    post = relationship("Posts", back_populates="reviews")
    user = relationship("Users", back_populates="reviews")