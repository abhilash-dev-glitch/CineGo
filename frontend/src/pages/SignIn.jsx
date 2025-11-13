import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { toast } from '../lib/toast';
import AuthRedirect from '../components/AuthRedirect';

export default function SignIn(){
  const navigate = useNavigate()
  const location = useLocation()

  const dispatch = useDispatch();
  const { user, loading, error, errors } = useSelector((state) => ({
    user: state.auth.user,
    loading: state.auth.loading,
    error: state.auth.error,
    errors: state.auth.errors
  }));

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleTarget, setRoleTarget] = useState('endUser')
  
  // If user is already logged in, AuthRedirect will handle the redirection
  useEffect(() => {
    if (user) {
      return <AuthRedirect to="/" />;
    }
  }, [user]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(resultAction)) {
      const loggedInUser = resultAction.payload;
      toast.success('Welcome back', `Signed in as ${loggedInUser.name || loggedInUser.email}`);
      
      // Handle redirect logic after login
      const fromLocation = location.state?.from;

      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser.role === 'theaterManager') {
        navigate('/manager', { replace: true });
      } else if (fromLocation) {
        navigate(fromLocation.pathname + fromLocation.search, { 
          replace: true, 
          state: fromLocation.state 
        });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      toast.error('Sign in failed', 'Please check your email and password.');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 min-h-[70vh]">
      <h1 className="text-2xl font-bold mb-4">Sign in to CineGo</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-5">
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {errors && Array.isArray(errors) && (
          <ul className="text-red-300 text-sm list-disc pl-5 space-y-1">
            {errors.map((e,i)=> <li key={i}>{e.msg}</li>)}
          </ul>
        )}
        <div>
          <label className="block text-sm mb-1">Sign in as</label>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <button type="button" onClick={()=>setRoleTarget('endUser')} className={`px-3 py-2 rounded-lg border ${roleTarget==='endUser' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>User</button>
            <button type="button" onClick={()=>setRoleTarget('theaterManager')} className={`px-3 py-2 rounded-lg border ${roleTarget==='theaterManager' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>Manager</button>
            <button type="button" onClick={()=>setRoleTarget('admin')} className={`px-3 py-2 rounded-lg border ${roleTarget==='admin' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>Admin</button>
          </div>
          <p className="mt-1 text-xs text-white/60">Role selection affects where we redirect after login. Your actual role is verified by the server.</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2" required />
        </div>
        <button disabled={loading} className="w-full px-4 py-2 rounded-md bg-brand hover:bg-brand-dark transition text-white">{loading? 'Signing in...' : `Sign In as ${roleTarget==='endUser'?'User': roleTarget==='theaterManager'?'Manager':'Admin'}`}</button>
        <div className="text-sm text-white/70">Don't have an account? <Link to="/signup" className="text-brand">Create one</Link></div>
      </form>
    </div>
  )
}