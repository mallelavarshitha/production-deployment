from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from .config import settings

# Engine configuration
is_sqlite = "sqlite" in settings.sqlalchemy_database_url
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.sqlalchemy_database_url,
    connect_args=connect_args,
    pool_pre_ping=not is_sqlite,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
