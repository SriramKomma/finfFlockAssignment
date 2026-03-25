from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.task import PriorityEnum, StatusEnum, ActionTypeEnum

class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    status: StatusEnum = StatusEnum.PENDING
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskHistoryResponse(BaseModel):
    id: int
    task_id: int
    action_type: ActionTypeEnum
    previous_state: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class TaskWithHistoryResponse(TaskResponse):
    history: List[TaskHistoryResponse] = []
