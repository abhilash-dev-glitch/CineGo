import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthRedirect({ to = '/' }) {
  const navigate = useNavigate();
  // CORRECTED: Select ONLY the user state slice
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'theaterManager') {
        navigate('/manager');
      } else {
        // For regular users, redirect to the specified path or home
        navigate(to);
      }
    }
  }, [user, navigate, to]);

  return null; // This component doesn't render anything
}