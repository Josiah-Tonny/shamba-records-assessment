# SmartSeason Field Monitoring System

A modern full-stack web application for managing agricultural fields and monitoring crop progress. Built with React, Express.js, Node.js, and PostgreSQL, deployed on Vercel.

## Features

- **Role-Based Access Control**: Admin and Field Agent roles with distinct dashboards
- **Field Management**: Create, update, and assign fields to agents
- **Real-Time Field Monitoring**: Track field status (Active, At Risk, Completed)
- **Field Updates**: Agents can post observations and stage updates
- **JWT Authentication**: Secure stateless authentication with httpOnly cookies
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Database**: PostgreSQL on Neon for reliable data storage

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| Authentication | JWT (access + refresh tokens) |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Deployment | Vercel |

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm or yarn
- A Neon PostgreSQL database account
- A Vercel account (for deployment)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd shamba-records-assessment
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   JWT_SECRET=your_super_secret_key_here
   JWT_REFRESH_SECRET=another_secret_key_here
   PORT=3001
   NODE_ENV=development
   VITE_API_URL=http://localhost:3001
   ```

3. **Create database schema**
   ```bash
   node create-tables.js
   ```

4. **Seed demo data**
   ```bash
   node src/server/seed.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartseason.com | Admin@1234 |
| Agent | agent@smartseason.com | Agent@1234 |

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login with email and password
- `POST /logout` - Logout (clears refresh token cookie)
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile

### Fields (`/api/fields`)
- `GET /` - Get all fields (Admin only)
- `GET /mine` - Get agent's assigned fields (Agent only)
- `GET /:id` - Get field details
- `POST /` - Create new field (Admin only)
- `PUT /:id` - Update field (Admin only)
- `DELETE /:id` - Delete field (Admin only)

### Field Updates (`/api/fields/:id/updates`)
- `GET /:id/updates` - Get field update history
- `POST /:id/updates` - Post field update (Assigned agent only)

## Project Structure

```
src/
├── server/              # Backend (Express.js)
│   ├── index.js
│   ├── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── fields.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fieldController.js
│   │   └── updateController.js
│   └── seed.js
├── context/
│   └── AuthContext.jsx   # Global auth state
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── AgentDashboard.jsx
│   ├── FieldDetail.jsx
│   └── NotFound.jsx
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── fields/
│   │   ├── FieldCard.jsx
│   │   ├── FieldStatusBadge.jsx
│   │   └── UpdateForm.jsx
│   └── ui/
│       ├── StatCard.jsx
│       └── LoadingSpinner.jsx
├── services/
│   └── api.js
├── utils/
│   └── fieldStatus.js
├── App.jsx
└── main.jsx

api/
└── index.js              # Vercel serverless entry

vercel.json              # Vercel deployment config
```

## Field Status Logic

Field status is computed dynamically based on the following rules:

| Condition | Status |
|-----------|--------|
| `stage = 'harvested'` | **Completed** |
| `stage IN ('planted','growing')` AND `planting_date < NOW() - 90 days` | **At Risk** |
| Any other state | **Active** |

## Design Decisions

### 1. Single-Repo Architecture
- **Why**: Simpler deployment to Vercel with unified dependencies and version control
- **Trade-off**: Monorepo complexity handled by simple folder structure

### 2. JWT Authentication (Access + Refresh)
- **Access Token**: Stored in memory, sent in Authorization header
- **Refresh Token**: HttpOnly cookie, automatically handled by interceptors
- **Why**: Balances security (no localStorage) with UX (stateless, no session server)

### 3. Computed Field Status
- **Why**: Avoids synchronization issues between stored status and business logic
- **Trade-off**: Slight computation overhead on each query (minimal for this scale)

### 4. PostgreSQL + Neon
- **Why**: Serverless-friendly, free tier, excellent for Vercel deployment
- **Schema**: Normalized 3-table design (users, fields, field_updates)

### 5. Tailwind CSS
- **Why**: Utility-first CSS provides rapid, consistent styling without custom CSS files
- **Theme**: Uses default Tailwind colors with responsive design

### 6. Express in src/server
- **Why**: Keeps everything in one Vite project, easier build/deploy pipeline
- **Vercel Entry**: `api/index.js` imports from `src/server/index.js`

## Deployment to Vercel

### Prerequisites
- GitHub repository with code pushed
- Vercel account linked to GitHub

### Steps

1. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import this GitHub repository
   - Select "Other" as the framework (we'll use custom build)

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_secret_here
   JWT_REFRESH_SECRET=another_secret_here
   NODE_ENV=production
   VITE_API_URL=https://your-vercel-app.vercel.app
   ```

4. **Add Database Connection**
   - Create a Neon PostgreSQL database
   - Copy the connection string to `DATABASE_URL`
   - Run the schema creation in Neon SQL Editor (from create-tables.js)
   - Run the seed script to populate demo data

5. **Deploy**
   - Push to GitHub and Vercel will auto-deploy
   - Monitor build logs in Vercel dashboard

## Testing

### Run Backend Tests
```bash
npm test
```

### Manual Testing Flow

1. **Auth Flow**
   - Register new account
   - Login with credentials
   - Verify JWT stored in Authorization header
   - Logout and verify token cleared

2. **Admin Features**
   - Create new field
   - Assign agent to field
   - View all fields with status
   - Edit/delete field

3. **Agent Features**
   - View assigned fields
   - Post field update with stage change
   - Verify update appears in history

## Known Limitations

- One agent per field (can be extended with many-to-many relationship)
- Field stage can only move forward in order
- No bulk operations on fields
- No real-time updates (full page refresh needed)

## Future Enhancements

- [ ] Real-time updates with WebSocket/Socket.io
- [ ] Photo uploads for field updates
- [ ] Advanced filtering and search
- [ ] Export field data to CSV/PDF
- [ ] Notification system for field alerts
- [ ] Weather integration for field monitoring
- [ ] Mobile app (React Native)

## Coding Standards

This project follows strict senior-engineer standards:

- **Modularity**: Each file has single responsibility
- **Error Handling**: All async operations wrapped in try-catch with meaningful logs
- **Security**: No hardcoded secrets, all from environment variables
- **Type Safety**: Intentional variable naming, consistent data shapes
- **Testing**: Backend controllers have unit tests

See [AGENTS.md](./AGENTS.md) for detailed standards.

## Troubleshooting

### "Cannot find module 'dotenv'"
```bash
npm install
```

### "Connection refused to database"
- Verify DATABASE_URL in .env
- Check Neon database is running
- Ensure SSL mode is correct

### "Token expired" on fresh load
- Delete refresh token cookie from browser storage
- Log in again to get fresh tokens

### Port 3001 already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
# Or change PORT in .env
```

## Support

For issues or questions, please open a GitHub issue or contact the development team.

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

**Last Updated**: April 2026
**Deployment Deadline**: April 25, 2026
