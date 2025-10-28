# Excalidraw Backend API

Backend API for collaborative Excalidraw platform with authentication, room management, and diagram storage.

## Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ Room/workspace management
- ✅ Diagram storage with auto-save
- ✅ PostgreSQL database
- ✅ RESTful API
- ✅ Docker support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Language**: TypeScript

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd excalidraw-backend
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start PostgreSQL** (if not running)

4. **Run database migration:**
```bash
npm run build
npm run migrate
```

5. **Start development server:**
```bash
npm run dev
```

Server will start on `http://localhost:3001`

## Deployment to Coolify

### 1. Create PostgreSQL Database in Coolify

- Add new resource → Database → PostgreSQL
- Name: `excalidraw-db`
- Save credentials

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Excalidraw backend API"
git remote add origin https://github.com/mbindev/excalidraw-backend.git
git push -u origin master
```

### 3. Configure in Coolify

- Add new resource → Application
- Repository: `https://github.com/mbindev/excalidraw-backend`
- Branch: `master`
- Build Pack: Dockerfile
- Port: `3001`

### 4. Set Environment Variables in Coolify

```env
PORT=3001
NODE_ENV=production

DB_HOST=excalidraw-db  # Your Coolify PostgreSQL service name
DB_PORT=5432
DB_NAME=excalidraw
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=generate-a-very-secure-random-string-here

CORS_ORIGIN=https://draw.mbin.pk

ADMIN_EMAIL=admin@mbin.pk
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Admin
```

### 5. Set Domain

- Domain: `api.mbin.pk` (or your preferred subdomain)

### 6. Deploy

- Click "Deploy"
- After deployment, run migration:
  - Go to Terminal in Coolify
  - Run: `npm run migrate`

## API Documentation

### Base URL
```
https://api.mbin.pk
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mbin.pk",
  "password": "yourpassword"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@mbin.pk",
    "fullName": "Admin",
    "role": "admin"
  }
}
```

**Include token in subsequent requests:**
```
Authorization: Bearer <token>
```

### User Management (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "role": "user"  // or "admin"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Room Management

#### Get User's Rooms
```http
GET /api/rooms
Authorization: Bearer <token>
```

#### Create Room (Admin Only)
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Design Team",
  "description": "Room for design team diagrams"
}
```

#### Grant Room Access (Admin Only)
```http
POST /api/rooms/:roomId/access
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2
}
```

#### Revoke Room Access (Admin Only)
```http
DELETE /api/rooms/:roomId/access/:userId
Authorization: Bearer <token>
```

#### Get Room Users (Admin Only)
```http
GET /api/rooms/:roomId/users
Authorization: Bearer <token>
```

#### Delete Room (Admin Only)
```http
DELETE /api/rooms/:id
Authorization: Bearer <token>
```

### Diagram Management

#### Get Diagrams in Room
```http
GET /api/diagrams/room/:roomId
Authorization: Bearer <token>
```

#### Get Single Diagram
```http
GET /api/diagrams/:id
Authorization: Bearer <token>
```

#### Create Diagram
```http
POST /api/diagrams
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": 1,
  "name": "System Architecture",
  "data": {
    "elements": [],
    "appState": {},
    "files": {}
  }
}
```

#### Update Diagram
```http
PUT /api/diagrams/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "data": {
    "elements": [...],
    "appState": {...},
    "files": {...}
  }
}
```

#### Delete Diagram
```http
DELETE /api/diagrams/:id
Authorization: Bearer <token>
```

## Database Schema

### Users
- id, email, password_hash, full_name, role, created_at, updated_at

### Rooms
- id, name, description, created_by, created_at, updated_at

### Room Access
- id, user_id, room_id, created_at

### Diagrams
- id, room_id, name, data (JSONB), version, created_by, created_at, updated_at

## Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- Admin-only routes are protected
- Room access is verified before diagram operations
- CORS configured for frontend origin

## Next Steps

After backend is deployed, you'll need to:
1. Create frontend dashboard
2. Integrate with Excalidraw component
3. Deploy collaboration server (excalidraw-room)

## Support

For issues or questions, contact your development team.
