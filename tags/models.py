from sqlalchemy import Column, Integer, String
from database import Base

class Tags(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, unique=True, index=True)
