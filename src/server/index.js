import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import fieldsRoutes from './routes/fields.js';
import pool from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform check if this is the main module
const isMainModule = () => {
  const argPath = path.normalize(process.argv[1]);
  const modulePath = path.normalize(__filename);
  return argPath === modulePath || argPath === modulePath.replace('.js', '');
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-vercel-app.vercel.app'] // Replace with your Vercel domain
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'], // Vite dev server
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// API Routes (must come before static serving)
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../../dist');
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date().toISOString() } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Database health check on startup
const startServer = async () => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', dbResult.rows[0].current_time);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api`);
      console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Database connection failed. Check DATABASE_URL in .env');
    process.exit(1);
  }
};

// Start server if this is the main module (direct execution)
if (isMainModule()) {
  startServer();
}

export default app;