import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { toast } from '../../lib/toast';

export default function ManagerDashboard() {
  const location = useLocation();
  const [myTheaters, setMyTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data needed for the child components
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch the theaters this manager is assigned to
        const theaterRes = await api.get('/users/my-theaters');
        setMyTheaters(theaterRes.data.data.theaters || []);

        // Fetch all movies for the "Add Show" dropdown
        const movieRes = await api.get('/movies');
        setMovies(movieRes.data.data.movies || []);
      } catch (err) {
        toast.error('Failed to load manager data', err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const navItems = [
    { name: 'My Theaters', path: '/manager' },
    { name: 'Manage Shows', path: '/manager/shows' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
      <p className="text-sm text-white/60 mb-6">
        Manage your assigned theaters and their showtimes.
      </p>

      {/* Navigation Tabs */}
      <nav className="flex space-x-2 mb-6 border-b border-white/10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                isActive
                  ? 'border-brand text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Nested Content */}
      {loading ? (
        <p>Loading manager data...</p>
      ) : (
        // Pass the loaded data to the child routes
        <Outlet context={{ myTheaters, setMyTheaters, movies }} />
      )}
    </div>
  );
}