# Docker Setup for RSA Application

This guide covers building and running the RSA application (frontend + backend + PostgreSQL) using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8+
- Port 3000 (frontend), 5000 (API), and 5432 (PostgreSQL) available

## Quick Start

### 1. Build and Start Services

Navigate to the backend directory and run:

```bash
cd rsa_services-prod_build
docker compose build --no-cache
docker compose up -d
```

This will start:
- **Frontend (React)** on `http://localhost:3000`
- **API (Flask)** on `http://localhost:5000`
- **PostgreSQL** on `localhost:5432`

### 2. Verify Services

Check running containers:
```bash
docker compose ps
```

Expected output:
```
NAME              IMAGE                              PORTS                    STATUS
rsa_frontend      rsa_services-prod_build-rsa_frontend   0.0.0.0:3000->3000/tcp   Up
rsa_api           rsa_services-prod_build-rsa_api        0.0.0.0:5000->5000/tcp   Up
db                postgres:14                            0.0.0.0:5432->5432/tcp   Up
```

### 3. Access the Applications

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Database**: localhost:5432 (postgres user)

## Environment Variables

### API Service (db_config.py)

The API uses environment variables set in `docker-compose.yml`:
- `DB_HOST=db` (Docker internal hostname)
- `DB_NAME=rsa`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `APP_URL=#` (Override with your domain, e.g., `https://example.com/app/`)

### Frontend Service

- `REACT_APP_API_URL=http://localhost:5000` (API base URL)

## SSL/TLS and Domain Mapping

### Domain Mapping

To enable hardcoded domain links in emails/templates, set `APP_URL` in `docker-compose.yml`:

```yaml
rsa_api:
  environment:
    - APP_URL=https://your-domain.com/rsa/
```

The code will replace `https://coers.iitm.ac.in/rsa_dev/#/` with your domain.

### SSL Certificates

To use SSL certificates (for production):

1. Uncomment the volumes section in `docker-compose.yml`:

```yaml
rsa_api:
  volumes:
    - ./certs:/etc/ssl/certs
```

2. Place your certificate files in `./certs/` directory:
   - `server.crt`
   - `server.key`

3. Update Flask to use SSL in `RSA_API.py` (currently commented out for development).

## Database

### Initialize Database

The PostgreSQL service auto-initializes with:
- Database: `rsa`
- User: `postgres`
- Password: `postgres`

To apply migrations or create tables:

```bash
docker compose exec db psql -U postgres -d rsa -f /path/to/migration.sql
```

### Backup Database

```bash
docker compose exec db pg_dump -U postgres rsa > backup.sql
```

### Restore Database

```bash
docker compose exec -T db psql -U postgres -d rsa < backup.sql
```

## Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for specific service:

```bash
docker compose logs -f rsa_api
docker compose logs -f rsa_frontend
docker compose logs -f db
```

## Stopping Services

Stop all services:

```bash
docker compose down
```

Stop and remove volumes (clears database):

```bash
docker compose down -v
```

## Troubleshooting

### Container Fails to Start

1. Check logs:
   ```bash
   docker compose logs rsa_api
   ```

2. Common issues:
   - **Port already in use**: Change ports in `docker-compose.yml`
   - **Database connection error**: Ensure `db` service is running (`docker compose logs db`)
   - **Missing dependencies**: Rebuild without cache: `docker compose build --no-cache`

### Database Connection Issues

Verify database connectivity:

```bash
docker compose exec rsa_api python -c "import psycopg2; print('DB OK')"
```

Reset database (remove volume):

```bash
docker compose down -v
docker compose up -d
```

### Frontend Cannot Connect to API

Ensure `REACT_APP_API_URL` is correctly set in `docker-compose.yml`:

```bash
docker compose exec rsa_frontend env | grep REACT_APP
```

### Memory Issues

Increase Docker memory allocation in Docker Desktop settings (Preferences → Resources → Memory).

## Production Deployment

For production, update `docker-compose.yml`:

1. Set `APP_URL` to your domain
2. Change `DB_PASSWORD` (in environment and `.env` file)
3. Set `FLASK_ENV=production`
4. Enable SSL/TLS certificates
5. Use external Docker registry (Docker Hub, ECR, etc.)
6. Consider using Kubernetes or Docker Swarm for orchestration

## Code-Level Configuration

### db_config.py

API reads DB connection from environment:
- Uses `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- Falls back to defaults if not set (useful for local development)

### RSA_API.py

- `APP_URL` environment variable controls domain links in emails
- Default: `#` (disables external links)
- Set to your domain: `https://example.com/rsa/`
- SSL context uses system's default cert store (no hardcoded cert file paths)

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [React Docker Best Practices](https://create-react-app.dev/docs/deployment/)
