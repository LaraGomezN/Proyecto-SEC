from sqlalchemy import DateTime, Column, ForeignKey, Integer, String, func
from database import Base



class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True, index=True)
    titulo= Column(String, index=True)
    contenido= Column(String, index=True)
    fechaPublicacion = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    idUsuario = Column(Integer, index=True)
    
class PostTags(Base):
    __tablename__ = 'poststags'
    id = Column(Integer, primary_key=True, index=True)
    idPost = Column(Integer, index=True)
    idTag = Column(Integer, index=True)
    