from sqlalchemy import Column, Integer, String
from database import Base

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) #Username no se puede repetir
    email = Column(String, index=True)
    password = Column(String, index=True)

