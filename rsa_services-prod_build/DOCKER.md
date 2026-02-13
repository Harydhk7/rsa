
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


## Production Deployment

For production, update `docker-compose.yml`:

1. Set `APP_URL` to your domain
2. Change `DB_PASSWORD` (in environment and `.env` file)
3. Set `FLASK_ENV=production`
4. Enable SSL/TLS certificates


### db_config.py

API reads DB connection from environment:
- Uses `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`

### RSA_API.py

- `APP_URL` environment variable controls domain links in emails

- Set to your domain: `https://example.com/rsa/`
- SSL context uses system's default cert store (no hardcoded cert file paths)
