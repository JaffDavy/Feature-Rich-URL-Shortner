import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
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

import pool from './src/config/db.js';

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err));


  const allowedOrigins = [
    'http://localhost:5173',
    'https://feature-rich-url-shortner-qc2ex8zfp-jaffdavys-projects.vercel.app',
    'https://feature-rich-url-shortner.vercel.app' // fallback default
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server error' });
});

export default app;
