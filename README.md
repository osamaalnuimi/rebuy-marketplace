# Rebuy Marketplace

A modern Angular marketplace application for buying and selling pre-owned items.

## Features

- Browse offers sorted by popularity
- Vote on offers (upvote/downvote)
- View detailed offer information
- Purchase flow with confirmation
- Responsive design for all devices

## Tech Stack

- Angular 21+ with Signals
- Standalone components
- SCSS for styling
- Vitest for testing

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open http://localhost:4200
```

### Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Coverage report
npm run test:coverage
```

### Build

```bash
# Production build
npm run build
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at `http://localhost:8080`

### Using Docker

```bash
# Build
docker build -t rebuy-marketplace .

# Run
docker run -d -p 8080:80 rebuy-marketplace
```

## Project Structure

```
src/app/
├── features/
│   └── offers/          # Offer feature module
│       ├── pages/       # Smart components
│       ├── ui/          # Presentational components
│       └── data-access/ # Store & models
├── shared/              # Shared services & components
├── layout/              # Header & footer
└── styles/              # Global styles
```

## Available Scripts

```bash
npm start              # Dev server
npm test              # Run tests
npm run build         # Production build
npm run lint          # Lint code
npm run docker:build  # Build Docker image
npm run compose:up    # Start with Docker Compose
```

## License

MIT

## Development Time

This MVP was built in ~2 hours following Rebuy's time constraints, focusing on core functionality and clean code architecture.

---

**Note**: This is an MVP (Minimum Viable Product) designed for rapid market entry. The architecture supports easy scaling and feature additions as the product grows.
