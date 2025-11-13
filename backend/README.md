# Movie Booking Backend API

A comprehensive RESTful API for a movie ticket booking application built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **Three-Tier Role System**
  - `endUser` - Regular customers (browse, book, manage own bookings)
  - `theaterManager` - Manage movies, theaters, and showtimes
  - `admin` - Full system access and user management

- **Secure Authentication**
  - JWT-based authentication
  - HTTP-only cookie support
  - Dual authentication (cookies + Bearer tokens)
  - Secure logout functionality

- **Payment Integration**
  - Multiple gateways (Stripe, Razorpay, Mock)
  - Secure payment processing
  - Automatic refund handling
  - Webhook support

- **Complete Booking System**
  - Movie and theater management
  - Showtime scheduling
  - Seat selection and booking
  - Payment tracking

- **Notification System**
  - Email notifications (Nodemailer)
  - SMS notifications (Twilio)
  - RabbitMQ message queue
  - Beautiful HTML email templates
  - Bulk email/SMS support (Admin only)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd movie-booking-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/movie_booking

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000

# Payment Gateways (optional)
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
ENABLE_MOCK_PAYMENT=true
```

4. **Seed the database** (optional)
```bash
npm run seed:import
```

This creates sample data including:
- Admin user: `admin@example.com` / `admin123456`
- End user: `john@example.com` / `password123`
- Theater manager: `manager@example.com` / `manager123456`

## 🏃 Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password

### Users (Admin)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/theater-managers` - Get all theater managers
- `POST /api/v1/users/theater-manager` - Create theater manager
- `PATCH /api/v1/users/:id/assign-theaters` - Assign theaters to manager

### Movies
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get single movie
- `POST /api/v1/movies` - Create movie (Admin)
- `PATCH /api/v1/movies/:id` - Update movie (Admin)
- `DELETE /api/v1/movies/:id` - Delete movie (Admin)

### Theaters
- `GET /api/v1/theaters` - Get all theaters
- `GET /api/v1/theaters/:id` - Get single theater
- `POST /api/v1/theaters` - Create theater (Admin)
- `PATCH /api/v1/theaters/:id` - Update theater (Admin/Manager)

### Showtimes
- `GET /api/v1/showtimes` - Get all showtimes
- `GET /api/v1/showtimes/:id` - Get single showtime
- `POST /api/v1/showtimes` - Create showtime (Admin/Manager)
- `PATCH /api/v1/showtimes/:id` - Update showtime (Admin/Manager)

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - Get user's bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Payments
- `GET /api/v1/payments/gateways` - Get available gateways
- `POST /api/v1/payments/create` - Create payment
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/my-payments` - Get user's payments
- `POST /api/v1/payments/:id/refund` - Initiate refund

## 🔐 Authentication

### Using Cookies (Web Applications)

```javascript
// Login
await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important!
  body: JSON.stringify({ email, password })
});

// Make authenticated requests
await fetch('http://localhost:3000/api/v1/auth/me', {
  credentials: 'include'
});
```

### Using Bearer Token (Mobile Applications)

```javascript
// Login and get token
const { token } = await login(email, password);

// Add to Authorization header
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🧪 Testing

### Quick Test
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

## 🗂️ Project Structure

```
movie-booking-backend/
├── config/
│   ├── db.js              # Database connection
│   ├── jwt.js             # JWT configuration
│   └── payment.js         # Payment gateway config
├── controllers/
│   ├── auth.controller.js
│   ├── booking.controller.js
│   ├── movie.controller.js
│   ├── payment.controller.js
│   ├── showtime.controller.js
│   ├── theater.controller.js
│   ├── user.controller.js
│   └── webhook.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models/
│   ├── Booking.js
│   ├── Movie.js
│   ├── Payment.js
│   ├── Showtime.js
│   ├── Theater.js
│   └── User.js
├── routes/
│   ├── auth.routes.js
│   ├── booking.routes.js
│   ├── movie.routes.js
│   ├── payment.routes.js
│   ├── showtime.routes.js
│   ├── theater.routes.js
│   ├── user.routes.js
│   └── webhook.routes.js
├── utils/
│   ├── appError.js
│   ├── cookieHelper.js
│   └── paymentHelpers.js
├── .env.example
├── app.js
├── server.js
├── seeder.js
└── package.json
```

## 🔒 Security Features

- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag for HTTPS
- ✅ SameSite attribute (CSRF protection)
- ✅ CORS configuration
- ✅ Password hashing with bcrypt
- ✅ JWT token validation
- ✅ Role-based access control
- ✅ Account activation/deactivation

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_very_secure_secret
FRONTEND_URL=https://yourdomain.com
```

### Requirements
- HTTPS enabled (required for secure cookies)
- MongoDB Atlas or production database
- Valid SSL certificate

## 📝 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run worker         # Start notification worker
npm run worker:dev     # Start notification worker with nodemon
npm run seed:import    # Import sample data
npm run seed:delete    # Delete all data
npm run test:mailer    # Test email service
```

## 📚 Documentation

- **[AUTHORIZATION_GUIDE.md](./AUTHORIZATION_GUIDE.md)** - Complete permissions guide
- **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - API testing with Postman
- **[NOTIFICATION_API.md](./NOTIFICATION_API.md)** - Email & SMS API documentation
- **[NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)** - Setup RabbitMQ, Email, SMS
- **[MAILER_UTILITY_GUIDE.md](./MAILER_UTILITY_GUIDE.md)** - Mailer utility reference
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👥 Sample Credentials (After Seeding)

```
Admin:
  Email: admin@example.com
  Password: admin123456

End User:
  Email: john@example.com
  Password: password123

Theater Manager:
  Email: manager@example.com
  Password: manager123456
```

## 🐛 Troubleshooting

### Server won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Ensure port 3000 is not in use

### Cookie not working
- Add `credentials: 'include'` in fetch requests
- Check CORS configuration
- Verify FRONTEND_URL in `.env`

### Payment errors
- Enable mock payment: `ENABLE_MOCK_PAYMENT=true`
- Or configure Stripe/Razorpay API keys

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, and MongoDB**
