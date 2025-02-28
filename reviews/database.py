import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import conf

URL_DATABASE = f'postgresql://{conf.DB_USER}:{conf.DB_PASSWORD}@{conf.DB_HOST}:{conf.DB_PORT}/{conf.DB_NAME}'

# Espera a que la base de datos esté lista
MAX_RETRIES = 10
WAIT_TIME = 5  # Segundos

for i in range(MAX_RETRIES):
    try:
        engine = create_engine(URL_DATABASE)
        connection = engine.connect()
        connection.close()
        print("Conexión exitosa a la base de datos")
        break
    except Exception as e:
        print(f"Intento {i+1}/{MAX_RETRIES} fallido. Reintentando en {WAIT_TIME}s...")
        time.sleep(WAIT_TIME)
else:
    raise Exception("No se pudo conectar a la base de datos después de varios intentos.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()