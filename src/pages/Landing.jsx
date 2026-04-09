import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTree } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans px-6 text-center">
      <div className="max-w-2xl animate-[fadeInUp_0.5s_ease-out]">
        <FontAwesomeIcon icon={faTree} className="text-6xl text-emerald-600 mb-8" />
        <h1 className="text-5xl md:text-6xl font-serif text-slate-800 mb-6 leading-tight">
          Cultivate Your Links.
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
          Transform ordinary, boring QR codes into beautiful, interactive 3D botanical gardens. Share your links with elegance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {currentUser ? (
            <Link to="/dashboard" className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-8 py-4 rounded-2xl hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup" className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-8 py-4 rounded-2xl hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Start Growing for Free
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white text-slate-700 font-medium px-8 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                Log In
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
