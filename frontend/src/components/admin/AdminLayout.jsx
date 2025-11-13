import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { FiGrid, FiFilm, FiHome, FiCalendar, FiUsers, FiUserCheck, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid /> },
    { name: 'Movies', path: '/admin/movies', icon: <FiFilm /> },
    { name: 'Theaters', path: '/admin/theaters', icon: <FiHome /> },
    { name: 'Shows', path: '/admin/shows', icon: <FiCalendar /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Managers', path: '/admin/managers', icon: <FiUserCheck /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-6 py-5 flex items-center">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transform -rotate-12">
            🎬
          </span>
          <h1 className="ml-3 text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.path} to={item.path} icon={item.icon}>
              {item.name}
            </NavItem>
          ))}
        </nav>
        
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Search or other header items can go here */}
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">
                  Welcome, {user?.name}
                </span>
                <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Reusable NavItem component for the sidebar
const NavItem = ({ to, icon, children }) => {
  return (
    <NavLink
      to={to}
      end={to === '/admin'} // Ensure only Dashboard is active on index
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {children}
    </NavLink>
  );
};

export default AdminLayout;