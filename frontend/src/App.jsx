import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toaster from './components/Toaster'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Showtimes from './pages/Showtimes'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import { useEffect } from 'react'
import { useAuth } from './store/auth'

// Import Admin components
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/Movies'
import AdminTheaters from './pages/admin/Theaters'
import AdminShows from './pages/admin/Shows'
import AdminUsers from './pages/admin/Users'
import AdminManagers from './pages/admin/Managers'

// Import Manager components
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManageTheaters from './pages/manager/ManageTheaters' // We will create this
import ManageShows from './pages/manager/ManageShows'     // We will create this

export default function App() {
  const initAuth = useAuth(state => state.init)
  useEffect(() => { initAuth() }, [initAuth])
  return (
    <BrowserRouter>
      <div className="min-h-dvh flex flex-col bg-surface">
        <Toaster />
        <Navbar />
        <main className="flex-1 pb-10">
          <Routes>
            {/* Root path with role-based redirection */}
            <Route path="/" element={
              <ProtectedRoute>
                {(user) => {
                  if (user?.role === 'admin') {
                    return <Navigate to="/admin" replace />;
                  } else if (user?.role === 'theaterManager') {
                    return <Navigate to="/manager" replace />;
                  }
                  return <Home />;
                }}
              </ProtectedRoute>
            } />
            
            {/* Public routes */}
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/movies/:id/showtimes" element={<Showtimes />} />
            <Route path="/showtimes/:showtimeId/seats" element={<SeatSelection />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            
            {/* Auth routes with redirect if already logged in */}
            <Route path="/signin" element={
              <ProtectedRoute requireAuth={false}>
                <SignIn />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignUp />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* --- ADMIN NESTED ROUTES --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="theaters" element={<AdminTheaters />} />
              <Route path="shows" element={<AdminShows />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="managers" element={<AdminManagers />} />
            </Route>

            {/* --- MANAGER NESTED ROUTES --- */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute roles={["theaterManager", "admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManageTheaters />} />
              <Route path="shows" element={<ManageShows />} />
            </Route>
            
            {/* 404 - Not Found */}
            <Route path="*" element={
              <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist or has been moved.</p>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}