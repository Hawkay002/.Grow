import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
      <div className="bg-brand-dark text-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-display font-black mb-6 uppercase text-center text-brand-pop">Welcome Back</h2>
        
        {error && <div className="bg-red-500 text-white p-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 bg-gray-800 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none text-white transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 bg-gray-800 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none text-white transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-brand-pop text-white font-bold py-4 rounded-xl mt-4 hover:bg-pink-600 transition-colors"
          >
            Log In
          </button>
        </form>
        <div className="mt-6 text-center text-sm font-bold text-gray-400">
          Need an account? <Link to="/signup" className="text-brand-pop underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
