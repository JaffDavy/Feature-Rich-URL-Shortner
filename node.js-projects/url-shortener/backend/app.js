import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import { logger } from './src/utils/logger.js';
import { setupSwagger } from './src/config/swagger.js';
import authRoutes from './src/routes/auth.routes.js';
import urlRoutes from './src/routes/url.routes.js';
import redirectRoutes from './src/routes/redirect.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { rateLimiter } from './src/middleware/rateLimit.middleware.js';
import dotenv from 'dotenv';
dotenv.config();


// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Setup Swagger
setupSwagger(app);

// Apply rate limiting to all requests
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);
app.use('/s', redirectRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener API' });
});

// Error handler middleware
app.use(errorHandler);

// Remove app.listen — server is started in /bin/www


// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
