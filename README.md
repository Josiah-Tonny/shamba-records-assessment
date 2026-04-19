# Shamba Records

A web application for managing agricultural fields and monitoring crop progress. Built with React, Express.js, and PostgreSQL.

## Quick Start

### Demo Accounts
Use these accounts to explore the application:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartseason.com | Admin@1234 |
| Agent | agent@smartseason.com | Agent@1234 |

## What It Does

- **Admin Dashboard**: Create fields, assign agents, view all field status
- **Agent Dashboard**: View assigned fields, post updates on crop progress
- **Field Tracking**: Automatic status calculation (Active, At Risk, Completed)
- **Secure Access**: Role-based login system

## Setup for Developers

### Prerequisites
- Node.js 20+
- A PostgreSQL database (Neon recommended)

### Installation

1. Clone and install:
```bash
git clone <repo-url>
cd shamba-records-assessment
npm install
```

2. Set up environment:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=another_secret_key
PORT=3001
```

3. Create database tables:
```bash
node create-tables.js
```

4. Add demo data (optional):
```bash
node src/server/seed.js
```

5. Start the app:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Design Decisions

### Why This Architecture?
- **Single Repository**: Frontend and backend together for simpler deployment
- **JWT Tokens**: Secure authentication without session storage
- **Computed Status**: Field status calculated from data, not stored separately
- **PostgreSQL**: Reliable, scalable database with Neon for free hosting

### Assumptions Made
- One agent assigned per field (simplified for initial version)
- Field stages progress in order (planted → growing → harvested)
- Admin users are trusted to manage all fields
- All users have internet access (cloud-based deployment)

### Key Features
- **Role-Based Access**: Admins see everything, agents see only their fields
- **Auto Status**: Fields marked "At Risk" if no updates for 90+ days
- **Mobile Friendly**: Works on phones and tablets
- **No Local Storage**: Sensitive data never stored in browser

## Deployment

The app is deployed on Vercel. To deploy your own:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Connect a PostgreSQL database (Neon recommended)
5. Deploy

## Project Structure

```
src/
├── server/          # Backend API (Express)
├── pages/           # React pages (Login, Dashboard, etc.)
├── components/      # Reusable UI components
├── context/         # Authentication state
└── hooks/           # Custom React hooks
```

## Troubleshooting

**Database connection fails**
- Check DATABASE_URL in .env file
- Ensure database is running and accessible

**Login not working**
- Verify JWT_SECRET is set in environment
- Check that database has users table with data

**Build errors**
- Run `npm install` to update dependencies
- Clear node_modules and reinstall if needed

## License

MIT License - see LICENSE file for details.
