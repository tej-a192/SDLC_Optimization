# TaskFlow Implementation Guide

## 1. Naming Conventions

### File Names
- Use kebab-case for all files (e.g., `user.model.ts`, `auth.routes.ts`)
- Configuration files end with `.config.ts`
- Model files end with `.model.ts`
- Route files end with `.routes.ts`
- Controller files end with `.controller.ts`
- Service files end with `.service.ts`

### Variable & Function Names
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Constants use UPPER_SNAKE_CASE

### Database Collections
- Collection names are lowercase plural (users, tasks, tags, notifications)

## 2. Database Schema

### User
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string, // hashed
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  status: 'pending' | 'in-progress' | 'completed',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  userId: ObjectId, // reference to User
  tags: ObjectId[], // references to Tags
  createdAt: Date,
  updatedAt: Date
}
```

### Tag
```typescript
{
  _id: ObjectId,
  name: string,
  color: string, // hex color code
  userId: ObjectId, // reference to User
  createdAt: Date
}
```

### Notification
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // reference to User
  title: string,
  message: string,
  read: boolean,
  taskId: ObjectId, // optional reference to Task
  createdAt: Date
}
```

## 3. API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login existing user |
| GET | `/api/auth/profile` | Yes | Get current user profile |

### Tasks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tasks` | Yes | Get all user's tasks |
| GET | `/api/tasks/:id` | Yes | Get specific task |
| POST | `/api/tasks` | Yes | Create new task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

### Tags
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tags` | Yes | Get all user's tags |
| POST | `/api/tags` | Yes | Create new tag |
| DELETE | `/api/tags/:id` | Yes | Delete tag |

### Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Yes | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Yes | Mark notification as read |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |

## 4. Authentication Flow

### JWT Structure
```json
{
  "userId": "string",
  "email": "string",
  "iat": "number",
  "exp": "number"
}
```

### Middleware Chain
1. **Auth Middleware**: Verifies JWT token validity
2. **User Middleware**: Loads user data from database
3. **Permission Middleware**: Checks user permissions (not needed for basic version)

Tokens expire in 24 hours.

## 5. Key Shared Types/Interfaces

### User Types
```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthPayload {
  userId: string;
  email: string;
}
```

### Task Types
```typescript
interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  userId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type TaskStatus = 'pending' | 'in-progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
```

### Tag Types
```typescript
interface Tag {
  _id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}
```

### Notification Types
```typescript
interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  taskId?: string;
  createdAt: Date;
}
```

## 6. Environment Variables

Create `.env` file with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=12

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3001
MOBILE_APP_URL=com.taskflow.app://
```

## 7. Import Conventions

### Absolute Imports
Use absolute imports for shared modules:
```typescript
import { User } from '@/models/user.model';
import { connectDB } from '@/config/database';
```

### Relative Imports
Use relative imports within same module:
```typescript
import { createTask } from '../services/task.service';
import { authenticate } from '../../middleware/auth.middleware';
```

### Import Order
1. External libraries (express, mongoose, etc.)
2. Shared types/interfaces
3. Internal modules (models, services, etc.)
4. Local utilities

Example controller import structure:
```typescript
// External libraries
import { Request, Response } from 'express';

// Shared types
import { Task } from '@/types/task.types';

// Services
import { createTaskService } from '@/services/task.service';

// Utilities
import { validateTask } from './task.validation';
```

## Additional Implementation Notes

### Error Handling
- All controllers should wrap logic in try/catch blocks
- Use consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details"
}
```

### Validation
- Validate all incoming request data
- Use express-validator or similar library
- Return 400 Bad Request for validation errors

### Logging
- Log all authentication attempts
- Log errors with stack traces
- Use consistent log format with timestamps

### Security
- Implement rate limiting on auth endpoints
- Sanitize all user inputs
- Use helmet for HTTP security headers
- Store passwords securely with bcrypt

This implementation guide ensures consistent development across all backend components while maintaining scalability and security best practices.