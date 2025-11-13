import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector for auth state
const selectAuthState = (state) => state.auth;
const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);
const selectLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export default function ProtectedRoute({ children, roles, requireAuth = true }) {
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  
  const location = useLocation()

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10">Checking authentication…</div>
  
  // Handle public routes that shouldn't be accessible when logged in (like login/signup)
  if (!requireAuth && user) {
    // Redirect based on user role
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'theaterManager') return <Navigate to="/manager" replace />
    return <Navigate to="/" replace />
  }
  
  // Handle protected routes that require authentication
  if (requireAuth) {
    if (!user) {
      // Pass the full location state for redirect
      return <Navigate to="/signin" replace state={{ from: location }} />
    }
    
    // Check if user has required role
    if (roles?.length && !roles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  // If we have a function as children, call it with the user
  if (typeof children === 'function') {
    return children(user)
  }
  
  // Otherwise just render the children
  return children
}