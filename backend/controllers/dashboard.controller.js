const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Booking = require('../models/Booking');
const { subDays, format } = require('date-fns');
const AppError = require('../utils/appError');

// @desc    Get all admin dashboard stats
// @route   GET /api/v1/dashboard/admin-stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    // 1. Get simple counts
    const totalUsersPromise = User.countDocuments();
    const totalMoviesPromise = Movie.countDocuments();
    const totalTheatersPromise = Theater.countDocuments();
    
    // 2. Get booking-related stats
    const totalBookingsPromise = Booking.countDocuments({ paymentStatus: 'paid' });
    
    // 3. Get total revenue
    const totalRevenuePromise = Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    // 4. Get recent bookings
    const recentBookingsPromise = Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'title' }
      });

    // 5. Get revenue for the last 7 days
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of the day

    const revenueChartPromise = Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Wait for all promises to resolve
    const [
      totalUsers,
      totalMovies,
      totalTheaters,
      totalBookings,
      revenueResult,
      recentBookings,
      revenueChartDataRaw
    ] = await Promise.all([
      totalUsersPromise,
      totalMoviesPromise,
      totalTheatersPromise,
      totalBookingsPromise,
      totalRevenuePromise,
      recentBookingsPromise,
      revenueChartPromise
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Format chart data
    const revenueChartMap = new Map(revenueChartDataRaw.map(item => [item._id, item.revenue]));
    const revenueChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      revenueChartData.push({
        date: dateString,
        revenue: revenueChartMap.get(dateString) || 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalMovies,
        totalTheaters,
        totalBookings,
        totalRevenue,
        recentBookings,
        revenueChartData
      },
    });
  } catch (error) {
    next(error);
  }
};