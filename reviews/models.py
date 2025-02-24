from sqlalchemy import Column, Integer, Float, ForeignKey, String
from database import Base
from sqlalchemy.orm import relationship

class Reviews(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(Integer,index=True)
    score = Column(Float,index=True)
    comment = Column (String, index=True)