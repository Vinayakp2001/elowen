from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

engine = create_engine(settings.database_url, echo=settings.environment == "development")


def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"[WARNING] Could not connect to database: {e}")
        print("[WARNING] Backend running without database — DB-dependent endpoints will fail.")


def get_session():
    with Session(engine) as session:
        yield session
