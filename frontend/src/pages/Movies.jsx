import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MoviesAPI } from '../lib/api';
import MovieCard from '../components/MovieCard';
import { toast } from '../lib/toast';
import { FiClock, FiCalendar, FiStar, FiFilm } from 'react-icons/fi';

export default function Movies() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [premierMovies, setPremierMovies] = useState([]);
  const [unreleasedMovies, setUnreleasedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get active filter from URL, default to 'now-showing'
  const activeFilter = searchParams.get('filter') || 'now-showing';

  // Filter configuration
  const filterConfig = [
    { 
      id: 'now-showing', 
      label: 'Now Showing', 
      icon: FiClock,
      description: 'Movies playing in theaters today'
    },
    { 
      id: 'all-movies', 
      label: 'All Movies', 
      icon: FiFilm,
      description: 'Complete movie collection'
    },
    { 
      id: 'new-releases', 
      label: 'New Releases', 
      icon: FiStar,
      description: 'Released in the last 7 days'
    },
    { 
      id: 'coming-soon', 
      label: 'Coming Soon', 
      icon: FiCalendar,
      description: 'Upcoming releases'
    }
  ];

  useEffect(() => {
    console.log('🎬 Movies Page - Active Filter:', activeFilter);
    fetchMoviesData();
  }, [activeFilter]);

  const fetchMoviesData = async () => {
    setLoading(true);
    setError(null);
    
    // Reset all states
    setMovies([]);
    setPremierMovies([]);
    setUnreleasedMovies([]);

    try {
      console.log('📡 Fetching movies for filter:', activeFilter);

      if (activeFilter === 'coming-soon') {
        // Fetch both premier and unreleased movies
        const [premierData, unreleasedData] = await Promise.all([
          MoviesAPI.list({ view: 'premier', sort: 'releaseDate' }),
          MoviesAPI.list({ view: 'unreleased', sort: 'releaseDate' })
        ]);
        
        console.log('✅ Premier movies:', premierData?.length || 0);
        console.log('✅ Unreleased movies:', unreleasedData?.length || 0);
        
        setPremierMovies(Array.isArray(premierData) ? premierData : []);
        setUnreleasedMovies(Array.isArray(unreleasedData) ? unreleasedData : []);
      } else {
        // Fetch regular movies based on filter
        const params = getAPIParams(activeFilter);
        console.log('📤 API params:', params);
        
        const data = await MoviesAPI.list(params);
        console.log('✅ Movies received:', data?.length || 0);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        setMovies(data);
      }
    } catch (err) {
      console.error('❌ Error fetching movies:', err);
      setError(err.message || 'Failed to load movies');
      toast.error('Error', 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const getAPIParams = (filter) => {
    const paramsMap = {
      'now-showing': { view: 'active', sort: '-releaseDate' },
      'all-movies': { view: 'all-with-status', sort: '-releaseDate' },
      'new-releases': { view: 'new', sort: '-releaseDate' }
    };
    return paramsMap[filter] || paramsMap['now-showing'];
  };

  const getPageContent = () => {
    const contentMap = {
      'now-showing': {
        title: 'Now Showing',
        subtitle: 'Book your tickets for movies playing in theaters today!'
      },
      'all-movies': {
        title: 'All Movies',
        subtitle: 'Browse our complete collection of movies'
      },
      'new-releases': {
        title: 'New Releases',
        subtitle: 'Fresh from the premiere - released within the last week!'
      },
      'coming-soon': {
        title: 'Coming Soon',
        subtitle: 'Get ready for these exciting upcoming releases'
      }
    };
    return contentMap[activeFilter] || contentMap['now-showing'];
  };

  const pageContent = getPageContent();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
            {pageContent.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {pageContent.subtitle}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Active Filter: <span className="text-brand font-semibold">{activeFilter}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filterConfig.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <Link
                key={filter.id}
                to={`/movies?filter=${filter.id}`}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/30 scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                }`}
                title={filter.description}
              >
                <Icon size={18} />
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-800 rounded text-xs text-gray-400 text-center">
          Debug: Filter = {activeFilter} | Movies = {movies.length} | Premier = {premierMovies.length} | Unreleased = {unreleasedMovies.length}
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
              onClick={fetchMoviesData}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {activeFilter === 'coming-soon' ? (
              <div className="space-y-16">
                {/* Premier Shows */}
                {premierMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 text-purple-400">
                        Not Today - Catch It Tomorrow!
                      </h2>
                      <p className="text-gray-400 text-lg">
                        Shows starting tomorrow or later
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {premierMovies.map((movie) => (
                        <MovieCard key={movie._id || movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unreleased Movies */}
                {unreleasedMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-2 text-brand">
                        Soon in Theaters
                      </h2>
                      <p className="text-gray-400 text-lg">
                        Not yet released - coming soon!
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
                      No upcoming movies at the moment
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {movies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                      <div key={movie._id || movie.id} className="relative">
                        <MovieCard movie={movie} />
                        {activeFilter === 'all-movies' && movie.hasActiveShows === false && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            NO SHOWS
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiClock className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">
                      No movies found for this filter
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
