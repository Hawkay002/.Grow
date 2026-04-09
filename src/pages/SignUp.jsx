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

  // Redirect to landing page if already logged in
  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  // Simple Password Strength Logic
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
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="bg-white p-10 border-8 border-brand-dark shadow-[16px_16px_0px_rgba(26,26,26,1)] w-full max-w-md z-10">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faTree} className="text-5xl text-brand-pop mb-4" />
          <h2 className="text-4xl font-display font-black uppercase tracking-tight text-brand-dark">Join Vox.ly</h2>
        </div>
        
        {error && <div className="bg-red-500 text-white p-3 border-4 border-brand-dark font-bold mb-6 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">{error}</div>}
        
        <form onSubmit={handleEmailSignup} className="space-y-6">
          <div>
            <label className="block font-black uppercase text-sm mb-2 text-brand-dark">Email</label>
            <input type="email" required onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#f4f4f5] border-4 border-brand-dark font-mono outline-none focus:bg-white focus:border-brand-pop transition-colors" />
          </div>

          <div>
            <label className="block font-black uppercase text-sm mb-2 text-brand-dark">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#f4f4f5] border-4 border-brand-dark font-mono outline-none focus:bg-white focus:border-brand-pop transition-colors pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-dark">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2 flex gap-1 h-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex-1 border-2 border-brand-dark ${i < strength ? (strength > 2 ? 'bg-green-500' : strength > 1 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-transparent'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-black uppercase text-sm mb-2 text-brand-dark">Confirm Password</label>
            <input type={showPassword ? "text" : "password"} required onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-[#f4f4f5] border-4 border-brand-dark font-mono outline-none focus:bg-white focus:border-brand-pop transition-colors" />
          </div>

          <button disabled={loading} className="w-full bg-brand-pop text-white font-black text-lg uppercase tracking-widest py-4 border-4 border-brand-dark hover:translate-y-1 hover:translate-x-1 hover:shadow-none shadow-[6px_6px_0px_rgba(26,26,26,1)] transition-all">
            Sign Up
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-1 bg-brand-dark"></div>
          <span className="font-black uppercase text-sm">OR</span>
          <div className="flex-1 h-1 bg-brand-dark"></div>
        </div>

        <button onClick={handleGoogleSignup} disabled={loading} className="w-full bg-white text-brand-dark font-black text-lg uppercase tracking-widest py-4 border-4 border-brand-dark hover:bg-gray-100 hover:translate-y-1 hover:translate-x-1 hover:shadow-none shadow-[6px_6px_0px_rgba(26,26,26,1)] transition-all flex items-center justify-center gap-3">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <div className="mt-8 text-center font-bold text-gray-500 uppercase text-sm">
          Already have an account? <Link to="/login" className="text-brand-pop border-b-2 border-brand-pop hover:text-brand-dark transition-colors">Log In</Link>
        </div>
      </div>
    </div>
  );
}
