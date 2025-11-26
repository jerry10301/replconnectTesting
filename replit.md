# Admin Management System

## Overview
A full-stack web application for user management with role-based access control. Built with Express.js (backend) and React (frontend), using PostgreSQL for data persistence.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript, JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Security**: bcrypt password hashing, JWT tokens, role-based access control

## Features
- User authentication (login/logout)
- Role-based access control (Admin/User roles)
- Admin dashboard with statistics
- User management (CRUD operations) - Admin only
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
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API routes
│   ├── seed.ts             # Database seeding script
│   └── storage.ts          # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and Zod validation
└── design_guidelines.md    # UI/UX design guidelines
```

## API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/dashboard/stats` - Dashboard statistics (Admin only)

## Default Users
After running the seed script:
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push database schema changes
- `npx tsx server/seed.ts` - Seed database with default users

## Recent Changes
- 2025-11-26: Initial implementation
  - Created user schema with role support
  - Implemented JWT authentication
  - Built admin dashboard with statistics
  - Added user management CRUD operations
  - Implemented role-based access control
  - Added dark/light theme support
