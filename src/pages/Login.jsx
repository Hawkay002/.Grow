import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react'; // Added icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added visibility state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate('/dashboard');
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. ' + err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 animate-[fadeInUp_0.3s_ease-out]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-medium text-emerald-900 mb-2">Grow-Voxly</h1>
          <p className="text-slate-500">Welcome back to your forest.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{error}</div>}

        <button 
          onClick={handleGoogleSignIn} disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-medium py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Log in with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute border-t border-slate-200 w-full"></div>
          <span className="relative bg-white px-4 text-xs text-slate-400 uppercase tracking-widest font-bold">Or</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2 ml-1">Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 rounded-xl ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1 mr-1">
              <label className="block text-sm font-medium text-slate-600">Password</label>
              <Link to="/forgot-password" university className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
            {/* Wrapper for the input and eye button */}
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 rounded-xl ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white font-medium py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 mt-2">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/signup" className="text-emerald-600 font-bold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
