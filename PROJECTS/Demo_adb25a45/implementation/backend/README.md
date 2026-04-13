# TaskFlow Backend Documentation

## Overview
TaskFlow is a task management application that allows users to organize their tasks efficiently. This backend service provides RESTful APIs for managing users, tasks, tags, and notifications with MongoDB as the database.

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Notifications**: Scheduled notifications using cron jobs

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── .env.example        # Environment variable template
└── README.md           # This file
```

## Setup Instructions

### Prerequisites
- Node.js >= 16.x
- MongoDB instance (local or cloud)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd taskflow/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and update values accordingly:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| POST   | `/api/auth/register`  | Register a new user          |
| POST   | `/api/auth/login`     | Log in an existing user      |
| GET    | `/api/auth/profile`   | Get authenticated user info  |

### Tasks
| Method | Endpoint            | Description                   |
|--------|---------------------|-------------------------------|
| GET    | `/api/tasks`        | Fetch all tasks of the user   |
| GET    | `/api/tasks/:id`    | Fetch a specific task         |
| POST   | `/api/tasks`        | Create a new task             |
| PUT    | `/api/tasks/:id`    | Update a task                 |
| DELETE | `/api/tasks/:id`    | Delete a task                 |
| DELETE | `/api/tasks/clear-completed` | Clear completed tasks |

### Tags
| Method | Endpoint         | Description                |
|--------|------------------|----------------------------|
| GET    | `/api/tags`      | Fetch all tags of the user |
| POST   | `/api/tags`      | Create a new tag           |
| DELETE | `/api/tags/:id`  | Delete a tag               |

### Notifications
| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| GET    | `/api/notifications`  | Fetch all user notifications    |
| PUT    | `/api/notifications/:id/read` | Mark notification as read |

## Features Implemented

### FR1: User Authentication
Users can register, log in, and reset passwords via email. Passwords are securely hashed using bcrypt.

### FR2: Task Creation
Tasks include title, description, and optional due date fields. Each task belongs to a single user.

### FR3: Task Tagging
Each task can have multiple associated tags which help categorize tasks effectively.

### FR4: Task Status Tracking
Tasks support three statuses: Pending, In Progress, Completed.

### FR5: Priority Assignment
Tasks can be assigned one of three priorities: Low, Medium, High.

### FR6: Task Deletion
Users may delete individual tasks or clear all completed tasks at once.

### FR7: Search & Filtering
Tasks can be searched by keywords and filtered by date range, priority level, or status.

### FR8: Due Date Notifications
The system sends reminder notifications 30 minutes before any task’s due time using scheduled background jobs.

## Security Practices
- All communication over HTTPS
- Input validation on all endpoints
- Rate limiting implemented on auth routes
- JWT tokens used for session management
- CORS enabled only for trusted origins

## Development Guidelines

### Code Style
Follows Airbnb JavaScript style guide with ESLint configuration included.

### Testing
Unit tests written using Jest framework:
```bash
npm test
```

Integration tests cover major workflows including authentication and CRUD operations.

### Linting
Run linter to ensure code quality:
```bash
npm run lint
```

Auto-fix issues where possible:
```bash
npm run lint:fix
```

## Deployment

### Environment Variables Required
Ensure these are set in your deployment environment:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=mysecretkey
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### Hosting Options
Recommended platforms:
- AWS EC2 + MongoDB Atlas
- Heroku + MongoDB Atlas
- DigitalOcean App Platform

Build command:
```bash
npm run build
```

Start command:
```bash
npm start
```

## Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add some feature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.