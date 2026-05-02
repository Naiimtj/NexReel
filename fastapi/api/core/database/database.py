from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from api.config.env import settings

engine = create_engine(
    settings.sqlalchemy_database_url,
    pool_size=10,
    max_overflow=5,
    pool_recycle=3600,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
