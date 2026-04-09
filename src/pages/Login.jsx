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

  // Redirect to landing page if already logged in
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
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="bg-brand-dark p-10 border-8 border-white shadow-[16px_16px_0px_rgba(255,42,95,1)] w-full max-w-md z-10 text-white">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faTree} className="text-5xl text-brand-pop mb-4" />
          <h2 className="text-4xl font-display font-black uppercase tracking-tight text-white">Welcome Back</h2>
        </div>
        
        {error && <div className="bg-red-500 text-white p-3 border-4 border-white font-bold mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label className="block font-black uppercase text-sm mb-2 text-gray-300">Email</label>
            <input type="email" required onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#1a1a1a] border-4 border-gray-600 font-mono outline-none focus:bg-[#2a2a2a] focus:border-brand-pop transition-colors text-white" />
          </div>

          <div>
            <label className="block font-black uppercase text-sm mb-2 text-gray-300">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#1a1a1a] border-4 border-gray-600 font-mono outline-none focus:bg-[#2a2a2a] focus:border-brand-pop transition-colors text-white pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-brand-pop text-white font-black text-lg uppercase tracking-widest py-4 border-4 border-brand-pop hover:bg-pink-600 transition-all">
            Log In
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-1 bg-gray-600"></div>
          <span className="font-black uppercase text-sm text-gray-400">OR</span>
          <div className="flex-1 h-1 bg-gray-600"></div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-brand-dark font-black text-lg uppercase tracking-widest py-4 border-4 border-white hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <div className="mt-8 text-center font-bold text-gray-400 uppercase text-sm">
          Need an account? <Link to="/signup" className="text-brand-pop border-b-2 border-brand-pop hover:text-white transition-colors">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
