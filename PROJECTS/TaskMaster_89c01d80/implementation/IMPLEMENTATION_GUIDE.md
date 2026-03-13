# Implementation Guide

## 1. Naming Conventions

### Files and Directories
- Python files: `snake_case.py` (e.g., `auth_service.py`)
- React components: `PascalCase.tsx` (e.g., `TaskList.tsx`)
- Database migrations: `YYYYMMDDHHMMSS_description.py`

### Variables and Functions
- Python: `snake_case` (e.g., `get_user_by_id()`)
- JavaScript/TypeScript: `camelCase` (e.g., `getUserById()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET_KEY`)

### Classes and Models
- Python classes: `PascalCase` (e.g., `UserModel`)
- Database tables: `snake_case` plural (e.g., `users`, `task_tags`)

### API Endpoints
- RESTful paths: `/api/v1/resource/{id}`
- Query parameters: `snake_case`
- JSON keys in requests/responses: `snake_case`

## 2. Database Schema

### Users Table
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Tasks Table
```python
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="todo")  # todo, in_progress, done
    priority = Column(Integer, default=1)   # 1-5
    due_date = Column(DateTime)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Tags Table
```python
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    color = Column(String)  # Hex color code
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Task-Tag Association Table
```python
task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", UUID(as_uuid=True), ForeignKey("tasks.id")),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id"))
)
```

## 3. API Endpoints

### Authentication Endpoints
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/v1/auth/signup` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Authenticate user |
| POST | `/api/v1/auth/reset-password` | No | Request password reset |
| POST | `/api/v1/auth/reset-password/confirm` | No | Confirm password reset |

### Task Endpoints
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/api/v1/tasks` | Yes | List all tasks for current user |
| GET | `/api/v1/tasks/{id}` | Yes | Get specific task |
| POST | `/api/v1/tasks` | Yes | Create new task |
| PUT | `/api/v1/tasks/{id}` | Yes | Update task |
| DELETE | `/api/v1/tasks/{id}` | Yes | Delete task |

### Tag Endpoints
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/api/v1/tags` | Yes | List all tags |
| POST | `/api/v1/tags` | Yes | Create new tag |
| PUT | `/api/v1/tags/{id}` | Yes | Update tag |
| DELETE | `/api/v1/tags/{id}` | Yes | Delete tag |

## 4. Authentication Flow

### JWT Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": "expiration_timestamp",
  "iat": "issued_at_timestamp"
}
```

### Middleware Chain
1. **CORS Middleware** - Handle cross-origin requests
2. **Auth Middleware** - Validate JWT token
3. **Error Handler Middleware** - Catch and format errors
4. **Route Handlers** - Process authenticated requests

### Token Flow
1. User submits credentials to `/login`
2. Server validates and generates JWT
3. Client stores token in localStorage/cookies
4. Client includes `Authorization: Bearer <token>` in subsequent requests
5. Auth middleware validates token before route handler execution

## 5. Key Shared Types/Interfaces

### User Schema (Pydantic)
```python
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserInDB(UserBase):
    id: UUID4
    is_active: bool
    is_superuser: bool
    
    class Config:
        orm_mode = True
```

### Task Schema
```python
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[int] = 1
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskInDB(TaskBase):
    id: UUID4
    owner_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
```

### Tag Schema
```python
class TagBase(BaseModel):
    name: str
    color: Optional[str] = None

class TagCreate(TagBase):
    pass

class TagUpdate(TagBase):
    pass

class TagInDB(TagBase):
    id: UUID4
    created_at: datetime
    
    class Config:
        orm_mode = True
```

## 6. Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Authentication
REACT_APP_JWT_SECRET=your-jwt-secret-here
```

## 7. Import Conventions

### Python Imports
```python
# Standard library first
from typing import Optional
import uuid

# Third-party packages
from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Local modules (relative imports)
from ..models.user import User
from ..schemas.user import UserCreate
from ..core.security import get_password_hash
```

### React Imports
```typescript
// External libraries first
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Internal components and utilities
import { Task } from '../types/task';
import { apiClient } from '../utils/api';
import TaskItem from './TaskItem';
```

### Absolute vs Relative Paths
- Within same module level: relative imports (`from .models import User`)
- Cross-module references: absolute imports (`from app.models.user import User`)
- Frontend shared utilities: absolute paths (`@/components/Button`)