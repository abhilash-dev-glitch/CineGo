# Redis Setup Guide for Seat Locking

This guide explains how to set up and use Redis for temporary seat locking to prevent double booking.

## Why Redis?

Redis is used as a distributed cache to temporarily lock seats when users are in the booking process. This prevents race conditions where multiple users try to book the same seat simultaneously.

## Features

- **Temporary Seat Locks**: Seats are locked for 10 minutes when a user initiates booking
- **Automatic Expiration**: Locks automatically expire after the timeout period
- **Conflict Prevention**: Prevents double booking during the payment process
- **Real-time Availability**: Check seat availability in real-time including locked seats

## Installation

### Windows

1. **Download Redis for Windows**:
   - Visit: https://github.com/microsoftarchive/redis/releases
   - Download the latest `.msi` installer (e.g., `Redis-x64-3.0.504.msi`)
   - Run the installer and follow the setup wizard

2. **Start Redis**:
   ```powershell
   # Redis should start automatically as a Windows service
   # To check if it's running:
   Get-Service redis
   
   # To start manually:
   redis-server
   ```

### Linux/Mac

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install redis-server
   
   # macOS (using Homebrew)
   brew install redis
   ```

2. **Start Redis**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   
   # macOS
   brew services start redis
   ```

### Docker (Recommended for Development)

```bash
# Pull and run Redis container
docker run -d --name redis-movie-booking -p 6379:6379 redis:latest

# To stop
docker stop redis-movie-booking

# To start again
docker start redis-movie-booking
```

## Configuration

1. **Update your `.env` file**:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

2. **For production**, set a password:
   ```env
   REDIS_PASSWORD=your_secure_password_here
   ```

## Install Node.js Dependencies

```bash
npm install
```

This will install the `ioredis` package which is already added to `package.json`.

## How It Works

### 1. Seat Locking Flow

```
User selects seats → Seats locked in Redis (10 min) → User completes payment → Locks released
                                                    ↓
                                            Payment fails → Locks released
```

### 2. Lock Duration

- Default: **10 minutes** (600 seconds)
- Configurable in `utils/seatLockHelper.js`

### 3. Key Structure

Redis keys follow this pattern:
```
seat_lock:{showtimeId}:{row}-{seat}
```

Example: `seat_lock:507f1f77bcf86cd799439011:A-5`

## API Endpoints

### Check Seat Availability

**GET** `/api/v1/bookings/showtime/:showtimeId/locked-seats`

Returns all locked and booked seats for a showtime.

**Response**:
```json
{
  "status": "success",
  "data": {
    "lockedSeats": [
      {
        "row": "A",
        "seat": "5",
        "lockedBy": "user_id",
        "lockedAt": "2024-01-01T12:00:00.000Z",
        "status": "locked"
      }
    ],
    "bookedSeats": [
      {
        "row": "A",
        "seat": "3",
        "status": "booked"
      }
    ],
    "totalUnavailable": 2
  }
}
```

### Check Specific Seats

**POST** `/api/v1/bookings/check-seats`

Check if specific seats are available.

**Request Body**:
```json
{
  "showtimeId": "507f1f77bcf86cd799439011",
  "seats": [
    { "row": "A", "seat": "5" },
    { "row": "A", "seat": "6" }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "available": false,
    "unavailableSeats": [
      {
        "row": "A",
        "seat": "5",
        "reason": "locked"
      }
    ],
    "availableSeats": [
      {
        "row": "A",
        "seat": "6"
      }
    ]
  }
}
```

### Create Booking (with automatic locking)

**POST** `/api/v1/bookings`

When creating a booking, seats are automatically locked.

**Request Body**:
```json
{
  "showtime": "507f1f77bcf86cd799439011",
  "seats": [
    { "row": "A", "seat": "5" },
    { "row": "A", "seat": "6" }
  ],
  "paymentMethod": "stripe"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "booking": { ... },
    "lockExpiresIn": 600
  }
}
```

## Error Handling

### Seat Already Locked

If seats are locked by another user:
```json
{
  "status": "fail",
  "message": "Some seats are temporarily locked by another user. Please try again."
}
```
**HTTP Status**: 409 Conflict

### Redis Connection Error

The application will continue to work even if Redis is unavailable, but seat locking won't be enforced. Check logs for Redis connection errors.

## Testing

### Test Redis Connection

```bash
# Connect to Redis CLI
redis-cli

# Test commands
PING  # Should return PONG
SET test "Hello Redis"
GET test  # Should return "Hello Redis"
DEL test
```

### Test Seat Locking

1. **Lock seats** by creating a booking
2. **Check locked seats**:
   ```bash
   redis-cli
   KEYS seat_lock:*
   GET seat_lock:{showtimeId}:{row}-{seat}
   ```
3. **Wait for expiration** or manually delete:
   ```bash
   DEL seat_lock:{showtimeId}:{row}-{seat}
   ```

## Monitoring

### View All Locks

```bash
redis-cli
KEYS seat_lock:*
```

### Check Lock Details

```bash
redis-cli
GET seat_lock:{showtimeId}:{row}-{seat}
```

### Clear All Locks (Development Only)

```bash
redis-cli
FLUSHDB
```

## Production Considerations

1. **Use Redis Cluster** for high availability
2. **Set up Redis persistence** (RDB or AOF)
3. **Configure password authentication**
4. **Monitor Redis memory usage**
5. **Set up Redis backups**
6. **Use connection pooling** (already configured in `config/redis.js`)

## Troubleshooting

### Redis Not Starting

**Windows**:
```powershell
# Check service status
Get-Service redis

# Restart service
Restart-Service redis
```

**Linux**:
```bash
# Check status
sudo systemctl status redis-server

# Restart
sudo systemctl restart redis-server

# Check logs
sudo journalctl -u redis-server
```

### Connection Refused

- Ensure Redis is running: `redis-cli ping`
- Check port 6379 is not blocked by firewall
- Verify REDIS_HOST and REDIS_PORT in `.env`

### Memory Issues

```bash
# Check Redis memory usage
redis-cli INFO memory

# Set max memory (e.g., 256MB)
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/topics/best-practices)
