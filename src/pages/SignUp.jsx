import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border-4 border-brand-dark">
        <h2 className="text-4xl font-display font-black mb-6 uppercase text-center">Join Vox.ly</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 bg-gray-100 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 bg-gray-100 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-brand-pop text-white font-bold py-4 rounded-xl mt-4 hover:bg-pink-600 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center text-sm font-bold text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-pop underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}
