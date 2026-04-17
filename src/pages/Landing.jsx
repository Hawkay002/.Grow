import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trees, Sparkles, ArrowRight, QrCode, Zap, Layers, Activity,
  Globe, Palette, ChevronDown, Share2, Link2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree } from '../trees/VoxelEngine';
import { motion, useInView } from 'framer-motion';

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }
  })
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

// ─── 3D Scene Components ──────────────────────────────────────────────────────
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

function DataStream() {
  const particlesRef = useRef();
  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: (Math.random() - 0.5) * 30,
    y: (Math.random() - 0.5) * 40 - 20,
    z: (Math.random() - 0.5) * 30,
    scale: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.02 + 0.01,
    color: Math.random() > 0.5 ? '#10b981' : '#34d399'
  })), []);

  useFrame(() => {
    if (!particlesRef.current) return;
    particlesRef.current.children.forEach((mesh, i) => {
      mesh.position.y += particles[i].speed;
      mesh.rotation.x += particles[i].speed;
      mesh.rotation.y += particles[i].speed;
      if (mesh.position.y > 10) mesh.position.y = -30;
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

function HeroTree() {
  // BUG FIX: use correct key 'socotra dragon' matching VoxelEngine PRESETS object
  const voxels = useMemo(() => {
    const matrix = QRCode.create('https://grow-voxly.vercel.app/innovation', { errorCorrectionLevel: 'H' });
    return generateTree('socotra dragon', matrix.modules.data, matrix.modules.size);
  }, []);

  return (
    <group position={[0, -5, 0]}>
      <DataStream />
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group>
          {voxels.map((v, i) => <HeroVoxel key={`hero-${i}`} v={v} />)}
        </group>
      </Float>
      <ContactShadows position={[0, -12, 0]} opacity={0.25} scale={80} blur={3.5} far={25} color="#064e3b" />
    </group>
  );
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const TREES = [
  {
    id: 'cherryblossom', label: 'Cherry Blossom', emoji: '🌸',
    leaves: ['#FFB7C5', '#FF9EB5', '#FF85A1', '#FF7096'],
    trunk: '#3A2318', qr: '#be185d',
    desc: 'Soft pink canopy with a romantic, spring-bloom silhouette.'
  },
  {
    id: 'pine', label: 'Pine', emoji: '🌲',
    leaves: ['#1B4332', '#2D6A4F', '#40916C', '#52B788'],
    trunk: '#2D241E', qr: '#064e3b',
    desc: 'Dense evergreen layers — sharp, cool, and commanding.'
  },
  {
    id: 'socotra dragon', label: 'Socotra Dragon', emoji: '🐉',
    leaves: ['#274C2B', '#386641', '#4C956C', '#2D6A4F'],
    trunk: '#5C1A06', qr: '#451a03',
    desc: 'Alien umbrella crown from the island of Socotra, Yemen.'
  },
  {
    id: 'maple', label: 'Maple', emoji: '🍁',
    leaves: ['#9D0208', '#D00000', '#DC2F02', '#F48C06'],
    trunk: '#3A2618', qr: '#9a3412',
    desc: 'Fiery autumn palette — reds and oranges at full blaze.'
  },
  {
    id: 'juniper', label: 'Juniper', emoji: '🌿',
    leaves: ['#2D4A22', '#3A5A40', '#588157', '#A3B18A'],
    trunk: '#1A1A1A', qr: '#0f766e',
    desc: 'Sculptural silvery-green needles with a windswept form.'
  },
  {
    id: 'baobab', label: 'Baobab', emoji: '🌳',
    leaves: ['#56692e', '#6a8239', '#445423', '#839e4a'],
    trunk: '#75695c', qr: '#4a3f35',
    desc: 'Massive African giant — swollen trunk, sparse proud crown.'
  },
  {
    id: 'weeping willow', label: 'Weeping Willow', emoji: '🌾',
    leaves: ['#8f9e59', '#a2b366', '#768545', '#b7c975'],
    trunk: '#3d3224', qr: '#2d4a22',
    desc: 'Long cascading curtains of yellow-green foliage draping down.'
  },
  {
    id: 'cactus', label: 'Prickly Pear Cactus', emoji: '🌵',
    leaves: ['#4ade80', '#22c55e', '#16a34a', '#15803d'],
    trunk: '#14532d', qr: '#14532d',
    desc: 'Vivid desert geometry — bright green paddles, no leaves needed.'
  },
  {
    id: 'southern magnolia', label: 'Southern Magnolia', emoji: '🌺',
    leaves: ['#1e3a1e', '#2d4c2d', '#3e5e3e'],
    trunk: '#4b3f35', qr: '#4c1d95',
    desc: 'Deep glossy canopy with a violet QR base — gothic and grand.'
  },
];

const QR_SHAPES = [
  { id: 'cube',    label: 'Cube',    icon: '⬛', desc: 'Classic block tiles — maximum scannability and bold graphic presence.' },
  { id: 'sphere',  label: 'Sphere',  icon: '⚫', desc: 'Smooth circular dots for an organic, modern aesthetic.' },
  { id: 'hexagon', label: 'Hexagon', icon: '⬡',  desc: 'Honeycomb six-sided tiles — geometry that mirrors nature.' },
  { id: 'diamond', label: 'Diamond', icon: '♦',  desc: 'Rotated squares creating a dense crystal lattice effect.' },
];

const STEPS = [
  { icon: Link2,  title: 'Paste Your URL',        desc: 'Drop any link — a portfolio, a product page, a bio — into the engine.' },
  { icon: Trees,  title: 'Choose Your Tree',       desc: 'Pick from 9 procedurally-generated species, each with a distinct shape and colour.' },
  { icon: Share2, title: 'Share the Experience',   desc: 'Your audience scans the living QR. Every scan is tracked in your dashboard.' },
];

const FEATURES = [
  {
    icon: Layers, title: 'Cryptographic Growth',
    desc: 'Your URL is the seed. Every character in your link directly alters the procedural generation of branches, density, and canopy — no two trees are identical.',
  },
  {
    icon: Zap, title: 'Instant WebGL Rendering',
    desc: 'Powered by React-Three-Fiber and optimised voxel geometry. Massive 3D ecosystems load instantly — no plugins, no lag, no installs.',
  },
  {
    icon: QrCode, title: '4 Custom Tile Shapes',
    desc: 'Export QR codes with Cubes, Spheres, Hexagons, or Diamonds. Finder patterns are always protected for 100% scan reliability.',
  },
  {
    icon: Globe, title: 'Smart Slug Routing',
    desc: 'Every tree gets a vanity URL under grow-voxly.vercel.app/qr/your-slug — with duplicate detection, auto-suggestions, and instant redirect.',
  },
  {
    icon: Activity, title: 'Real-Time Analytics',
    desc: 'Every scan increments a live counter. Watch links gain traction with per-tree click tracking from your personal garden dashboard.',
  },
  {
    icon: Palette, title: '9 Unique Species',
    desc: 'Cherry Blossom to Socotra Dragon — each tree ships with its own colour palette, canopy geometry, and QR theme. More species planned.',
  },
];

const STATS = [
  { value: '9',    label: 'Tree Species'    },
  { value: '4',    label: 'QR Tile Shapes'  },
  { value: '14K+', label: 'Links Grown'     },
  { value: '100%', label: 'Browser Native'  },
];

// ─── Reusable scroll-reveal wrapper ──────────────────────────────────────────
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
  const { currentUser } = useAuth();
  // BUG FIX: use reactive state instead of raw window.innerWidth in JSX
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth > 1024;

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden selection:bg-emerald-200">

      {/* ── FULL-SCREEN 3D CANVAS ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
        <div className="absolute top-1/2 right-[10%] lg:right-[20%] -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
        <Canvas shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ position: [70, 80, 70], zoom: 4.0 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[30, 50, 20]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
          <Environment preset="city" />
          {/* BUG FIX: isDesktop from state, not raw window.innerWidth */}
          <group position={[isDesktop ? 25 : 0, -5, 0]}>
            <HeroTree />
          </group>
          <OrbitControls
            enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2}
            maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>

      {/* ── FLOATING HUD OVERLAYS ─────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-[25%] right-[8%] z-10 bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl px-4 py-3 rounded-2xl items-center gap-3 shadow-emerald-900/5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-extrabold text-emerald-900 tracking-wider">LIVE RENDER ENGINE</span>
      </div>
      <div className="hidden lg:flex absolute bottom-[25%] right-[35%] z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-2xl px-5 py-3 rounded-2xl items-center gap-3">
        <Activity size={18} className="text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-widest">
          SCANS: <span className="text-emerald-400 font-mono text-sm ml-1">14,092</span>
        </span>
      </div>

      {/* ── FOREGROUND CONTENT ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">

        {/* NAVBAR */}
        <nav className="w-full px-6 py-6 lg:px-12 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide">
            <Trees size={28} className="text-emerald-600" />
            Grow-Voxly
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <a href="#how-it-works" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors px-3 py-2">
              How It Works
            </a>
            <a href="#species" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors px-3 py-2">
              Species
            </a>
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
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left pointer-events-auto"
          >
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-emerald-900 text-xs font-black uppercase tracking-widest mb-8 ring-1 ring-slate-900/5 backdrop-blur-md shadow-sm"
            >
              <Sparkles size={14} className="text-emerald-500" /> Voxel Web Architecture
            </motion.div>

            <motion.h1 variants={fadeUp} custom={0.05}
              className="text-6xl lg:text-[4.5rem] font-serif text-slate-900 mb-6 leading-[1.05] tracking-tight"
            >
              Plant a Link. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-400">
                Grow a World.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={0.1}
              className="text-lg lg:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium"
            >
              We convert raw URL data into breathtaking, procedural 3D ecosystems. Ditch boring black-and-white pixels and share links your audience can actually explore.
            </motion.p>

            <motion.div variants={fadeUp} custom={0.15}
              className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4"
            >
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
            </motion.div>
          </motion.div>
        </main>

        {/* Scroll hint */}
        <div className="pointer-events-auto flex justify-center pb-10">
          <a href="#stats" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors group">
            <span className="text-xs font-semibold tracking-widest uppercase">Discover</span>
            <ChevronDown size={18} className="animate-bounce" />
          </a>
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section id="stats" className="relative z-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <RevealSection key={s.label} delay={i * 0.08} className="text-center">
                <div className="text-3xl lg:text-4xl font-serif font-bold text-emerald-400 mb-1">{s.value}</div>
                <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase">{s.label}</div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Process</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">From URL to Ecosystem</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">Three steps. Zero friction. A living, scannable 3D world.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <RevealSection key={step.title} delay={i * 0.12} className="flex flex-col items-center text-center px-8 py-6">
                  <div className="relative mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shadow-sm">
                      <Icon size={26} className="text-emerald-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-black bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{step.desc}</p>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Under the Hood</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Engineered for Engagement</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">A powerful fusion of data encoding, procedural generation, and WebGL graphics.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <RevealSection key={f.title} delay={i * 0.07}>
                  <div className="p-8 rounded-[2rem] bg-white ring-1 ring-slate-900/5 h-full transition-all hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1">
                    <div className="w-14 h-14 bg-slate-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm ring-1 ring-slate-900/5">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{f.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TREE SPECIES GALLERY ──────────────────────────────────────────── */}
      <section id="species" className="relative z-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Species Library</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">9 Unique Ecosystems</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Each species has its own procedural algorithm, colour palette, and QR theme. Your URL dictates the exact shape.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TREES.map((tree, i) => (
              <RevealSection key={tree.id} delay={i * 0.05}>
                <div className="group p-6 rounded-[1.5rem] bg-slate-50 ring-1 ring-slate-900/5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl leading-none block mb-2">{tree.emoji}</span>
                      <h3 className="text-base font-serif font-bold text-slate-900 capitalize">{tree.label}</h3>
                    </div>
                    {/* QR accent chip shows the QR dark colour */}
                    <div
                      className="w-9 h-9 rounded-xl flex-shrink-0 ring-1 ring-black/5 shadow-sm"
                      style={{ background: tree.qr }}
                      title="QR dark colour"
                    />
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium">{tree.desc}</p>
                  {/* Leaf colour palette dots */}
                  <div className="flex items-center gap-1.5">
                    {tree.leaves.map((c) => (
                      <div key={c} className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ background: c }} title={c} />
                    ))}
                    <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm ml-0.5 opacity-70" style={{ background: tree.trunk }} title="Trunk" />
                    <span className="text-[10px] text-slate-400 font-semibold ml-1 tracking-wide uppercase">Palette</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR SHAPE TILES ────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Customise</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">4 Tile Geometries</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Export your QR with any tile shape. Finder patterns always stay square — every code scans perfectly.
            </p>
          </RevealSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {QR_SHAPES.map((shape, i) => (
              <RevealSection key={shape.id} delay={i * 0.08}>
                <div className="p-6 rounded-[1.5rem] bg-white ring-1 ring-slate-900/5 text-center hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-4 leading-none">{shape.icon}</div>
                  <h3 className="text-base font-serif font-bold text-slate-900 mb-2">{shape.label}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{shape.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-emerald-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8 ring-1 ring-emerald-500/20">
              <Sparkles size={13} /> Free to Start
            </div>
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-6 leading-[1.05]">
              Ready to Grow <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-300">
                Your First Tree?
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-medium leading-relaxed">
              Join creators, developers, and artists turning boring links into living 3D worlds. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {currentUser ? (
                <Link to="/dashboard" className="bg-emerald-500 text-white font-bold px-10 py-4 rounded-2xl hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                  Go to My Garden <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="bg-emerald-500 text-white font-bold px-10 py-4 rounded-2xl hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                    Start Cultivating <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="bg-white/10 text-white font-bold px-10 py-4 rounded-2xl ring-1 ring-white/20 hover:bg-white/15 hover:shadow-lg transition-all flex items-center justify-center">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            {/* Trust micro-copy */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-10">
              {['Free to start', 'No credit card', 'Browser native', '9 tree species'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t}
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="w-full py-12 relative z-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Trees size={20} className="text-emerald-500" />
            <span className="font-serif font-bold text-white text-xl">Grow-Voxly</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="text-slate-400 hover:text-emerald-400 font-medium transition-colors">How It Works</a>
            <a href="#species" className="text-slate-400 hover:text-emerald-400 font-medium transition-colors">Species</a>
            <Link to="/login" className="text-slate-400 hover:text-emerald-400 font-medium transition-colors">Login</Link>
            <Link to="/signup" className="text-slate-400 hover:text-emerald-400 font-medium transition-colors">Sign Up</Link>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Architected by{' '}
            <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer"
              className="text-emerald-500 hover:text-emerald-400 hover:underline font-bold transition-colors">
              Shovith
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}
