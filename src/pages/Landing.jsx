import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trees, Sparkles, ArrowRight, Box, QrCode, Zap, Layers, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree } from '../trees/VoxelEngine';

// 1. The Core Tree Voxel
function HeroVoxel({ v }) {
  const targetColor = useMemo(() => new THREE.Color(v.color), [v.color]);
  return (
    <mesh position={v.pos} scale={v.scale || 1} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={targetColor} 
        emissive={v.isBase ? targetColor : new THREE.Color('#000000')}
        emissiveIntensity={0.2}
        roughness={0.8} 
      />
    </mesh>
  );
}

// 2. INNOVATIVE: Floating Data Stream Particles feeding the tree
function DataStream() {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 40 - 20,
      z: (Math.random() - 0.5) * 30,
      scale: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.5 ? '#10b981' : '#34d399'
    }));
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    particlesRef.current.children.forEach((mesh, i) => {
      mesh.position.y += particles[i].speed;
      mesh.rotation.x += particles[i].speed;
      mesh.rotation.y += particles[i].speed;
      // Reset particle to bottom when it floats too high
      if (mesh.position.y > 10) {
        mesh.position.y = -30;
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// 3. The Live 3D Showcase Component
function HeroTree() {
  const voxels = useMemo(() => {
    const matrix = QRCode.create("https://grow-voxly.vercel.app/innovation", { errorCorrectionLevel: 'H' });
    return generateTree('socotradragon', matrix.modules.data, matrix.modules.size);
  }, []);

  return (
    <group position={[0, -5, 0]}>
      <DataStream />
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group>
          {voxels.map((v, i) => <HeroVoxel key={`hero-${i}`} v={v} />)}
        </group>
      </Float>
      {/* Massive soft shadow to ground it without boundaries */}
      <ContactShadows position={[0, -12, 0]} opacity={0.25} scale={80} blur={3.5} far={25} color="#064e3b" />
    </group>
  );
}

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden selection:bg-emerald-200">
      
      {/* FULL SCREEN, ZERO-BOUNDARY 3D CANVAS */}
      {/* Absolute positioning spanning the entire screen guarantees no clipping borders */}
      <div className="absolute inset-0 z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
        {/* Soft atmospheric glow exactly where the tree is */}
        <div className="absolute top-1/2 right-[10%] lg:right-[20%] -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <Canvas shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ position: [70, 80, 70], zoom: 4.0 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[30, 50, 20]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
          <Environment preset="city" />
          
          {/* Shift the entire 3D group to the right for desktop, center for mobile */}
          <group position={[window.innerWidth > 1024 ? 25 : 0, -5, 0]}>
            <HeroTree />
          </group>
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={1.2} 
            maxPolarAngle={Math.PI / 2 + 0.15} 
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>

      {/* FLOATING HOLOGRAPHIC UI (Absolute Overlays to merge UI and 3D) */}
      <div className="hidden lg:flex absolute top-[25%] right-[8%] z-10 bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl px-4 py-3 rounded-2xl items-center gap-3 animate-bounce shadow-emerald-900/5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-extrabold text-emerald-900 tracking-wider">LIVE RENDER ENGINE</span>
      </div>
      <div className="hidden lg:flex absolute bottom-[25%] right-[35%] z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-2xl px-5 py-3 rounded-2xl items-center gap-3">
        <Activity size={18} className="text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-widest">SCANS: <span className="text-emerald-400 font-mono text-sm ml-1">14,092</span></span>
      </div>

      {/* FOREGROUND CONTENT LAYER (Pointer-events-none ensures you can still grab the 3D tree behind the text) */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">
        
        {/* NAVBAR */}
        <nav className="w-full px-6 py-6 lg:px-12 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide">
            <Trees size={28} className="text-emerald-600" />
            Grow-Voxly
          </div>
          <div>
            {currentUser ? (
              <Link to="/dashboard" className="font-bold text-sm text-emerald-800 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm ring-1 ring-slate-900/5 hover:bg-white hover:shadow-md transition-all">
                My Garden
              </Link>
            ) : (
              <Link to="/login" className="font-bold text-sm text-slate-700 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm ring-1 ring-slate-900/5 hover:text-emerald-700 hover:bg-white hover:shadow-md transition-all">
                Access Engine
              </Link>
            )}
          </div>
        </nav>

        {/* HERO COPY */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-6 flex items-center pt-10 pb-32 lg:py-0">
          <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left pointer-events-auto animate-[fadeInUp_0.6s_ease-out]">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-emerald-900 text-xs font-black uppercase tracking-widest mb-8 ring-1 ring-slate-900/5 backdrop-blur-md shadow-sm">
              <Sparkles size={14} className="text-emerald-500" /> Voxel Web Architecture
            </div>
            
            <h1 className="text-6xl lg:text-[4.5rem] font-serif text-slate-900 mb-6 leading-[1.05] tracking-tight">
              Plant a Link. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-400">Grow a World.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              We convert raw URL data into breathtaking, procedural 3D ecosystems. Ditch the boring black-and-white pixels and share links your audience can actually explore.
            </p>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
              {currentUser ? (
                 <Link to="/dashboard" className="w-full sm:w-auto bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                   Initialize Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              ) : (
                <>
                  <Link to="/signup" className="w-full sm:w-auto bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                    Start Cultivating <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto bg-white/80 backdrop-blur-md text-slate-800 font-bold px-8 py-4 rounded-2xl shadow-sm ring-1 ring-slate-900/5 hover:bg-white hover:shadow-lg transition-all flex items-center justify-center">
                    View Live Demos
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CATCHY TECHNICAL FEATURES SECTION */}
      <section className="relative z-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto w-full px-6 py-24">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Engineered for Engagement</h2>
             <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">A powerful fusion of data encoding and WebGL graphics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-slate-50 ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1">
              <div className="w-14 h-14 bg-white text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm ring-1 ring-slate-900/5">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Cryptographic Growth</h3>
              <p className="text-slate-600 leading-relaxed">
                Your URL dictates the exact physical structure of the tree. Every single character in your link alters the procedural generation of branches and leaves.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-50 ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1">
              <div className="w-14 h-14 bg-white text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm ring-1 ring-slate-900/5">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Instant Rendering</h3>
              <p className="text-slate-600 leading-relaxed">
                Powered by React-Three-Fiber and highly optimized voxel geometry. Massive 3D ecosystems load instantly in the browser with zero lag or plugins.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-50 ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1">
              <div className="w-14 h-14 bg-white text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm ring-1 ring-slate-900/5">
                <QrCode size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Custom Data Tiles</h3>
              <p className="text-slate-600 leading-relaxed">
                Export the raw 2D QR matrix using Hexagons, Smooth Spheres, or Crystal Diamonds. We bridge the gap between flat data and 3D art.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 text-center relative z-20 bg-white border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-4">
           <Trees size={20} className="text-emerald-600" />
           <span className="font-serif font-bold text-slate-900 text-xl">Grow-Voxly</span>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Architected & Engineered by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">Shovith</a>
        </p>
      </footer>
    </div>
  );
}
