from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base

class PriorityEnum(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class StatusEnum(str, enum.Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"
    ARCHIVED = "Archived"

class ActionTypeEnum(str, enum.Enum):
    CREATED = "created"
    UPDATED = "updated"
    COMPLETED = "completed"
    DELETED = "deleted"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.MEDIUM, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.PENDING, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="tasks")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="task")

class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(Enum(ActionTypeEnum), nullable=False)
    previous_state = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="history")
