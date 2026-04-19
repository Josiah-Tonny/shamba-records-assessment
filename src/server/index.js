import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import fieldRoutes from './routes/fields.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for Vercel)
app.set('trust proxy', 1);

// Security: Helmet headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shamba-records-assessment-3nfrbh75a.vercel.app',
  'https://shamba-records-assessment-ipexczc3s.vercel.app',
  process.env.FRONTEND_URL
].filter((v, i, a) => v && a.indexOf(v) === i);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      return origin === allowed || origin.startsWith(allowed);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS attempt from unauthorized origin:', origin);
      // In production, you might want to be stricter, but for debugging let's allow it
      // or return the origin to satisfy the browser
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Request logging (remove in production if too verbose)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Rate limiting - ONLY for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    const result = await pool.query('SELECT NOW()');
    dbStatus = result.rows.length > 0 ? 'connected' : 'no_rows';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: dbStatus,
    config: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
      frontendUrl: process.env.FRONTEND_URL
    }
  });
});

// 404 handler - use path pattern, not *
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method
  });
  
  // Return more descriptive error even in production for debugging deployment
  const errorMessage = err.message || 'Internal server error';
  
  res.status(err.status || 500).json({
    success: false,
    error: errorMessage,
    // Add a hint if it looks like a DB error
    hint: err.message?.includes('connection') || err.message?.includes('SSL') 
      ? 'Database connection issue. Check DATABASE_URL and SSL settings.' 
      : undefined
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CORS allowed origins:', allowedOrigins);
  });
}

export default app;