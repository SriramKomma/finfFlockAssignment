import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Task Management API"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./task_management.db")

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-that-should-be-changed")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
