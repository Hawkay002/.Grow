import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f5] text-brand-dark p-6">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase leading-none">
          Links that <br />
          <span className="text-brand-pop">Grow.</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-sans text-gray-700 max-w-2xl mx-auto">
          Don't just share a boring QR code. Turn your links into interactive, 3D voxel trees. When people scan, they don't just get redirected—they experience your link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            to="/signup" 
            className="bg-brand-pop text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(255,42,95,0.3)]"
          >
            Start Planting
          </Link>
          <Link 
            to="/login" 
            className="bg-brand-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-brand-pop rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
    </div>
  );
}
