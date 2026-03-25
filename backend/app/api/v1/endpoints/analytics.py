from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task, StatusEnum, PriorityEnum

router = APIRouter()

@router.get("/dashboard")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    
    total_tasks = len(user_tasks)
    completed_tasks = len([t for t in user_tasks if t.status == StatusEnum.COMPLETED])
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Priority distribution
    priority_dist = {"Low": 0, "Medium": 0, "High": 0}
    for t in user_tasks:
        priority_dist[t.priority.value] += 1

    # Task completion time average
    completed_task_objs = [t for t in user_tasks if t.status == StatusEnum.COMPLETED]
    total_completion_time = sum(
        ((t.updated_at or t.created_at) - t.created_at).total_seconds() for t in completed_task_objs
    )
    avg_completion_time_seconds = total_completion_time / completed_tasks if completed_tasks > 0 else 0
    avg_completion_time_hours = round(avg_completion_time_seconds / 3600, 2)
    
    # Tasks completed per day
    tasks_per_day = {}
    for t in completed_task_objs:
        day_str = (t.updated_at or t.created_at).strftime("%Y-%m-%d")
        tasks_per_day[day_str] = tasks_per_day.get(day_str, 0) + 1

    # Pending tasks per day (based on creation date)
    pending_task_objs = [t for t in user_tasks if t.status == StatusEnum.PENDING]
    pending_tasks_per_day = {}
    for t in pending_task_objs:
        day_str = t.created_at.strftime("%Y-%m-%d")
        pending_tasks_per_day[day_str] = pending_tasks_per_day.get(day_str, 0) + 1

    most_productive_day = max(tasks_per_day, key=tasks_per_day.get) if tasks_per_day else None
    
    # Productivity score formula: 
    # Base 10 points per completed task + 5 extra for high priority
    productivity_score = 0
    for t in completed_task_objs:
        productivity_score += 10
        if t.priority == PriorityEnum.HIGH:
            productivity_score += 5
            
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": round(completion_percentage, 2),
        "tasks_per_day": tasks_per_day,
        "pending_tasks_per_day": pending_tasks_per_day,
        "most_productive_day": most_productive_day,
        "average_completion_time_hours": avg_completion_time_hours,
        "priority_distribution": priority_dist,
        "productivity_score": productivity_score
    }
