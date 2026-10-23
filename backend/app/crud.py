from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from . import models, schemas

def get_tasks(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Task]:
    """Retrieve tasks with optional status filter and title search."""
    stmt = select(models.Task)

    if status == "completed":
        stmt = stmt.where(models.Task.completed.is_(True))
    elif status == "pending":
        stmt = stmt.where(models.Task.completed.is_(False))

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        stmt = stmt.where(models.Task.title.ilike(search_term))

    stmt = stmt.order_by(models.Task.created_at.desc())
    return list(db.scalars(stmt).all())

def get_task_counts(db: Session) -> schemas.TaskCountsResponse:
    """Retrieve total, pending, and completed task counts."""
    total = db.scalar(select(func.count(models.Task.id))) or 0
    completed = db.scalar(
        select(func.count(models.Task.id)).where(models.Task.completed.is_(True))
    ) or 0
    pending = total - completed
    return schemas.TaskCountsResponse(
        total=total,
        pending=pending,
        completed=completed
    )

def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    """Retrieve a single task by ID."""
    return db.get(models.Task, task_id)

def create_task(db: Session, task_in: schemas.TaskCreate) -> models.Task:
    """Create a new task."""
    task = models.Task(
        title=task_in.title,
        description=task_in.description.strip() if task_in.description else None,
        completed=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_task(
    db: Session,
    db_task: models.Task,
    task_in: schemas.TaskUpdate
) -> models.Task:
    """Update task fields."""
    update_data = task_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "description" and value is not None:
            value = value.strip() if value.strip() else None
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, db_task: models.Task) -> None:
    """Delete a task."""
    db.delete(db_task)
    db.commit()
