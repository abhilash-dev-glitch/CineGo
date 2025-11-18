import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MoviesAPI } from '../lib/api';
import MovieCard from '../components/MovieCard';
import { toast } from '../lib/toast';
import { FiClock, FiCalendar, FiStar } from 'react-icons/fi';

// Updated Movies Page with 4 filters: Now Showing, All Movies, New Releases, Coming Soon
export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [premierMovies, setPremierMovies] = useState([]);
  const [unreleasedMovies, setUnreleasedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get filter from URL - default to 'now-showing'
  const filter = searchParams.get('filter') || 'now-showing';

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        let params = {};
        
        switch(filter) {
          case 'now-showing':
            // Movies with shows available today
            params = { view: 'active', sort: '-releaseDate' };
            break;
          case 'all-movies':
            // All movies with status flags
            params = { view: 'all-with-status', sort: '-releaseDate' };
            break;
          case 'new-releases':
            // Movies released within the last 7 days
            params = { view: 'new', sort: '-releaseDate' };
            break;
          case 'coming-soon':
            // Fetch premier shows (tomorrow+) and unreleased movies
            const [premierRes, unreleasedRes] = await Promise.all([
              MoviesAPI.list({ view: 'premier', sort: 'releaseDate' }),
              MoviesAPI.list({ view: 'unreleased', sort: 'releaseDate' })
            ]);
            setPremierMovies(Array.isArray(premierRes) ? premierRes : []);
            setUnreleasedMovies(Array.isArray(unreleasedRes) ? unreleasedRes : []);
            setMovies([]);
            setLoading(false);
            return;
          default:
            params = { view: 'active', sort: '-releaseDate' };
        }

        const moviesData = await MoviesAPI.list(params);
        
        if (!moviesData || !Array.isArray(moviesData)) {
          console.error('Invalid movies data received:', moviesData);
          setError('Invalid data received from server');
          return;
        }
        
        // Filter out invalid movie objects
        const validMovies = moviesData.filter(movie => 
          movie && 
          (movie.title || movie.name) && 
          (movie.poster || movie.image)
        );
        
        setMovies(validMovies);
        setPremierMovies([]);
        setUnreleasedMovies([]);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
        toast.error('Error', 'Failed to load movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [filter]);

  // Filter buttons configuration
  const filters = [
    { id: 'now-showing', label: 'Now Showing', icon: FiClock },
    { id: 'all-movies', label: 'All Movies', icon: FiStar },
    { id: 'new-releases', label: 'New Releases', icon: FiStar },
    { id: 'coming-soon', label: 'Coming Soon', icon: FiCalendar }
  ];

  const getHeroContent = () => {
    switch(filter) {
      case 'now-showing':
        return {
          title: 'Now Showing',
          subtitle: 'Book your tickets for the latest blockbusters in theaters now!'
        };
      case 'all-movies':
        return {
          title: 'All Movies',
          subtitle: 'Browse our complete collection of movies'
        };
      case 'new-releases':
        return {
          title: 'New Releases',
          subtitle: 'Fresh from the premiere - movies released within the last week!'
        };
      case 'coming-soon':
        return {
          title: 'Coming Soon',
          subtitle: 'Get ready for these exciting upcoming releases'
        };
      default:
        return {
          title: 'Movies',
          subtitle: 'Discover your next favorite movie'
        };
    }
  };

  const heroContent = getHeroContent();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
            {heroContent.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {heroContent.subtitle}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.id}
                to={`/movies?filter=${f.id}`}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === f.id
                    ? 'bg-brand text-white shadow-lg shadow-brand/30 scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                }`}
              >
                <Icon size={18} />
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content based on filter */}
        {!loading && !error && (
          <>
            {filter === 'coming-soon' ? (
              // Coming Soon has two sections
              <div className="space-y-16">
                {/* Premier Shows Section */}
                {premierMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 text-purple-400">
                        Not Today - Catch It Tomorrow!
                      </h2>
                      <p className="text-gray-400 text-lg">
                        The curtain's down for now - but the show goes on tomorrow
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {premierMovies.map((movie) => (
                        <MovieCard key={movie._id || movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unreleased Movies Section */}
                {unreleasedMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 text-brand">
                        Soon in Theaters
                      </h2>
                      <p className="text-gray-400 text-lg">
                        New adventures land here soon - mark your calendar!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {unreleasedMovies.map((movie) => (
                        <MovieCard key={movie._id || movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {premierMovies.length === 0 && unreleasedMovies.length === 0 && (
                  <div className="text-center py-12">
                    <FiCalendar className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">
                      No upcoming movies announced yet. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Now Showing and All Movies
              <>
                {movies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                      <div key={movie._id || movie.id} className="relative">
                        <MovieCard movie={movie} />
                        {/* Show expired badge for movies without active shows */}
                        {filter === 'all-movies' && movie.hasActiveShows === false && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            EXPIRED
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiClock className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">
                      {filter === 'now-showing' 
                        ? 'No movies currently showing. Please check back soon!'
                        : 'No movies found.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
