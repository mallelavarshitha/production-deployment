# Project 20: Production Deployment (Python Stack) - Task Management Dashboard

A complete, production-grade, full-stack Task Management Dashboard built with **FastAPI**, **SQLAlchemy 2.x**, **PostgreSQL 16** (Docker), and **React** with **Vite**.

---

## Tech Stack

- **Frontend**: React 18, Vite, JavaScript, CSS3
- **Backend**: Python 3.12+ (tested on Python 3.13), FastAPI, Uvicorn, SQLAlchemy 2.0 (psycopg3 driver), Pydantic v2
- **Database**: PostgreSQL 16 Alpine running in Docker with persistent volume
- **Testing**: pytest, HTTPX, SQLite in-memory test isolation

---

## Features

1. **Create Tasks**: Add tasks with title and optional description.
2. **View All Tasks**: Chronologically ordered task list with real-time status.
3. **Edit & Delete Tasks**: Update task title, description, or status in a modal dialog; safely delete with confirmation.
4. **Mark Completed / Pending**: Instant optimistic toggle with state synchronization.
5. **Search by Title**: Live filter tasks by title substring.
6. **Filter by Status**: View `All`, `Pending`, or `Completed` tasks.
7. **Task Statistics**: Dynamic count metrics for Total, Pending, and Completed tasks, plus completion rate percentage.
8. **Responsive UI States**: Loading skeleton placeholders, empty states with friendly guidance, toast feedback, and error state recovery.
9. **PostgreSQL Persistence**: All tasks are stored in PostgreSQL 16 (not localStorage).
10. **Health Check & Resilience**: `/api/health` endpoint actively executes database verification and reports status to the UI badge.

---

## Project Structure

```text
production-deployment/
├── .env                     # Local environment variables (not committed)
├── .env.example             # Safe environment variable template
├── .gitignore               # Git ignore rules for Python, Node, Docker
├── compose.yaml             # Docker Compose configuration for PostgreSQL 16
├── README.md                # Project documentation and execution instructions
├── backend/
│   ├── pytest.ini           # pytest configuration
│   ├── requirements.txt     # Python dependencies
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings loader with pydantic-settings
│   │   ├── crud.py          # Database queries & transactions
│   │   ├── database.py      # SQLAlchemy 2.0 engine & session generator
│   │   ├── models.py        # Task ORM model
│   │   ├── schemas.py       # Pydantic schemas and validators
│   │   └── main.py          # FastAPI application & route endpoints
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py      # pytest fixtures & in-memory SQLite setup
│       ├── test_health.py   # Health check tests (healthy & 503 error)
│       └── test_tasks.py    # Complete CRUD & validation test suite
└── frontend/
    ├── index.html           # HTML entry point with Inter font
    ├── package.json         # Node.js dependencies & scripts
    ├── vite.config.js       # Vite dev server with /api proxy to FastAPI
    └── src/
        ├── main.jsx         # React root rendering
        ├── App.jsx          # Main application orchestrator & state
        ├── App.css          # Modern responsive dashboard styles
        ├── index.css        # Global CSS variables & reset
        ├── api.js           # API client service for backend endpoints
        └── components/
            ├── Header.jsx       # Navigation header & live DB status badge
            ├── StatsBar.jsx     # Task metric cards & completion progress
            ├── TaskFilter.jsx   # Search input & status filter tabs
            ├── TaskForm.jsx     # Responsive task creation card
            ├── TaskItem.jsx     # Individual task card with actions
            ├── TaskList.jsx     # Content, loading, empty, and error states
            ├── TaskModal.jsx    # Modal dialog for task editing
            └── Toast.jsx        # Floating notifications
```

---

## Database Model

Each Task record in PostgreSQL (`tasks` table) contains:

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | Primary Key, Autoincrement, Indexed |
| `title` | `VARCHAR(255)` | Not Null, Indexed, min length 1 |
| `description` | `TEXT` | Nullable |
| `completed` | `BOOLEAN` | Not Null, Default `FALSE`, Indexed |
| `created_at` | `TIMESTAMPTZ` | Not Null, Server Default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not Null, Server Default `NOW()`, auto-updated |

---

## API Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/health` | Verifies PostgreSQL connectivity (`SELECT 1`) | `200 OK` / `503 Service Unavailable` |
| `GET` | `/api/tasks` | Lists all tasks (supports `?status=all\|pending\|completed` and `?search=term`) | `200 OK` |
| `GET` | `/api/tasks/counts` | Returns total, pending, and completed task counts | `200 OK` |
| `POST` | `/api/tasks` | Creates a new task (validates non-empty title) | `201 Created` / `422 Unprocessable` |
| `GET` | `/api/tasks/{task_id}` | Retrieves a single task by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/tasks/{task_id}` | Updates task title, description, or completed status | `200 OK` / `404 Not Found` / `422` |
| `DELETE` | `/api/tasks/{task_id}` | Deletes a task by ID | `200 OK` / `404 Not Found` |

---

## Local Development & Startup Guide

Follow these exact Windows PowerShell commands from the project root:
`c:\Users\varsh\OneDrive\Desktop\production-deployment`

### Step 1: Start PostgreSQL 16 in Docker

Ensure Docker Desktop is running, then execute:

```powershell
docker compose up -d
```

Verify that the container is healthy:

```powershell
docker compose ps
```

*Expected output*: `project20-postgres` with status `Up (healthy)`.

---

### Step 2: Set Up Backend Virtual Environment & Install Dependencies

Open a PowerShell terminal in the project root:

```powershell
# Create Python virtual environment inside backend
python -m venv backend\.venv

# Activate the virtual environment
.\backend\.venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r backend\requirements.txt
```

---

### Step 3: Run Backend Tests

Run the test suite (isolated in-memory test database, no external dependencies needed):

```powershell
# From the project root with the virtual environment activated:
pytest backend
```

---

### Step 4: Start the FastAPI Backend Server

```powershell
# Start FastAPI backend with hot reloading on port 8000
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

---

### Step 5: Install Frontend Dependencies & Start Vite Server

Open a second PowerShell terminal in the project root:

```powershell
# Change directory to frontend
Set-Location frontend

# Install npm dependencies
npm install

# Start the Vite development server on port 5173
npm run dev
```

---

## Expected Application URLs

| Service | Protocol & URL | Description |
|---|---|---|
| **Production Frontend & API (HTTPS)** | [https://localhost](https://localhost) | Production SSL Task Dashboard (Nginx Reverse Proxy) |
| **HTTP Redirect (Port 80)** | [http://localhost](http://localhost) | Automatically redirects (301) to `https://localhost` |
| **Direct Backend Docs (Internal/Dev)** | [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI Interactive Swagger UI |
| **Direct Backend Health** | [http://localhost:8000/api/health](http://localhost:8000/api/health) | Database Health Check |

---

## Production Docker Compose (Full Stack with HTTPS)

The production setup runs **4 containers** with Docker Compose, persistent volumes, environment configuration, and SSL termination:

1. **`project20-nginx`**: Listens on port 80 (redirects to HTTPS) and 443 (terminates TLS/SSL).
2. **`project20-frontend`**: React production build served via Nginx.
3. **`project20-backend`**: FastAPI application connected to PostgreSQL via SQLAlchemy 2.0.
4. **`project20-postgres`**: PostgreSQL 16 Alpine with health check and named persistent volume.

### Commands to Run & Inspect

```powershell
# 1. Build and start all 4 services
docker compose up -d --build

# 2. Check running container status
docker compose ps

# 3. Check real-time resource utilization (CPU, Memory, Network)
docker stats --no-stream

# 4. View container logs
docker compose logs -f
```

---

## Docker Compose & Data Management

- Stop the PostgreSQL container without losing data:
  ```powershell
  docker compose stop
  ```

- Start the stopped container:
  ```powershell
  docker compose start
  ```

- Tear down container and remove volume (resets all tasks):
  ```powershell
  docker compose down -v
  ```
