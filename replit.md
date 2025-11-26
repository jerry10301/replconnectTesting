# Admin Management System

## Overview
A comprehensive full-stack web application for user management with role-based access control, audit logging, and data export capabilities. Built with Express.js (backend) and React (frontend), using PostgreSQL for data persistence.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript, JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
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
- Advanced permissions with customizable roles
- Responsive design with dark/light theme support

## Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configuration
│   │   ├── pages/          # Page components
│   │   │   ├── login.tsx   # Login page
│   │   │   ├── dashboard.tsx # Dashboard with stats
│   │   │   ├── users.tsx   # User management
│   │   │   ├── roles.tsx   # Roles & permissions management
│   │   │   ├── profile.tsx # User profile page
│   │   │   ├── audit-logs.tsx # Audit logs viewer
│   │   │   ├── forgot-password.tsx # Password reset request
│   │   │   └── reset-password.tsx # Password reset form
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication utilities (JWT)
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API routes
│   ├── seed.ts             # Database seeding script
│   └── storage.ts          # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and Zod validation
└── design_guidelines.md    # UI/UX design guidelines
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
- `GET /api/users/:id/permissions` - Get user's effective permissions

### Profile
- `GET /api/profile` - Get current user's profile
- `PATCH /api/profile` - Update current user's profile
- `PUT /api/profile/password` - Change password

### Roles & Permissions
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get single role
- `POST /api/roles` - Create new role (Admin only)
- `PATCH /api/roles/:id` - Update role (Admin only)
- `DELETE /api/roles/:id` - Delete role (Admin only)
- `GET /api/permissions/categories` - Get permission categories

### Audit & Export
- `GET /api/audit-logs` - List audit logs (Admin only)
- `GET /api/dashboard/stats` - Dashboard statistics (Admin only)
- `GET /api/export/users` - Export users as CSV (Admin only)
- `GET /api/export/audit-logs` - Export audit logs as CSV (Admin only)

## Database Schema

### Users Table
- id, username, password (hashed), email, fullName, role (admin/user), customRoleId

### Roles Table
- id, name, description, isSystem, createdAt, updatedAt

### Permissions Table
- id, roleId, category (users/audit_logs/exports/settings), action (view/create/edit/delete), allowed

### Audit Logs Table
- id, action, actorId, actorName, targetType, targetId, targetName, details, createdAt

### Password Reset Tokens Table
- id, userId, token, expiresAt, usedAt

## Default Users
After running the seed script:
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push database schema changes
- `npx tsx server/seed.ts` - Seed database with default users

## Security Features
- JWT-based stateless authentication
- bcrypt password hashing (salt rounds: 10)
- Role-based access control with granular permissions
- CSV export sanitization (formula injection prevention)
- Password reset tokens with expiration
- Audit logging for all critical actions

## Recent Changes
- 2025-11-26: Complete implementation
  - Created user schema with role support
  - Implemented JWT authentication
  - Built admin dashboard with statistics
  - Added user management CRUD operations
  - Implemented role-based access control
  - Added dark/light theme support
  - Implemented user profile management
  - Added password reset flow with token validation
  - Created comprehensive audit logging system
  - Added CSV export for users and audit logs
  - Implemented advanced permissions with customizable roles
  - Added roles management UI with permission matrix
