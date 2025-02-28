from dotenv import load_dotenv
import os

# Cargar variables desde el archivo .env si existe
load_dotenv()

# Obtener variables de entorno con valores por defecto
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "user_db")