import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './utils/logger.js';
import swaggerSpec from './config/swagger.js';
import globalErrorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import { apiResponse } from './utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Data Compression
app.use(compression());

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api', rateLimiter);

// HTTP Request Logging
app.use(
    morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
    })
);

// Static file serving for uploads directory (if needed for temporary access, usually we don't serve Excel files publicly)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use(process.env.API_PREFIX || '/api/v1', routes);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(StatusCodes.OK).json({ status: 'UP', timestamp: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(StatusCodes.NOT_FOUND).json(
        apiResponse(false, `Resource not found: ${req.originalUrl}`)
    );
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
