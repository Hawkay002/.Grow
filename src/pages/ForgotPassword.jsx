import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Trees } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // THIS IS THE FIREBASE MAGIC FUNCTION
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Success! Check your inbox for the reset link.');
    } catch (err) {
      console.error(err);
      setError('Failed to reset password. Make sure this email is registered.');
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 animate-[fadeInUp_0.3s_ease-out]">
        
        <div className="flex justify-center mb-6">
          <Trees size={48} strokeWidth={1.5} className="text-emerald-600" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-slate-800 mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm">Enter your email to receive a secure reset link.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{error}</div>}
        {message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2 ml-1">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 rounded-xl ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
            />
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white font-medium py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-2">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Remembered your password? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}
