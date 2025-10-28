# Docker Compose Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker & Docker Compose installed
- GitHub repository access

### Deployment Steps

#### 1. Clone Repository
```bash
git clone https://github.com/mbindev/excalidraw.git
cd excalidraw/excalidraw-backend
```

#### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DB_PASSWORD=your_secure_postgres_password
JWT_SECRET=your_generated_secret_key
CORS_ORIGIN=https://draw.mbin.pk
ADMIN_EMAIL=admin@mbin.pk
ADMIN_PASSWORD=YourSecurePassword123!
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Start Services
```bash
docker-compose up -d
```

This will:
- ✅ Start PostgreSQL database
- ✅ Build and start backend API
- ✅ Run database migrations
- ✅ Create admin user
- ✅ Expose API on port 3001

#### 4. Verify Deployment
```bash
# Check services are running
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test API
curl http://localhost:3001/health
```

#### 5. Stop Services
```bash
docker-compose down
```

To stop and remove volumes (⚠️ deletes data):
```bash
docker-compose down -v
```

---

## Coolify Deployment

### Option A: Docker Compose (Recommended)

1. **Add New Resource** → **Application**
2. **Source:**
   - Repository: `https://github.com/mbindev/excalidraw`
   - Branch: `master`
   - **Base Directory:** `excalidraw-backend`
   - **Build Pack:** Docker Compose
3. **Environment Variables:** Add from `.env.example`
4. **Ports:** 
   - Backend: `3001`
   - PostgreSQL: `5432` (internal only)
5. **Deploy**

### Option B: Separate Services

If Coolify doesn't support docker-compose, deploy separately:

**1. PostgreSQL Database**
- Add Resource → Database → PostgreSQL
- Name: `excalidraw-db`
- Database: `excalidraw`
- Save credentials

**2. Backend API**
- Add Resource → Application
- Base Directory: `excalidraw-backend`
- Build Pack: Dockerfile
- Port: `3001`
- Environment Variables:
  ```env
  PORT=3001
  NODE_ENV=production
  DB_HOST=excalidraw-db
  DB_PORT=5432
  DB_NAME=excalidraw
  DB_USER=postgres
  DB_PASSWORD=<from-postgres-service>
  JWT_SECRET=<generate-random-string>
  CORS_ORIGIN=https://draw.mbin.pk
  ADMIN_EMAIL=admin@mbin.pk
  ADMIN_PASSWORD=<your-secure-password>
  ADMIN_NAME=Admin
  ```

**3. Run Migration** (after first deployment)
- Go to backend container terminal
- Run: `npm run migrate`

---

## Services

### Backend API
- **Port:** 3001
- **Health Check:** `GET /health`
- **API Docs:** See README.md

### PostgreSQL
- **Port:** 5432 (internal)
- **Database:** excalidraw
- **Persistent:** postgres_data volume

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
```

### Database connection failed
```bash
# Check postgres is healthy
docker-compose ps

# Check postgres logs
docker-compose logs postgres
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
```

### Rebuild backend
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

---

## Production Recommendations

1. **Use secrets management** for sensitive env vars
2. **Enable SSL** for PostgreSQL connections
3. **Set up backup** for postgres_data volume
4. **Use reverse proxy** (Traefik/Nginx) for HTTPS
5. **Monitor logs** with centralized logging
6. **Set resource limits** in docker-compose.yml

---

## Next Steps

After backend is deployed:
1. Deploy collaboration server (excalidraw-room)
2. Build and deploy frontend dashboard
3. Integrate with main Excalidraw app
