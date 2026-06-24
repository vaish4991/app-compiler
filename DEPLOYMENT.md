# Deployment Configuration

## Local Development

```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## Docker Deployment

### Build and Run Locally

```bash
# Using Docker Compose
docker-compose up --build

# This starts:
# - Backend on port 3001
# - Frontend on port 3000
```

### Environment Variables

```bash
OPENAI_API_KEY=sk_...
OPENAI_MODEL=gpt-4
BACKEND_PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production Deployment

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel frontend
```

### Deploy Backend to Heroku

```bash
# Create app
heroku create app-compiler-api

# Set environment variables
heroku config:set OPENAI_API_KEY=sk_...
heroku config:set OPENAI_MODEL=gpt-4

# Deploy
git push heroku main
```

### Deploy Generated Apps to Railway

```bash
# For each generated app:
cd generated-apps/{appId}
railway link  # Connect to Railway project
railway up    # Deploy
```

## Database Setup (PostgreSQL)

### Local Development

```bash
# PostgreSQL is included in docker-compose.yml
# Connection string:
postgres://postgres:postgres@localhost:5432/app_db
```

### Production (AWS RDS)

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier app-compiler \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --allocated-storage 20

# Get connection string
aws rds describe-db-instances \
  --db-instance-identifier app-compiler \
  --query 'DBInstances[0].Endpoint.Address'
```

## Monitoring

### Logs

```bash
# Backend logs
docker logs app-compiler-backend

# Frontend logs
docker logs app-compiler-frontend

# Database logs
docker logs app-compiler-db
```

### Metrics

```bash
# Get system metrics
curl http://localhost:3001/api/metrics
```

### Health Check

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend availability
curl http://localhost:3000
```

## Scaling

### Horizontal Scaling (Multiple Backend Instances)

```yaml
# docker-compose.yml
services:
  backend-1:
    build: .
    ports:
      - '3001:3001'
  backend-2:
    build: .
    ports:
      - '3002:3001'
  # Load balancer
  nginx:
    image: nginx:latest
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database Connection Pooling

```typescript
// In backend, use connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -U postgres -h localhost -d app_db > backup.sql

# Restore
psql -U postgres -h localhost -d app_db < backup.sql
```

### Generated Apps Backup

```bash
# Backup to S3
aws s3 sync generated-apps/ s3://app-compiler-backups/

# Restore from S3
aws s3 sync s3://app-compiler-backups/ generated-apps/
```

## Security

### Environment Variables
- Never commit .env to version control
- Use GitHub Secrets for sensitive data
- Rotate API keys regularly

### Database
- Use strong passwords
- Enable SSL/TLS connections
- Regular backups
- Restrict network access

### API
- Rate limiting (implemented in backend)
- CORS configured
- Input validation
- SQL injection prevention (using parameterized queries)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose up --build
```

### Database connection failed
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -U postgres -h localhost
```

### High memory usage
```bash
# Reduce Node.js heap size
export NODE_OPTIONS="--max-old-space-size=512"
```
