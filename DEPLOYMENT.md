# Deployment Guide

Simple Docker deployment for Rebuy Marketplace.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (optional)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

Access the app at `http://localhost:8080`

### Option 2: Docker

```bash
# Build the image
docker build -t rebuy-marketplace .

# Run the container
docker run -d -p 8080:80 --name rebuy-app rebuy-marketplace

# View logs
docker logs -f rebuy-app

# Stop and remove
docker stop rebuy-app && docker rm rebuy-app
```

## NPM Scripts

```bash
npm run docker:build       # Build Docker image
npm run docker:run         # Run container
npm run docker:stop        # Stop and remove container
npm run docker:logs        # View logs
npm run compose:up         # Start with Docker Compose
npm run compose:down       # Stop Docker Compose
npm run compose:logs       # View compose logs
npm run compose:rebuild    # Rebuild and restart
```

## Docker Image Details

- **Base**: nginx:1.25-alpine
- **Size**: ~50MB
- **Build**: Multi-stage (Node build → Nginx serve)

## Health Check

The application includes a health endpoint:

```bash
# Check health
curl http://localhost:8080/health

# Response: "healthy"
```

Docker health check runs automatically every 30 seconds.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs rebuy-app

# Inspect container
docker inspect rebuy-app
```

### Port already in use

```bash
# Use different port
docker run -d -p 3000:80 rebuy-marketplace
```

### Rebuild after changes

```bash
# With Docker Compose
docker-compose up -d --build

# With Docker
docker build -t rebuy-marketplace .
docker stop rebuy-app && docker rm rebuy-app
docker run -d -p 8080:80 --name rebuy-app rebuy-marketplace
```

## Production Checklist

- ✅ Enable HTTPS
- ✅ Set up monitoring
- ✅ Configure backups
- ✅ Set resource limits
- ✅ Enable logging

That's it! Keep it simple.
