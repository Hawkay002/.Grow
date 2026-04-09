import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTree } from '@fortawesome/free-solid-svg-icons';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length > 5) score += 1;
    if (pw.length > 8) score += 1;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
  };
  const strength = getStrength(password);

  async function handleEmailSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (strength < 2) return setError('Password is too weak');

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
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
          <h2 className="text-3xl font-serif text-slate-800">Join Vox.ly</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleEmailSignup} className="space-y-5">
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
            {password && (
              <div className="mt-2 flex gap-1 h-1.5 px-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all ${i < strength ? (strength > 2 ? 'bg-emerald-500' : strength > 1 ? 'bg-amber-400' : 'bg-red-400') : 'bg-slate-200'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Confirm Password</label>
            <input type={showPassword ? "text" : "password"} required onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700" />
          </div>

          <button disabled={loading} className="w-full bg-emerald-600 text-white font-medium py-4 rounded-xl hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4">
            Create Account
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button onClick={handleGoogleSignup} disabled={loading} className="w-full bg-white text-slate-700 font-medium py-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-3">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
