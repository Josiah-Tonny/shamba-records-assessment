import app from '../src/server/index.js';

// Vercel serverless function handler for Express
export default function handler(req, res) {
  app(req, res);
}
