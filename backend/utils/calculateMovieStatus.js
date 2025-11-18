const Showtime = require('../models/Showtime');

/**
 * Calculate real-time show status for a movie
 * @param {String} movieId - Movie ID
 * @returns {Object} Status flags
 */
async function calculateMovieStatus(movieId) {
  const now = new Date();
  
  // Start of today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // End of today
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  // Tomorrow range
  const tomorrowStart = new Date(todayEnd);
  tomorrowStart.setMilliseconds(tomorrowStart.getMilliseconds() + 1);
  
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);
  
  // Check for active shows today
  const hasActiveShows = await Showtime.exists({
    movie: movieId,
    startTime: { $gte: todayStart, $lte: todayEnd },
    isActive: true,
  });
  
  // Check for shows tomorrow
  const hasShowsTomorrow = await Showtime.exists({
    movie: movieId,
    startTime: { $gte: tomorrowStart, $lte: tomorrowEnd },
    isActive: true,
  });
  
  // Check for any future shows
  const hasFutureShows = await Showtime.exists({
    movie: movieId,
    startTime: { $gt: now },
    isActive: true,
  });
  
  return {
    hasActiveShows: !!hasActiveShows,
    hasShowsTomorrow: !!hasShowsTomorrow,
    hasFutureShows: !!hasFutureShows,
  };
}

/**
 * Calculate status for multiple movies efficiently
 * @param {Array} movieIds - Array of movie IDs
 * @returns {Object} Map of movieId to status flags
 */
async function calculateMultipleMovieStatuses(movieIds) {
  const now = new Date();
  
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  const tomorrowStart = new Date(todayEnd);
  tomorrowStart.setMilliseconds(tomorrowStart.getMilliseconds() + 1);
  
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);
  
  // Fetch all showtimes for these movies in one query
  const showtimes = await Showtime.find({
    movie: { $in: movieIds },
    isActive: true,
  }).select('movie startTime');
  
  // Build status map
  const statusMap = {};
  
  movieIds.forEach(movieId => {
    const movieIdStr = movieId.toString();
    const movieShows = showtimes.filter(s => s.movie.toString() === movieIdStr);
    
    statusMap[movieIdStr] = {
      hasActiveShows: movieShows.some(s => 
        s.startTime >= todayStart && s.startTime <= todayEnd
      ),
      hasShowsTomorrow: movieShows.some(s => 
        s.startTime >= tomorrowStart && s.startTime <= tomorrowEnd
      ),
      hasFutureShows: movieShows.some(s => s.startTime > now),
    };
  });
  
  return statusMap;
}

module.exports = {
  calculateMovieStatus,
  calculateMultipleMovieStatuses,
};
