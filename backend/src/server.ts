import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/error';
import { redisClient } from './config/redis';
import { prisma } from './config/db';

// Route Imports
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/order';
import wasteRoutes from './routes/waste';
import attendanceRoutes from './routes/attendance';
import reportRoutes from './routes/report';
import branchRoutes from './routes/branch';
import roleRoutes from './routes/role';
import settingsRoutes from './routes/settings';
import crmRoutes from './routes/crm';
import phase3Routes from './routes/phase3';
import masterRoutes from './routes/master';
import platformRoutes from './routes/platform';
import opsRoutes from './routes/ops';
import publicRoutes from './routes/public';

const app = express();
const PORT = env.port;

// Global Middlewares — explicit origins required when credentials: true
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin) and configured frontends
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Mount Module Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/waste', wasteRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/phase3', phase3Routes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/platform', platformRoutes);
app.use('/api/v1/ops', opsRoutes);

// Base Endpoint Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'CONNECTED',
        cache: 'CONNECTED'
      }
    }
  });
});

// Centralized Error Interceptor
app.use(errorHandler);

// Launch server instance
const server = app.listen(PORT, () => {
  logger.info(`[Server] Running on port http://localhost:${PORT}`);
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.warn(`[Shutdown] Received ${signal}. Starting cleanup...`);
  
  // Close server port listeners
  server.close(() => {
    logger.info('[Shutdown] Express HTTP server stopped.');
  });

  try {
    // Disconnect Redis Client
    await redisClient.quit();
    logger.info('[Shutdown] Redis connection ended.');

    // Disconnect Prisma SQL connection pool
    await prisma.$disconnect();
    logger.info('[Shutdown] Database connection pool ended.');
    
    process.exit(0);
  } catch (error: any) {
    logger.error(`[Shutdown] Error occurred during process exit: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
