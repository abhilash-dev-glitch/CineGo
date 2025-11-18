import { Link } from 'react-router-dom'

export default function MovieCard({ movie }) {
  const id = movie._id || movie.id
  const poster = movie.poster || movie.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=600&auto=format&fit=crop'
  const genresArr = Array.isArray(movie.genre) ? movie.genre : (Array.isArray(movie.genres) ? movie.genres : [])
  const genresText = genresArr.length ? genresArr.join(', ') : 'Drama/Thriller'
  const ratingValue = movie.ratingsAverage ?? movie.rating ?? '8.7'
  const ratingCount = movie.ratingsCount ?? null
  
  // Determine movie status badge with improved logic - Always show a badge
  const getStatusBadge = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
    if (releaseDate) {
      releaseDate.setHours(0, 0, 0, 0);
    }
    
    // Priority 1: Check if movie is unreleased (future release date)
    if (releaseDate && releaseDate > today) {
      return { label: 'Coming Soon', color: 'bg-orange-500/90 text-white', icon: '📅' };
    }
    
    // Priority 2: Check if movie is newly released (within last 7 days) AND has active shows
    if (releaseDate && movie.hasActiveShows === true) {
      const daysSinceRelease = Math.floor((today - releaseDate) / (1000 * 60 * 60 * 24));
      if (daysSinceRelease >= 0 && daysSinceRelease <= 7) {
        return { label: 'New Release', color: 'bg-purple-600/90 text-white', icon: '⭐' };
      }
    }
    
    // Priority 3: Check if movie has active shows today (now showing)
    if (movie.hasActiveShows === true) {
      return { label: 'Now Showing', color: 'bg-green-600/90 text-white', icon: '🎬' };
    }
    
    // Priority 4: Check if movie has shows tomorrow (but not today)
    if (movie.hasShowsTomorrow === true) {
      return { label: 'Shows Tomorrow', color: 'bg-blue-600/90 text-white', icon: '🎫' };
    }
    
    // Priority 5: Check if movie has future shows (but not today or tomorrow)
    if (movie.hasFutureShows === true) {
      return { label: 'Coming Soon', color: 'bg-cyan-600/90 text-white', icon: '📆' };
    }
    
    // Priority 6: Check if movie explicitly has no future shows (expired)
    if (movie.hasFutureShows === false) {
      return { label: 'Expired', color: 'bg-gray-600/90 text-white', icon: '⏰' };
    }
    
    // Priority 7: If hasActiveShows is explicitly false, show "No Shows"
    if (movie.hasActiveShows === false) {
      return { label: 'No Shows', color: 'bg-red-600/90 text-white', icon: '🚫' };
    }
    
    // Default: If no status info available, show "Available"
    return { label: 'Available', color: 'bg-gray-700/90 text-white', icon: '🎞️' };
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <Link to={`/movies/${id}`} className="group block">
      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-soft bg-white/5 border border-white/10 relative">
        <img src={poster} alt={movie.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 pointer-events-none"/>
        
        {/* Status Badge - Top Right */}
        {statusBadge && (
          <div className={`absolute top-2 right-2 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge.color} shadow-lg backdrop-blur-sm`}>
            <span>{statusBadge.icon}</span>
            <span>{statusBadge.label}</span>
          </div>
        )}
        
        {/* Rating Badge - Bottom Left */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-400/20 backdrop-blur-sm">
          <span>★</span>
          <span>{ratingValue}</span>
          <span className="opacity-75">•</span>
          <span className="opacity-75">{ratingCount !== null ? ratingCount : '—'}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-white group-hover:text-brand transition">{movie.title}</h3>
        <p className="text-white/60 text-sm">{genresText}</p>
      </div>
    </Link>
  )
}
