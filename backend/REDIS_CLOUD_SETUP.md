# Redis Cloud Setup Guide

## Your Redis Cloud Connection

You have a Redis Cloud instance ready to use. Follow these steps to configure it:

### Step 1: Update Your `.env` File

Open your `.env` file and add this line:

```env
REDIS_URL=redis://default:sl5ff9oOzYwgCE0rA9U2Ux3UgyDmL7Hf@redis-14200.c264.ap-south-1-1.ec2.redns.redis-cloud.com:14200
```

**Complete `.env` example:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/movie_booking

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Payment Gateway Configuration - Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel

# Payment Gateway Configuration - Razorpay
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
RAZORPAY_CURRENCY=INR

# Mock Payment (for testing without real payment gateways)
ENABLE_MOCK_PAYMENT=true

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Redis Cloud Configuration
REDIS_URL=redis://default:sl5ff9oOzYwgCE0rA9U2Ux3UgyDmL7Hf@redis-14200.c264.ap-south-1-1.ec2.redns.redis-cloud.com:14200
```

### Step 2: Start Your Application

```bash
npm run dev
```

You should see:
```
✅ Redis connected successfully
Server running in development mode on port 3000
```

### Step 3: Test Redis Connection

The application will automatically connect to Redis Cloud. You can verify it's working by:

1. **Check the server logs** - Look for "✅ Redis connected successfully"

2. **Test seat locking** - Create a booking and the seats will be locked in Redis Cloud

3. **Check locked seats** - Use the API endpoint:
   ```
   GET http://localhost:3000/api/v1/bookings/showtime/:showtimeId/locked-seats
   ```

## Connection Details Breakdown

Your Redis Cloud URL contains:
- **Protocol**: `redis://`
- **Username**: `default`
- **Password**: `sl5ff9oOzYwgCE0rA9U2Ux3UgyDmL7Hf`
- **Host**: `redis-14200.c264.ap-south-1-1.ec2.redns.redis-cloud.com`
- **Port**: `14200`
- **Region**: Asia Pacific (Mumbai) - `ap-south-1`

## Benefits of Redis Cloud

✅ **No local installation required** - Works immediately  
✅ **Managed service** - Automatic backups and updates  
✅ **High availability** - 99.99% uptime SLA  
✅ **Scalable** - Easy to upgrade as needed  
✅ **Secure** - TLS encryption and password protection  

## Troubleshooting

### Connection Timeout
- Check your internet connection
- Verify the Redis Cloud instance is active
- Check if your IP is whitelisted (if IP restrictions are enabled)

### Authentication Failed
- Verify the password in the connection string is correct
- Make sure there are no extra spaces in the `.env` file

### Cannot Connect
- Ensure `REDIS_URL` is set in your `.env` file
- Restart your application after updating `.env`
- Check Redis Cloud dashboard for instance status

## Monitoring

You can monitor your Redis Cloud instance at:
- **Dashboard**: https://app.redislabs.com/
- **Metrics**: View memory usage, connections, commands/sec
- **Logs**: Check for any connection issues

## Security Best Practices

⚠️ **Important**: Never commit your `.env` file to Git!

The `.env` file is already in `.gitignore`, but double-check:
```bash
# Verify .env is ignored
git status
```

If you accidentally commit credentials:
1. Rotate the password in Redis Cloud dashboard
2. Update your `.env` file with the new password
3. Remove the file from Git history

## Cost

Redis Cloud offers a free tier with:
- 30MB storage
- Up to 30 connections
- Perfect for development and testing

This is more than enough for the seat locking feature!
