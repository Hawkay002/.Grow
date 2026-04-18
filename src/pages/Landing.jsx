import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trees, Sparkles, ArrowRight, QrCode, Zap, Layers, Activity,
  Globe, Palette, ChevronDown, Share2, Link2,
  Square, Circle, Hexagon, Diamond, Shapes,
  Check, X, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';

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
const fadeUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// ─── Static Data ──────────────────────────────────────────────────────────────

// Custom Carousel Images
const CAROUSEL_IMAGES = [
  '/images/carousel1.jpg',
  '/images/carousel2.jpg',
  '/images/carousel3.jpg',
  '/images/carousel4.jpg',
  '/images/carousel5.jpg',
  '/images/carousel6.jpg',
  '/images/carousel7.jpg',
  '/images/carousel8.jpg',
  '/images/carousel9.jpg',
];

const TREES = [
  {
    id: 'cherryblossom', label: 'Cherry Blossom',
    imagePlaceholder: '/images/cherryblossom.jpg',
    leaves: ['#FFB7C5', '#FF9EB5', '#FF85A1', '#FF7096'],
    trunk: '#3A2318', qr: '#be185d',
    desc: 'Soft pink canopy with a romantic, spring-bloom silhouette.'
  },
  {
    id: 'pine', label: 'Pine',
    imagePlaceholder: '/images/pine.jpg',
    leaves: ['#1B4332', '#2D6A4F', '#40916C', '#52B788'],
    trunk: '#2D241E', qr: '#064e3b',
    desc: 'Dense evergreen layers — sharp, cool, and commanding.'
  },
  {
    id: 'socotra dragon', label: 'Socotra Dragon',
    imagePlaceholder: '/images/socotradragon.jpg',
    leaves: ['#274C2B', '#386641', '#4C956C', '#2D6A4F'],
    trunk: '#5C1A06', qr: '#451a03',
    desc: 'Alien umbrella crown from the island of Socotra, Yemen.'
  },
  {
    id: 'maple', label: 'Maple',
    imagePlaceholder: '/images/maple.jpg',
    leaves: ['#9D0208', '#D00000', '#DC2F02', '#F48C06'],
    trunk: '#3A2618', qr: '#9a3412',
    desc: 'Fiery autumn palette — reds and oranges at full blaze.'
  },
  {
    id: 'juniper', label: 'Juniper',
    imagePlaceholder: '/images/juniper.jpg',
    leaves: ['#2D4A22', '#3A5A40', '#588157', '#A3B18A'],
    trunk: '#1A1A1A', qr: '#0f766e',
    desc: 'Sculptural silvery-green needles with a windswept form.'
  },
  {
    id: 'baobab', label: 'Baobab',
    imagePlaceholder: '/images/baobab.jpg',
    leaves: ['#56692e', '#6a8239', '#445423', '#839e4a'],
    trunk: '#75695c', qr: '#4a3f35',
    desc: 'Massive African giant — swollen trunk, sparse proud crown.'
  },
  {
    id: 'weeping willow', label: 'Weeping Willow',
    imagePlaceholder: '/images/weepingwillow.jpg',
    leaves: ['#8f9e59', '#a2b366', '#768545', '#b7c975'],
    trunk: '#3d3224', qr: '#2d4a22',
    desc: 'Long cascading curtains of yellow-green foliage draping down.'
  },
  {
    id: 'cactus', label: 'Prickly Pear Cactus',
    imagePlaceholder: '/images/cactus.jpg',
    leaves: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#f43f5e', '#fb7185', '#e11d48'],
    trunk: '#14532d', qr: '#14532d',
    desc: 'Vivid desert geometry — bright green paddles and pink blooming flowers.'
  },
  {
    id: 'southern magnolia', label: 'Southern Magnolia',
    imagePlaceholder: '/images/southernmagnolia.jpg',
    leaves: ['#1e3a1e', '#2d4c2d', '#3e5e3e', '#ffffff', '#fdf2f8', '#fae8ff', '#f0abfc'],
    trunk: '#4b3f35', qr: '#4c1d95',
    desc: 'Deep glossy green canopy with vibrant purplish-white flowers — gothic and grand.'
  },
];

const QR_SHAPES = [
  { id: 'cube',    label: 'Cube',    icon: Square,  desc: 'Classic block tiles — maximum scannability and bold graphic presence.' },
  { id: 'sphere',  label: 'Sphere',  icon: Circle,  desc: 'Smooth circular dots for an organic, modern aesthetic.' },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon, desc: 'Honeycomb six-sided tiles — geometry that mirrors nature.' },
  { id: 'diamond', label: 'Diamond', icon: Diamond, desc: 'Rotated squares creating a dense crystal lattice effect.' },
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

const FAQS = [
  {
    q: 'Is Grow-Voxly completely free?',
    a: 'Yes — every feature including all 9 tree species, 4 QR tile shapes, vanity slugs, and click analytics is free. We may introduce optional plans later, but the core will always remain free.'
  },
  {
    q: 'Do the QR codes actually scan reliably?',
    a: 'Absolutely. Every exported QR is ISO/IEC 18004 compliant. Finder patterns (the three corner squares) are always standard square modules regardless of tile shape, ensuring 100% compatibility with every modern smartphone.'
  },
  {
    q: 'What makes each tree structurally unique?',
    a: 'Your URL is the cryptographic seed for the procedural generation algorithm. Every character influences branch angles, canopy density, trunk width, and leaf cluster positions. Two different URLs always produce distinct trees, even within the same species.'
  },
  {
    q: 'Can I use a custom domain for my short links?',
    a: 'Currently all links live under grow-voxly.vercel.app/qr/your-slug. You can choose any memorable vanity slug now. Custom domain mapping is on the roadmap.'
  },
  {
    q: 'How many links can I create?',
    a: "There's no hard cap. Create as many trees as you need. We monitor for automated abuse, but individual creators will never hit a practical limit."
  },
  {
    q: 'Can I delete or update a link after creating it?',
    a: 'Yes. Delete any tree from your Dashboard at any time — its URL immediately returns a 404. Editing the destination URL on an existing slug is coming in a future update.'
  },
];

// ─── Reusable scroll-reveal wrappers ─────────────────────────────────────────

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealGrid({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainerVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Auto-Rotating Image Carousel ────────────────────────────────────────────
function TreeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-48 h-48 rounded-2xl ring-1 ring-emerald-700/30 overflow-hidden shadow-inner relative bg-emerald-900/40">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={CAROUSEL_IMAGES[currentIndex]}
          alt={`Showcase ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Species Marquee ──────────────────────────────────────────────────────────
function SpeciesMarquee() {
  const items = [...TREES, ...TREES, ...TREES, ...TREES];
  return (
    <div className="relative overflow-hidden bg-emerald-950 py-4 border-y border-emerald-900/60">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-emerald-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-emerald-950 to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex items-center whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((tree, i) => (
          <span key={`${tree.id}-${i}`} className="inline-flex items-center flex-shrink-0 px-8">
            <span className="font-serif font-bold text-lg text-emerald-200">{tree.label}</span>
            <span className="text-emerald-700 ml-8 text-sm">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Realistic QR SVG (proper finder patterns) ────────────────────────────────
function BoringQRCode() {
  const S = 17;
  const inFinder = (r, c) => {
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    if (r < 7 && c >= S - 7) {
      const lc = c - (S - 7);
      if (r === 0 || r === 6 || lc === 0 || lc === 6) return true;
      if (r >= 2 && r <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    }
    if (r >= S - 7 && c < 7) {
      const lr = r - (S - 7);
      if (lr === 0 || lr === 6 || c === 0 || c === 6) return true;
      if (lr >= 2 && lr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return null;
  };
  const inSep = (r, c) =>
    (r === 7 && c <= 7) || (c === 7 && r <= 7) ||
    (r === 7 && c >= S - 8) || (c === S - 8 && r <= 7) ||
    (r === S - 8 && c <= 7) || (c === 7 && r >= S - 8);

  const cells = Array.from({ length: S * S }, (_, idx) => {
    const r = Math.floor(idx / S), c = idx % S;
    const f = inFinder(r, c);
    if (f !== null) return f;
    if (inSep(r, c)) return false;
    return ((r * 13 + c * 7 + r * c * 3) % 5) < 2;
  });

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${S}, 1fr)`, gap: 2 }}
      className="bg-white p-5 rounded-2xl w-full max-w-[200px] mx-auto shadow-inner"
    >
      {cells.map((filled, i) => (
        <div key={i} style={{ aspectRatio: '1', background: filled ? '#0f172a' : '#fff', borderRadius: 1 }} />
      ))}
    </div>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="font-serif font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <Plus size={20} className="text-emerald-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-500 leading-relaxed text-sm pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
  const { currentUser } = useAuth();
  const windowWidth = useWindowWidth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden selection:bg-emerald-200">

      {/* ── SOFT BLENDING GRADIENT BACKGROUND ──────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main Central Glow directly behind the text */}
        <div className="absolute top-[8%] lg:top-[15%] left-1/2 -translate-x-1/2 w-[85vw] lg:w-[50rem] h-[400px] lg:h-[45rem] bg-teal-400/40 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none transform-gpu will-change-transform" />
        
        {/* Accent Glows */}
        <div className="absolute top-[-5%] right-[-5%] w-[300px] lg:w-[60rem] h-[300px] lg:h-[60rem] bg-gradient-to-bl from-emerald-500/30 via-teal-400/20 to-transparent rounded-full blur-[80px] lg:blur-[120px] animate-pulse transform-gpu will-change-transform" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] left-[-10%] w-[300px] lg:w-[50rem] h-[300px] lg:h-[50rem] bg-gradient-to-tr from-emerald-400/30 via-emerald-200/20 to-transparent rounded-full blur-[80px] lg:blur-[120px] transform-gpu will-change-transform" />
      </div>

      {/* ── FLOATING HUD OVERLAYS ─────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-[25%] right-[8%] z-10 bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl px-4 py-3 rounded-2xl items-center gap-3 shadow-emerald-900/5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-extrabold text-emerald-900 tracking-wider">LIVE DATA ENGINE</span>
      </div>
      <div className="hidden lg:flex absolute bottom-[25%] right-[20%] z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-2xl px-5 py-3 rounded-2xl items-center gap-3">
        <Activity size={18} className="text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-widest">
          SCANS: <span className="text-emerald-400 font-mono text-sm ml-1">14,092</span>
        </span>
      </div>

      {/* ── FOREGROUND CONTENT ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">

        {/* NAVBAR */}
        <RevealSection>
          <nav className="w-full px-6 py-6 lg:px-12 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide leading-none">
              <Trees size={28} className="text-emerald-600 shrink-0 relative bottom-[2px]" />
              <span>Grow-Voxly</span>
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
        </RevealSection>

        {/* HERO COPY */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-6 flex items-center justify-center pt-10 pb-32 lg:py-0">
          <RevealSection className="w-full lg:w-8/12 flex flex-col items-center text-center pointer-events-auto">
            
            <motion.div variants={fadeUpVariant} custom={0.1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-emerald-900 text-xs font-black uppercase tracking-widest mb-8 ring-1 ring-slate-900/5 backdrop-blur-md shadow-sm"
            >
              <Sparkles size={14} className="text-emerald-500" /> Voxel Web Architecture
            </motion.div>

            <motion.h1 variants={fadeUpVariant} custom={0.2}
              className="text-6xl lg:text-[6rem] font-serif text-slate-900 mb-6 leading-[1.05] tracking-tight"
            >
              Plant a Link. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-400">
                Grow a World.
              </span>
            </motion.h1>

            <motion.p variants={fadeUpVariant} custom={0.3}
              className="text-lg lg:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-medium"
            >
              We convert raw URL data into breathtaking, procedural 3D ecosystems. Ditch boring black-and-white pixels and share links your audience can actually explore.
            </motion.p>

            <motion.div variants={fadeUpVariant} custom={0.4}
              className="flex flex-col sm:flex-row w-full sm:w-auto items-center justify-center gap-4"
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
          </RevealSection>
        </main>

        {/* Scroll hint */}
        <RevealSection delay={0.6} className="pointer-events-auto flex justify-center pb-10">
          <a href="#stats" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors group">
            <span className="text-xs font-semibold tracking-widest uppercase">Discover</span>
            <ChevronDown size={18} className="animate-bounce" />
          </a>
        </RevealSection>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section id="stats" className="relative z-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <RevealGrid className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fadeUpVariant} className="text-center">
                <div className="text-3xl lg:text-4xl font-serif font-bold text-emerald-400 mb-1">{s.value}</div>
                <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase">{s.label}</div>
              </motion.div>
            ))}
          </RevealGrid>
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

          <RevealGrid className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={fadeUpVariant} className="flex flex-col items-center text-center px-8 py-6">
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
                </motion.div>
              );
            })}
          </RevealGrid>
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

          <RevealGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={fadeUpVariant} className="h-full">
                  <div className="p-8 rounded-[2rem] bg-white ring-1 ring-slate-900/5 h-full transition-all hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1">
                    <div className="w-14 h-14 bg-slate-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm ring-1 ring-slate-900/5">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{f.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </RevealGrid>
        </div>
      </section>

      {/* ── COMPARISON ────────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">The Difference</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Stop Blending In</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Your QR code is a first impression. Here's what it currently says about you.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-6 items-center">
            {/* Left — boring */}
            <RevealSection>
              <div className="p-8 rounded-[2rem] bg-slate-100 ring-1 ring-slate-200 text-center h-full flex flex-col">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Standard QR Code</p>
                <div className="flex justify-center mb-8 flex-grow items-center">
                  <BoringQRCode />
                </div>
                <div className="space-y-3 text-left">
                  {['Zero personality or brand identity', 'Ignored or mistrusted by users', 'Looks like every other QR code', 'Impossible to make memorable'].map(con => (
                    <div key={con} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={10} className="text-red-500" />
                      </div>
                      <span className="text-sm text-slate-500 font-medium leading-snug">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* VS */}
            <RevealSection className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-2xl ring-4 ring-white">vs</div>
            </RevealSection>

            {/* Right — Grow-Voxly */}
            <RevealSection>
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-950 to-slate-900 ring-1 ring-emerald-800/40 text-center h-full flex flex-col shadow-2xl shadow-emerald-950/20">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-8">Grow-Voxly Tree</p>
                <div className="flex justify-center mb-8 flex-grow items-center">
                  <TreeCarousel />
                </div>
                <div className="space-y-3 text-left">
                  {['Instantly recognisable brand identity', 'Invites curiosity — people want to scan', 'One-of-a-kind, seeded from your URL', 'Memorable, shareable, and beautiful'].map(pro => (
                    <div key={pro} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={10} className="text-emerald-400" />
                      </div>
                      <span className="text-sm text-slate-300 font-medium leading-snug">{pro}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── SPECIES MARQUEE ───────────────────────────────────────────────── */}
      <SpeciesMarquee />

      {/* ── TREE SPECIES GALLERY ──────────────────────────────────────────── */}
      <section id="species" className="relative z-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Species Library</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">9 Unique Ecosystems</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Each species has its own procedural algorithm, colour palette, and QR theme. Your URL dictates the exact shape.
            </p>
          </RevealSection>

          <RevealGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TREES.map((tree, i) => (
              <motion.div key={tree.id} variants={fadeUpVariant} className="h-full">
                <div className="group relative overflow-hidden p-6 rounded-[1.5rem] bg-white ring-1 ring-slate-900/5 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all h-full flex flex-col justify-between z-10">

                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity z-0 pointer-events-none"
                    style={{ backgroundImage: `url(${tree.imagePlaceholder})` }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-serif font-bold text-slate-900 capitalize">{tree.label}</h3>
                      <div
                        className="w-9 h-9 rounded-xl flex-shrink-0 ring-1 ring-black/5 shadow-sm"
                        style={{ background: tree.qr }}
                        title="QR dark colour"
                      />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">{tree.desc}</p>
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center gap-1.5 mt-auto pt-4">
                    {tree.leaves.map((c) => (
                      <div key={c} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-1 ring-black/10 shadow-sm" style={{ background: c }} title={c} />
                    ))}
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-1 ring-black/10 shadow-sm ml-1 opacity-80" style={{ background: tree.trunk }} title="Trunk" />
                    <span className="text-[10px] text-slate-500 font-bold ml-2 tracking-widest uppercase">Palette</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </RevealGrid>

          <RevealSection className="flex justify-center mt-14">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400 tracking-wide bg-white px-4 py-2 rounded-full ring-1 ring-slate-900/5 shadow-sm">
              More presets will be launched in the future <Sparkles size={16} className="text-emerald-500" />
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── QR SHAPE TILES ────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">Customise</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">4 Tile Geometries</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Export your QR with any tile shape. Finder patterns always stay square — every code scans perfectly.
            </p>
          </RevealSection>

          <RevealGrid className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {QR_SHAPES.map((shape, i) => {
              const Icon = shape.icon;
              return (
                <motion.div key={shape.id} variants={fadeUpVariant} className="h-full">
                  <div className="p-8 rounded-[1.5rem] bg-slate-50 ring-1 ring-slate-900/5 text-center hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all h-full">
                    <div className="flex justify-center mb-5 text-emerald-600">
                      <Icon size={44} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{shape.label}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{shape.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </RevealGrid>

          <RevealSection className="flex justify-center mt-14">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400 tracking-wide bg-slate-50 px-4 py-2 rounded-full ring-1 ring-slate-900/5 shadow-sm">
              More shapes will be launched in the future <Shapes size={16} className="text-emerald-500" />
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <RevealSection className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">FAQ</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Common Questions</h2>
            <p className="text-slate-500 text-lg font-medium">Everything you need before you plant your first tree.</p>
          </RevealSection>
          <RevealSection>
            <div className="bg-white rounded-[2rem] ring-1 ring-slate-900/5 shadow-sm divide-y divide-slate-100 px-8">
              {FAQS.map(faq => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-emerald-500/10 rounded-full blur-[80px] transform-gpu will-change-transform" />
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
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-8">

          {/* Top row */}
          <RevealSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-2 leading-none">
                <Trees size={20} className="text-emerald-500 relative bottom-[1px]" />
                <span className="font-serif font-bold text-white text-xl">Grow-Voxly</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
          </RevealSection>

          <div className="border-t border-slate-800" />

          {/* Bottom row — legal links */}
          <RevealSection>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} Grow-Voxly. All rights reserved.
              </p>
              <div className="flex items-center gap-5 text-xs">
                <Link to="/privacy" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-slate-700">·</span>
                <Link to="/terms" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </RevealSection>

        </div>
      </footer>

    </div>
  );
}
