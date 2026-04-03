# To-Do Application Implementation Guide

## 1. Naming Conventions

### File Names
- Backend TypeScript files: `*.ts` (e.g., `task.controller.ts`)
- Frontend React components: `*.tsx` (e.g., `TaskItem.tsx`)
- Configuration files: `*.config.js`, `*.config.ts`
- Utility files: `*.util.ts`
- Middleware files: `*.middleware.ts`
- Route files: `*.route.ts`
- Model files: `*.model.ts`
- Service files: `*.service.ts`

### Variable and Function Names
- Use camelCase for variables and functions (e.g., `createTask`, `taskId`)
- Use PascalCase for classes and interfaces (e.g., `TaskService`, `ITask`)
- Constants in UPPER_SNAKE_CASE (e.g., `MAX_TASK_LENGTH`)

### Database Table Names
- Use snake_case plural form (e.g., `tasks`)
- Primary keys named `id`
- Foreign keys named `{table_name}_id`

## 2. Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Task Model (TypeScript)
```typescript
interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. API Endpoints

| Method | Path         | Auth Required | Description              |
|--------|--------------|---------------|--------------------------|
| GET    | /api/tasks   | No            | Get all tasks            |
| POST   | /api/tasks   | No            | Create a new task        |
| GET    | /api/tasks/:id | No          | Get a specific task      |
| PUT    | /api/tasks/:id | No          | Update a task            |
| DELETE | /api/tasks/:id | No          | Delete a task            |
| PATCH  | /api/tasks/:id/toggle | No   | Toggle task completion   |

## 4. Authentication Flow

Since this is a simple to-do app without user accounts, authentication is not implemented. All endpoints are publicly accessible.

If authentication were added in the future:
- JWT tokens would be issued upon login
- Tokens would be sent in Authorization header as Bearer token
- Middleware would validate tokens before processing requests
- Token payload would include userId and role information

## 5. Key Shared Types/Interfaces

### ITask Interface
```typescript
interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

### Request Validation Errors
```typescript
interface ValidationError {
  field: string;
  message: string;
}
```

## 6. Environment Variables

### Backend (.env.example)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USER=postgres
DB_PASSWORD=password

# Logging
LOG_LEVEL=info
```

### Frontend (.env.example)
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_LOGGING=true
```

## 7. Import Conventions

### Backend Imports
- Relative paths for local modules:
  ```typescript
  import { Task } from '../models/task.model';
  import { taskService } from '../services/task.service';
  ```
- Named imports for external packages:
  ```typescript
  import express from 'express';
  import { Request, Response } from 'express';
  ```

### Frontend Imports
- Components:
  ```typescript
  import TaskItem from './TaskItem';
  import AddTaskForm from './AddTaskForm';
  ```
- Utilities and hooks:
  ```typescript
  import { useTasks } from '../hooks/useTasks';
  import { apiClient } from '../utils/apiClient';
  ```
- Absolute imports for src directory:
  ```typescript
  import { ITask } from 'src/types/task.types';
  ```

### Import Order
1. External libraries
2. Internal modules (services, utils, etc.)
3. Types and interfaces
4. Constants
5. Component styles (in frontend)

All imports should be grouped and separated by blank lines for readability.