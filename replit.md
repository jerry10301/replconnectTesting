# Admin Management System

## Overview
A comprehensive full-stack web application for user management with role-based access control, audit logging, and data export capabilities. Built with Express.js (backend) and React (frontend), supporting both PostgreSQL and SQLite databases.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript, JWT authentication
- **Database**: PostgreSQL (production/Replit) or SQLite (local development)
- **ORM**: Drizzle ORM with dual schema support
- **Security**: bcrypt password hashing, JWT tokens, role-based access control, CSV formula injection prevention

## Features
- User authentication (login/logout)
- Role-based access control (Admin/User roles)
- Admin dashboard with statistics
- User management (CRUD operations) - Admin only
- User profile management (view/edit own profile)
- Password reset flow with token-based recovery
- Comprehensive audit logging system
- CSV data export for users and audit logs
- Responsive design with dark/light theme support

## Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configuration
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication utilities (JWT)
│   ├── db.ts               # Database connection (auto-detects PostgreSQL/SQLite)
│   ├── routes.ts           # API routes
│   ├── seed.ts             # Database seeding script
│   └── storage.ts          # Data access layer
├── shared/                 # Shared types and schemas
│   ├── schema.ts           # PostgreSQL schema
│   └── sqlite-schema.ts    # SQLite schema
├── data/                   # SQLite database directory (local only)
│   └── local.db            # SQLite database file
└── design_guidelines.md    # UI/UX design guidelines
```

## Database Configuration

### Automatic Database Detection
The application automatically selects the database based on environment:
- **PostgreSQL**: Used when `DATABASE_URL` environment variable is set (Replit, production)
- **SQLite**: Used when `DATABASE_URL` is not set (local development)

### Running Locally with SQLite
No configuration needed! Just run:
```bash
npm install
npm run dev
```
The app will automatically create a SQLite database at `data/local.db`.

### Running with PostgreSQL
Set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/reset-token/:token` - Validate reset token

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Profile
- `GET /api/profile` - Get current user's profile
- `PATCH /api/profile` - Update current user's profile
- `PUT /api/profile/password` - Change password

### Audit & Export
- `GET /api/audit-logs` - List audit logs (Admin only)
- `GET /api/dashboard/stats` - Dashboard statistics (Admin only)
- `GET /api/export/users` - Export users as CSV (Admin only)
- `GET /api/export/audit-logs` - Export audit logs as CSV (Admin only)

## Database Schema

### Users Table
- id, username, password (hashed), email, name, role (admin/user), createdAt

### Audit Logs Table
- id, action, actorId, actorName, targetId, targetName, details, ipAddress, createdAt

### Password Reset Tokens Table
- id, userId, token, expiresAt, usedAt, createdAt

## Default Users
After running the seed script (`npx tsx server/seed.ts`):
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push PostgreSQL schema changes
- `npx tsx server/seed.ts` - Seed database with default users

## Security Features
- JWT-based stateless authentication
- bcrypt password hashing (salt rounds: 10)
- Role-based access control
- CSV export sanitization (formula injection prevention)
- Password reset tokens with expiration
- Audit logging for all critical actions

## Recent Changes
- 2025-11-26: Added SQLite support for local development
  - Auto-detection of database type based on DATABASE_URL
  - Separate schema files for PostgreSQL and SQLite
  - SQLite database stored in data/local.db
  - No configuration needed for local development
- 2025-11-26: Complete initial implementation
  - User authentication with JWT
  - Admin dashboard with statistics
  - User management CRUD operations
  - Role-based access control
  - Dark/light theme support
  - User profile management
  - Password reset flow
  - Comprehensive audit logging
  - CSV data export
