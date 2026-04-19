import app from '../src/server/index.js';

// Vercel serverless function handler for Express
export default async function handler(req, res) {
  await app(req, res);
}
