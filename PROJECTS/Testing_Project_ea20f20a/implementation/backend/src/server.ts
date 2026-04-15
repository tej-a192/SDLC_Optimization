import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import environment from './config/environment';
import { connectDB } from './config/database';
import taskRoutes from './routes/tasks.route';
import analyticsRoutes from './routes/analytics.route';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: environment.CORS_ORIGIN }));
app.use(morgan(environment.LOG_LEVEL === 'debug' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start server
connectDB().then(() => {
  app.listen(environment.PORT, () => {
    console.log(`Server is running on port ${environment.PORT} in ${environment.NODE_ENV} mode`);
  });
});

export default app;
