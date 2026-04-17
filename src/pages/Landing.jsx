import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trees, QrCode, Box, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
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
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
        {/* Slowly auto-rotates via OrbitControls, but starts at a nice angle */}
        <group>
          {voxels.map((v, i) => <HeroVoxel key={`hero-${i}`} v={v} />)}
        </group>
      </Float>
      {/* Beautiful soft shadow underneath the floating tree */}
      <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={50} blur={2.5} far={15} />
    </group>
  );
}

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden selection:bg-emerald-200">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-emerald-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* GLASSMORPHIC NAVBAR */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-2xl tracking-wide">
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
      <main className="max-w-7xl mx-auto w-full pt-32 pb-20 lg:pt-40 px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 relative z-10">
        
        {/* LEFT: Copy & CTA */}
        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left animate-[fadeInUp_0.5s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 ring-1 ring-emerald-600/20 backdrop-blur-sm">
            <Sparkles size={14} /> The Next Evolution of Links
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-serif text-slate-800 mb-6 leading-[1.15]">
            Cultivate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Digital Links.</span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
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
                <Link to="/login" className="w-full sm:w-auto bg-white text-slate-700 font-medium px-8 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center">
                  View Examples
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Live 3D Interactive Canvas */}
        <div className="w-full lg:w-7/12 h-[450px] lg:h-[650px] relative animate-[fadeIn_1s_ease-out_0.2s_both]">
          {/* Floating UI Badge */}
          <div className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-lg ring-1 ring-slate-900/5 flex items-center gap-3 animate-bounce">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 tracking-wide">INTERACTIVE PREVIEW &bull; DRAG TO ROTATE</span>
          </div>

          <div className="w-full h-full rounded-[3rem] bg-white/40 backdrop-blur-md shadow-[0_20px_40px_rgb(0,0,0,0.04)] ring-1 ring-white overflow-hidden relative">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [55, 65, 55], zoom: 4.5 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
              <Environment preset="city" />
              
              <HeroTree />
              
              <OrbitControls 
                enablePan={false} 
                enableZoom={false} 
                autoRotate 
                autoRotateSpeed={2.0} 
                maxPolarAngle={Math.PI / 2 + 0.1} 
                minPolarAngle={Math.PI / 4}
              />
            </Canvas>
          </div>
        </div>
      </main>

      {/* FEATURES GRID SECTION */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white/60 backdrop-blur-lg p-8 rounded-3xl ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner">
              <Trees size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">9 Botanical Species</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              From Cherry Blossoms to Socotra Dragons, wrap your links in procedural 3D nature. No two trees are ever generated exactly the same.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-lg p-8 rounded-3xl ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner">
              <Box size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">Free Roam Interaction</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Users don't just click a link; they explore it. Scanning your custom QR code drops them into a fully interactive 3D environment.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-lg p-8 rounded-3xl ring-1 ring-slate-900/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">Growth Analytics</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Watch your garden thrive. Track exactly how many times your digital trees have been scanned, visited, and interacted with.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-10 text-center relative z-10 border-t border-slate-200/60 mt-10">
        <p className="text-sm text-slate-500 font-medium">
          Crafted with care by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">Shovith</a>
        </p>
      </footer>
    </div>
  );
}
