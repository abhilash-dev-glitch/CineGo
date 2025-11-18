/**
 * Calculate real-time status for showtimes
 */

/**
 * Get showtime status based on current time
 * @param {Date} startTime - Show start time
 * @param {Date} endTime - Show end time
 * @returns {Object} Status information
 */
function getShowtimeStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Calculate time differences in minutes
  const minutesUntilStart = Math.floor((start - now) / (1000 * 60));
  const minutesUntilEnd = Math.floor((end - now) / (1000 * 60));
  
  // Show is currently playing
  if (now >= start && now <= end) {
    return {
      status: 'live',
      label: 'Live Now',
      color: 'green',
      icon: '🎬',
      description: `Ends in ${minutesUntilEnd} min`,
      sortOrder: 1,
    };
  }
  
  // Show starts within 30 minutes
  if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
    return {
      status: 'starting-soon',
      label: 'Starting Soon',
      color: 'orange',
      icon: '⏰',
      description: `Starts in ${minutesUntilStart} min`,
      sortOrder: 2,
    };
  }
  
  // Show starts within 2 hours
  if (minutesUntilStart > 30 && minutesUntilStart <= 120) {
    return {
      status: 'upcoming-today',
      label: 'Today',
      color: 'blue',
      icon: '📅',
      description: `Starts in ${Math.floor(minutesUntilStart / 60)}h ${minutesUntilStart % 60}m`,
      sortOrder: 3,
    };
  }
  
  // Show is in the future (more than 2 hours)
  if (minutesUntilStart > 120) {
    const isToday = start.toDateString() === now.toDateString();
    const isTomorrow = start.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    
    return {
      status: 'upcoming',
      label: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming',
      color: 'gray',
      icon: '🎫',
      description: start.toLocaleString(),
      sortOrder: 4,
    };
  }
  
  // Show has ended
  return {
    status: 'completed',
    label: 'Completed',
    color: 'gray',
    icon: '✓',
    description: 'Show ended',
    sortOrder: 5,
  };
}

/**
 * Add status to multiple showtimes
 * @param {Array} showtimes - Array of showtime objects
 * @returns {Array} Showtimes with status
 */
function addStatusToShowtimes(showtimes) {
  return showtimes.map(showtime => {
    const showtimeObj = showtime.toObject ? showtime.toObject() : showtime;
    const status = getShowtimeStatus(showtimeObj.startTime, showtimeObj.endTime);
    
    return {
      ...showtimeObj,
      realtimeStatus: status,
    };
  });
}

/**
 * Filter showtimes by status
 * @param {Array} showtimes - Array of showtimes with status
 * @param {String} statusFilter - Status to filter by
 * @returns {Array} Filtered showtimes
 */
function filterShowtimesByStatus(showtimes, statusFilter) {
  if (!statusFilter || statusFilter === 'all') {
    return showtimes;
  }
  
  return showtimes.filter(st => st.realtimeStatus?.status === statusFilter);
}

/**
 * Sort showtimes by status priority
 * @param {Array} showtimes - Array of showtimes with status
 * @returns {Array} Sorted showtimes
 */
function sortShowtimesByStatus(showtimes) {
  return showtimes.sort((a, b) => {
    const orderA = a.realtimeStatus?.sortOrder || 999;
    const orderB = b.realtimeStatus?.sortOrder || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same status, sort by start time
    return new Date(a.startTime) - new Date(b.startTime);
  });
}

module.exports = {
  getShowtimeStatus,
  addStatusToShowtimes,
  filterShowtimesByStatus,
  sortShowtimesByStatus,
};
