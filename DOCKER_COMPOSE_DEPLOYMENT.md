# 🚀 Complete Docker Compose Deployment

This docker-compose stack includes everything needed for a fully functional collaborative Excalidraw platform:

- ✅ **PostgreSQL** - Database for users, rooms, and diagrams
- ✅ **Backend API** - Authentication, user management, diagram storage
- ✅ **Collaboration Server** - Real-time WebSocket for multi-user editing
- ✅ **Frontend** - Excalidraw UI with custom dashboard

---

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ RAM available
- Ports available: 80, 3001, 3002, 5432

---

## 🎯 Quick Start (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/mbindev/excalidraw.git
cd excalidraw
```

### 2. Create Environment File
```bash
cp .env.production.example .env
```

### 3. Configure Environment Variables
Edit `.env` file and set:

```env
# Required: Database password
DB_PASSWORD=YourSecurePostgresPassword

# Required: JWT secret (generate new one)
JWT_SECRET=your_generated_jwt_secret_here

# Required: Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword

# For local development
CORS_ORIGIN=http://localhost
BACKEND_API_URL=http://localhost:3001
COLLAB_SERVER_URL=http://localhost:3002
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start All Services
```bash
docker-compose up -d
```

This will:
1. ⏳ Pull/build all images
2. 🗄️ Start PostgreSQL database
3. 🔄 Run database migrations
4. 👤 Create admin user
5. 🚀 Start backend API
6. 📡 Start collaboration server
7. 🎨 Start frontend

### 5. Verify Deployment

**Check all services are running:**
```bash
docker-compose ps
```

**Check logs:**
```bash
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:3001/health
- Collaboration: http://localhost:3002

### 6. Test Login

Navigate to http://localhost and login with:
- Email: (from ADMIN_EMAIL in .env)
- Password: (from ADMIN_PASSWORD in .env)

---

## 🌐 Production Deployment

### For Coolify

1. **Push to GitHub** (already done)

2. **Add New Resource** → **Docker Compose Application**

3. **Configure:**
   - Repository: `https://github.com/mbindev/excalidraw`
   - Branch: `master`
   - Docker Compose File: `docker-compose.yml` (root)

4. **Set Environment Variables** in Coolify:
```env
DB_PASSWORD=<secure-password>
JWT_SECRET=<generated-secret>
ADMIN_EMAIL=admin@mbin.pk
ADMIN_PASSWORD=<secure-admin-password>
ADMIN_NAME=Admin
CORS_ORIGIN=https://draw.mbin.pk
BACKEND_API_URL=https://api.mbin.pk
COLLAB_SERVER_URL=https://collab.mbin.pk
```

5. **Set Domain Mappings:**
   - Frontend (port 80) → `draw.mbin.pk`
   - Backend (port 3001) → `api.mbin.pk`
   - Collab (port 3002) → `collab.mbin.pk`
   - PostgreSQL (port 5432) → Internal only

6. **Deploy**

---

## 📊 Service Overview

### PostgreSQL (`postgres`)
- **Port:** 5432
- **Database:** excalidraw
- **Persistent Storage:** postgres_data volume
- **Health Check:** Automatic with retries

### Backend API (`backend`)
- **Port:** 3001
- **Health Endpoint:** `/health`
- **API Docs:** See `excalidraw-backend/README.md`
- **Features:** Auth, users, rooms, diagrams

### Collaboration Server (`collab`)
- **Port:** 3002
- **Protocol:** WebSocket (Socket.io)
- **Purpose:** Real-time multi-user collaboration

### Frontend (`frontend`)
- **Port:** 80
- **Framework:** React + Vite
- **Features:** Excalidraw UI + Custom dashboard

---

## 🔧 Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Service
```bash
docker-compose restart backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Rebuild Service
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Execute Commands in Container
```bash
# Backend shell
docker-compose exec backend sh

# Run migration manually
docker-compose exec backend npm run migrate

# PostgreSQL shell
docker-compose exec postgres psql -U postgres -d excalidraw
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres excalidraw > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d excalidraw
```

### Reset Everything (⚠️ Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
docker-compose logs

# Check if ports are already in use
netstat -tuln | grep -E '80|3001|3002|5432'
```

### Backend Can't Connect to Database
```bash
# Check if postgres is healthy
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Verify database connection
docker-compose exec postgres psql -U postgres -d excalidraw -c "SELECT 1"
```

### Migration Failed
```bash
# Run migration manually
docker-compose exec backend npm run migrate

# Check migration logs
docker-compose logs backend | grep migrate
```

### Frontend Can't Connect to Backend
- Check CORS_ORIGIN matches your frontend URL
- Verify BACKEND_API_URL is correct
- Check backend logs for errors

### Collaboration Not Working
- Check COLLAB_SERVER_URL in frontend env
- Verify collaboration server is running
- Check WebSocket connection in browser console

---

## 📦 Volume Management

### List Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect excalidraw_postgres_data
```

### Backup Volume
```bash
docker run --rm -v excalidraw_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Restore Volume
```bash
docker run --rm -v excalidraw_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

---

## 🔒 Security Recommendations

### Production Checklist
- [ ] Change all default passwords
- [ ] Generate unique JWT secret
- [ ] Use strong admin password
- [ ] Enable HTTPS (use reverse proxy like Traefik/Nginx)
- [ ] Don't expose PostgreSQL port externally
- [ ] Set up regular database backups
- [ ] Enable firewall rules
- [ ] Use secrets management (not .env file)
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated

### Environment Variables Security
```bash
# Don't commit .env to git
echo ".env" >> .gitignore

# Use Docker secrets for sensitive data (Swarm mode)
docker secret create db_password ./db_password.txt
```

---

## 🎨 Next Steps - Phase 2

Now that the infrastructure is deployed, the next phase is to build the custom dashboard:

1. **Login Page** - Replace default with custom auth
2. **Dashboard** - Show rooms and diagrams
3. **Admin Panel** - User management
4. **Integration** - Connect dashboard with Excalidraw component

See `PHASE_2_FRONTEND.md` (to be created) for details.

---

## 📚 Resources

- **Backend API Documentation:** `excalidraw-backend/README.md`
- **Excalidraw Docs:** https://docs.excalidraw.com
- **Docker Compose Docs:** https://docs.docker.com/compose/

---

## 💡 Tips

**Development Mode:**
- Use `docker-compose logs -f` to watch logs
- Mount volumes for hot-reload during development
- Use `docker-compose restart` instead of down/up for faster iteration

**Production Mode:**
- Use resource limits in docker-compose
- Set up monitoring (Prometheus, Grafana)
- Enable log aggregation
- Use health checks for auto-restart

**Scaling:**
- Backend and collab can be scaled horizontally
- Use external PostgreSQL for production (managed service)
- Add Redis for session storage and caching
- Use CDN for frontend static assets

---

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure ports are available
4. Check Docker/Docker Compose versions

---

**Ready to deploy! 🚀**
