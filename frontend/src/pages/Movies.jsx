import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MoviesAPI } from '../lib/api';
import MovieCard from '../components/MovieCard';
import { toast } from '../lib/toast';
import { FiClock, FiCalendar, FiStar, FiFilm, FiTrendingUp } from 'react-icons/fi';

export default function Movies() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [premierMovies, setPremierMovies] = useState([]);
  const [unreleasedMovies, setUnreleasedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const activeFilter = searchParams.get('filter') || 'now-showing';

  const filterTabs = [
    { 
      id: 'now-showing', 
      label: 'Now Showing', 
      icon: FiClock,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500'
    },
    { 
      id: 'all-movies', 
      label: 'All Movies', 
      icon: FiFilm,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500'
    },
    { 
      id: 'new-releases', 
      label: 'New Releases', 
      icon: FiTrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500'
    },
    { 
      id: 'coming-soon', 
      label: 'Coming Soon', 
      icon: FiCalendar,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    console.log('🎬 MOVIES PAGE LOADED - Filter:', activeFilter);
    loadMovies();
  }, [activeFilter]);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    setMovies([]);
    setPremierMovies([]);
    setUnreleasedMovies([]);

    try {
      console.log('📡 Loading movies for:', activeFilter);

      if (activeFilter === 'coming-soon') {
        const [premier, unreleased] = await Promise.all([
          MoviesAPI.list({ view: 'premier', sort: 'releaseDate' }),
          MoviesAPI.list({ view: 'unreleased', sort: 'releaseDate' })
        ]);
        
        console.log('✅ Premier:', premier?.length, 'Unreleased:', unreleased?.length);
        setPremierMovies(Array.isArray(premier) ? premier : []);
        setUnreleasedMovies(Array.isArray(unreleased) ? unreleased : []);
      } else {
        const params = {
          'now-showing': { view: 'active', sort: '-releaseDate' },
          'all-movies': { view: 'all-with-status', sort: '-releaseDate' },
          'new-releases': { view: 'new', sort: '-releaseDate' }
        }[activeFilter];
        
        console.log('📤 API Params:', params);
        const data = await MoviesAPI.list(params);
        console.log('✅ Received:', data?.length, 'movies');
        
        setMovies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to load movies');
      toast.error('Error', 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const activeTab = filterTabs.find(t => t.id === activeFilter) || filterTabs[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* NEW HERO DESIGN */}
      <div className={`bg-gradient-to-r ${activeTab.color} py-20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <activeTab.icon className="w-16 h-16 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {activeTab.label}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              {activeFilter === 'now-showing' && 'Book tickets for movies playing today'}
              {activeFilter === 'all-movies' && 'Explore our complete movie collection'}
              {activeFilter === 'new-releases' && 'Fresh releases from the last 7 days'}
              {activeFilter === 'coming-soon' && 'Exciting movies coming to theaters'}
            </p>
            
            {/* PROMINENT DEBUG INFO */}
            <div className="mt-6 inline-block bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30">
              <span className="font-mono text-sm">
                🎯 Active: <span className="font-bold text-yellow-300">{activeFilter}</span> | 
                🎬 Movies: <span className="font-bold text-green-300">{movies.length}</span> | 
                🎪 Premier: <span className="font-bold text-purple-300">{premierMovies.length}</span> | 
                🎭 Unreleased: <span className="font-bold text-orange-300">{unreleasedMovies.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW FILTER TABS DESIGN */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-3">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              
              return (
                <Link
                  key={tab.id}
                  to={`/movies?filter=${tab.id}`}
                  className={`group relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 transform ${
                    isActive
                      ? `${tab.bgColor} text-white shadow-2xl scale-110 ring-4 ring-white/30`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading */}
        {loading && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand"></div>
              <p className="mt-4 text-xl text-gray-400">Loading amazing movies...</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[2/3] bg-gray-700"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😞</div>
            <p className="text-red-400 text-xl mb-6">{error}</p>
            <button
              onClick={loadMovies}
              className="px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-all transform hover:scale-105 font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {activeFilter === 'coming-soon' ? (
              <div className="space-y-20">
                {/* Premier Section */}
                {premierMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-10">
                      <div className="inline-block bg-purple-500/20 px-6 py-2 rounded-full mb-4">
                        <span className="text-purple-400 font-bold">🎪 PREMIER SHOWS</span>
                      </div>
                      <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Starting Tomorrow or Later
                      </h2>
                      <p className="text-gray-400 text-lg">
                        Not showing today, but coming very soon!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {premierMovies.map((movie) => (
                        <MovieCard key={movie._id || movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unreleased Section */}
                {unreleasedMovies.length > 0 && (
                  <div>
                    <div className="text-center mb-10">
                      <div className="inline-block bg-orange-500/20 px-6 py-2 rounded-full mb-4">
                        <span className="text-orange-400 font-bold">🎭 UNRELEASED</span>
                      </div>
                      <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        Coming to Theaters Soon
                      </h2>
                      <p className="text-gray-400 text-lg">
                        Not yet released - mark your calendar!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {unreleasedMovies.map((movie) => (
                        <MovieCard key={movie._id || movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {premierMovies.length === 0 && unreleasedMovies.length === 0 && (
                  <div className="text-center py-20">
                    <FiCalendar className="mx-auto h-24 w-24 text-gray-600 mb-6" />
                    <p className="text-gray-400 text-2xl font-bold">No upcoming movies yet</p>
                    <p className="text-gray-500 mt-2">Check back soon for new announcements!</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {movies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                      <div key={movie._id || movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        {activeFilter === 'all-movies' && movie.hasActiveShows === false && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl ring-2 ring-white/50 animate-pulse">
                            NO SHOWS
                          </div>
                        )}
                        {activeFilter === 'new-releases' && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-xl">
                            ⭐ NEW
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">🎬</div>
                    <p className="text-gray-400 text-2xl font-bold">No movies found</p>
                    <p className="text-gray-500 mt-2">Try a different filter</p>
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
