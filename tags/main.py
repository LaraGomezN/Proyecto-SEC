from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Tags
from starlette import status

router = FastAPI(
    prefix="/tags",
    tags=["tags"]
)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Depends(get_db)

# Modelo de datos para validación con Pydantic
class TagBase(BaseModel):
    topic: str

# Crear una nueva etiqueta
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_tag(tag: TagBase, db: Session = db_dependency):
    db_tag = Tags(topic=tag.topic)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Obtener todas las etiquetas
@router.get("/", status_code=status.HTTP_200_OK)
async def get_tags(db: Session = db_dependency):
    return db.query(Tags).all()

# Obtener una etiqueta por ID
@router.get("/{tag_id}", status_code=status.HTTP_200_OK)
async def get_tag(tag_id: int, db: Session = db_dependency):
    tag = db.query(Tags).filter(Tags.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Etiqueta no encontrada")
    return tag

# Actualizar una etiqueta
@router.put("/{tag_id}", status_code=status.HTTP_200_OK)
async def update_tag(tag_id: int, tag: TagBase, db: Session = db_dependency):
    db_tag = db.query(Tags).filter(Tags.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Etiqueta no encontrada")
    
    db_tag.topic = tag.topic
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Eliminar una etiqueta
@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: int, db: Session = db_dependency):
    db_tag = db.query(Tags).filter(Tags.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Etiqueta no encontrada")
    
    db.delete(db_tag)
    db.commit()
    return {"message": "Etiqueta eliminada"}
