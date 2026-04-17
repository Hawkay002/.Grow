import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trees, Box, Sparkles, ArrowRight, BarChart3, Link as LinkIcon, Share2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree } from '../trees/VoxelEngine';

// Highly optimized, static voxel specifically for the landing page hero
function HeroVoxel({ v }) {
  const targetColor = useMemo(() => new THREE.Color(v.color), [v.color]);
  
  return (
    <mesh position={v.pos} scale={v.scale || 1} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={targetColor} 
        emissive={v.isBase ? targetColor : new THREE.Color('#000000')}
        emissiveIntensity={0.15}
        roughness={0.9} 
      />
    </mesh>
  );
}

// The Live 3D Showcase Component
function HeroTree() {
  const voxels = useMemo(() => {
    // Generates a dense, beautiful dummy matrix to build a large preview tree
    const matrix = QRCode.create("https://grow-voxly.vercel.app/amazing-3d-trees", { errorCorrectionLevel: 'H' });
    return generateTree('socotradragon', matrix.modules.data, matrix.modules.size);
  }, []);

  return (
    <group position={[0, -10, 0]}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <group>
          {voxels.map((v, i) => <HeroVoxel key={`hero-${i}`} v={v} />)}
        </group>
      </Float>
      {/* Beautiful soft shadow underneath the floating tree */}
      <ContactShadows position={[0, -5, 0]} opacity={0.3} scale={60} blur={3} far={20} />
    </group>
  );
}

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative overflow-x-hidden selection:bg-emerald-200">
      
      {/* INNOVATIVE BACKGROUND: Subtle Dotted Architectural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      {/* DECORATIVE BACKGROUND BLURS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* GLASSMORPHIC NAVBAR */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide">
          <Trees size={28} className="text-emerald-600" />
          Grow-Voxly
        </div>
        <div>
          {currentUser ? (
            <Link to="/dashboard" className="font-medium text-emerald-700 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm ring-1 ring-slate-900/5 hover:bg-emerald-50 hover:shadow-md transition-all">
              My Garden
            </Link>
          ) : (
            <Link to="/login" className="font-medium text-slate-600 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm ring-1 ring-slate-900/5 hover:text-emerald-700 hover:shadow-md transition-all">
              Log In
            </Link>
          )}
        </div>
      </nav>

      {/* MAIN HERO SECTION */}
      <main className="max-w-7xl mx-auto w-full pt-32 pb-10 lg:pt-40 px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 relative z-10">
        
        {/* LEFT: Copy & CTA */}
        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left animate-[fadeInUp_0.5s_ease-out] relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 ring-1 ring-slate-900/5 backdrop-blur-sm shadow-sm">
            <Sparkles size={14} className="text-emerald-500" /> The Next Evolution of Links
          </div>
          
          <h1 className="text-5xl lg:text-[4rem] font-serif text-slate-900 mb-6 leading-[1.1]">
            Cultivate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Digital Links.</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            Transform ordinary, boring QR codes into beautiful, interactive 3D botanical gardens. Share your links with elegance and watch your analytics grow.
          </p>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
            {currentUser ? (
               <Link to="/dashboard" className="w-full sm:w-auto bg-slate-900 text-white font-medium px-8 py-4 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
                 Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            ) : (
              <>
                <Link to="/signup" className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-8 py-4 rounded-2xl hover:bg-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
                  Start Growing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto bg-white text-slate-700 font-medium px-8 py-4 rounded-2xl shadow-sm ring-1 ring-slate-900/5 hover:bg-slate-50 transition-all flex items-center justify-center">
                  View Examples
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Boundary-Free Interactive Canvas */}
        {/* We removed the backgrounds, borders, and shadows to let it float naturally */}
        <div className="w-full lg:w-7/12 h-[450px] lg:h-[700px] relative animate-[fadeIn_1s_ease-out_0.2s_both] cursor-grab active:cursor-grabbing">
          
          {/* Subtle Magical Glow Behind the Tree to make it pop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"></div>

          <Canvas shadows dpr={[1, 2]} camera={{ position: [55, 65, 55], zoom: 4.5 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
            <Environment preset="city" />
            
            <HeroTree />
            
            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={1.5} 
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minPolarAngle={Math.PI / 4}
            />
          </Canvas>
        </div>
      </main>

      {/* NEW DETAILED SECTION: HOW IT WORKS */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-6 py-24">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Three simple steps to transform your raw data into a beautiful, living digital ecosystem.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-full shadow-lg ring-1 ring-slate-900/5 flex items-center justify-center mb-6 text-emerald-600 transition-transform hover:scale-110">
                  <LinkIcon size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-3">1. Plant a Link</h3>
               <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Paste any destination URL. We analyze the cryptographic data signature of your link to create the geometric seed.
               </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/30 ring-4 ring-white flex items-center justify-center mb-6 text-white transition-transform hover:scale-110">
                  <Trees size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-3">2. Choose a Species</h3>
               <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Select from 9 procedural botanical styles and custom particle shapes. No two generated trees will ever look exactly alike.
               </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-full shadow-lg ring-1 ring-slate-900/5 flex items-center justify-center mb-6 text-emerald-600 transition-transform hover:scale-110">
                  <Globe size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-3">3. Share the Garden</h3>
               <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Send your custom short-link or aesthetic QR code. Visitors can explore your 3D world before continuing to their destination.
               </p>
            </div>
         </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section className="max-w-6xl mx-auto w-full px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Trees size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">Procedural Generation</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              From Weeping Willows to Desert Cacti, our Voxel Engine mathematically generates massive 3D structures instantly in the browser.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Box size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">Free Roam Interaction</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Users don't just click a link; they explore it. Scanning your code drops them into a fully interactive environment they can drag and zoom.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">Growth Analytics</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Watch your garden thrive. Track exactly how many times your digital trees have been scanned, visited, and interacted with over time.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 text-center relative z-10 border-t border-slate-200/60 mt-10">
        <p className="text-sm text-slate-500 font-medium">
          Crafted with care by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">Shovith</a>
        </p>
      </footer>
    </div>
  );
}
