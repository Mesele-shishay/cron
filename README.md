# Guess Game Cron Service

A simple Express.js service that automatically calls the INNO guess game finalize API every minute.

## Features

- 🚀 **Automated Finalization**: Calls finalize API every 60 seconds
- 📊 **Health Monitoring**: Built-in health check endpoints
- 🔧 **Manual Trigger**: API endpoint to manually trigger finalization
- 📝 **Comprehensive Logging**: Detailed logs for monitoring and debugging
- 🛡️ **Error Handling**: Robust error handling with graceful recovery

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
cp config.env config.env
# Edit config.env with your configuration
```

### 3. Development

```bash
pnpm run dev
```

### 4. Production

```bash
pnpm start
```

## Environment Variables

| Variable       | Description                       | Default                 |
| -------------- | --------------------------------- | ----------------------- |
| `INNO_API_URL` | URL of your main INNO application | `http://localhost:3000` |
| `CRON_SECRET`  | Secret key for API authentication | Required                |
| `PORT`         | Port for the cron service         | `3002`                  |

## API Endpoints

### Health Checks

```bash
GET /api/health
# Basic health check

GET /api/health/detailed
# Detailed health information
```

### Manual Operations

```bash
POST /api/health/trigger
# Manually trigger finalization
# Headers: Content-Type: application/json
```

## Usage Examples

### Check Service Health

```bash
curl http://localhost:3002/api/health
```

### Manual Trigger

```bash
curl -X POST http://localhost:3002/api/health/trigger \
  -H "Content-Type: application/json"
```

### View Logs

```bash
# The service logs all API calls with timestamps
# Look for lines like:
# ✅ [2024-01-15T10:30:00.000Z] Finalization successful (1250ms)
# 🏆 Winner: user123 (Score: 5)
```

## Integration

This service integrates with your main INNO application by calling:

```http
POST /api/game/finalize
Headers:
  x-cron-secret: your-secret
  Content-Type: application/json
```

Make sure your main application has the `CRON_SECRET` environment variable set to the same value.

## Docker Deployment

```yaml
# docker-compose.yml
version: "3.8"
services:
  cron-service:
    build: .
    environment:
      - INNO_API_URL=http://your-inno-app:3000
      - CRON_SECRET=your-secure-secret
    ports:
      - "3002:3002"
    restart: unless-stopped
```

## Monitoring

The service provides detailed logging:

- ✅ **Successful finalizations** with winner information
- ⚠️ **Failed attempts** with error details
- 🔄 **API call timing** and performance metrics
- 🚨 **Connection issues** and network errors

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Ensure your main INNO application is running
   - Check `INNO_API_URL` is correct

2. **Authentication Failed**

   - Verify `CRON_SECRET` matches your main app
   - Check main app has `CRON_SECRET` environment variable

3. **Timeout Errors**
   - The service has a 30-second timeout
   - Check network connectivity between services

### Logs

All activities are logged to the console. In production, consider:

- Using a log aggregation service (e.g., Winston with file transport)
- Setting up log rotation
- Monitoring log files for errors

## Development

### Available Scripts

```bash
pnpm run dev      # Start development server
pnpm start        # Start production server
```

### Project Structure

```
simple-server.js         # Main server file
config.env              # Environment configuration
package.json            # Dependencies and scripts
README.md              # Documentation
```

## License

ISC
