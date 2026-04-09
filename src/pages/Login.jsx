import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTree } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 w-full max-w-md">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faTree} className="text-4xl text-emerald-600 mb-4" />
          <h2 className="text-3xl font-serif text-slate-800">Welcome Back</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Email</label>
            <input type="email" required onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-emerald-600 text-white font-medium py-4 rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4">
            Sign In
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-slate-700 font-medium py-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-3">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Need an account? <Link to="/signup" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
