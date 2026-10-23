import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .config import settings
from .database import engine, get_db, Base

logger = logging.getLogger("task_manager")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as exc:
        logger.warning("Database connection failed during table initialization: %s", exc)
    yield

app = FastAPI(
    title="Task Management Dashboard API",
    description="Production-grade Task Management API with PostgreSQL persistence",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
origins = settings.cors_origins_list
if "*" not in origins and settings.ENVIRONMENT == "development":
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=schemas.HealthResponse, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint that verifies database connectivity.
    Returns 200 OK if database is reachable, 503 if database check fails.
    """
    now = datetime.now(timezone.utc)
    try:
        # Verify database connection with a lightweight query
        db.execute(text("SELECT 1"))
        return schemas.HealthResponse(
            status="healthy",
            database="connected",
            timestamp=now,
        )
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "timestamp": now.isoformat(),
                "error": str(exc),
            },
        )

@app.get("/api/tasks/counts", response_model=schemas.TaskCountsResponse, tags=["Tasks"])
def get_task_counts(db: Session = Depends(get_db)):
    """Retrieve counts for total, pending, and completed tasks."""
    return crud.get_task_counts(db=db)

@app.get("/api/tasks", response_model=List[schemas.TaskResponse], tags=["Tasks"])
def list_tasks(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status: 'all', 'pending', or 'completed'"
    ),
    search: Optional[str] = Query(
        None,
        description="Search tasks by title substring"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve all tasks with optional status and title search filters."""
    if status_filter and status_filter.lower() not in ("all", "pending", "completed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status filter. Allowed values: 'all', 'pending', 'completed'",
        )

    norm_status = status_filter.lower() if status_filter and status_filter.lower() != "all" else None
    return crud.get_tasks(db=db, status=norm_status, search=search)

@app.post(
    "/api/tasks",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Tasks"]
)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    try:
        return crud.create_task(db=db, task_in=task_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@app.get("/api/tasks/{task_id}", response_model=schemas.TaskResponse, tags=["Tasks"])
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Retrieve a single task by ID."""
    task = crud.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return task

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse, tags=["Tasks"])
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a task's title, description, or completed status."""
    task = crud.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    try:
        return crud.update_task(db=db, db_task=task, task_in=task_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@app.delete("/api/tasks/{task_id}", tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task by ID."""
    task = crud.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    crud.delete_task(db=db, db_task=task)
    return {"message": "Task deleted successfully", "id": task_id}
