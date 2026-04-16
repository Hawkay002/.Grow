import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, deleteDoc, doc, serverTimestamp, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateTree, TREE_THEMES } from '../trees/VoxelEngine';
import { User, LogOut, Copy, Download, QrCode, ExternalLink, Trash2, X, Share2, Check, Camera, Link as LinkIcon } from 'lucide-react';
import { avatars } from '../components/avatar-picker';
import confetti from 'canvas-confetti';

// FIXED: Protected Finder Patterns for Scannability
async function generateCustomQR(link, theme, shape) {
  const qrc = QRCode.create(link, { errorCorrectionLevel: 'M' });
  const size = qrc.modules.size;
  const data = qrc.modules.data;
  
  const canvas = document.createElement('canvas');
  const cellSize = 10;
  const margin = 2;
  const canvasSize = (size + margin * 2) * cellSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');
  
  // Draw Background
  ctx.fillStyle = theme.qrLight;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw Data Modules
  ctx.fillStyle = theme.qrDark;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (data[row * size + col]) {
        const x = (col + margin) * cellSize;
        const y = (row + margin) * cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        
        // ISOLATE FINDER PATTERNS (The 3 large corner squares: 7x7 modules each)
        const isFinderPattern = 
          (row < 7 && col < 7) || 
          (row < 7 && col >= size - 7) || 
          (row >= size - 7 && col < 7);
        
        ctx.beginPath();
        
        // Force Finder Patterns to be solid squares so the camera can lock on
        if (isFinderPattern || shape === 'cube') {
          ctx.rect(x, y, cellSize, cellSize);
        } else if (shape === 'sphere') {
          ctx.arc(cx, cy, cellSize/2 * 0.95, 0, Math.PI * 2);
        } else if (shape === 'hexagon') {
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (Math.PI / 6);
            const px = cx + (cellSize/2 * 1.05) * Math.cos(angle);
            const py = cy + (cellSize/2 * 1.05) * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        } else if (shape === 'diamond') {
          // Draw a diamond that fully touches the cell edges to maximize scan density
          ctx.moveTo(cx, y);
          ctx.lineTo(x + cellSize, cy);
          ctx.lineTo(cx, y + cellSize);
          ctx.lineTo(x, cy);
        }
        
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  return canvas.toDataURL('image/png');
}

function AnimatedVoxel({ v, shape = 'cube' }) {
  const materialRef = useRef();
  const targetColor = useMemo(() => new THREE.Color(), []);
  const black = useMemo(() => new THREE.Color('#000000'), []);

  useFrame(() => {
    if (!materialRef.current) return;
    targetColor.set(v.color);
    materialRef.current.color.lerp(targetColor, 0.1);
    if (v.isBase) {
      materialRef.current.emissive.lerp(targetColor, 0.1);
    } else {
      materialRef.current.emissive.lerp(black, 0.1);
    }
  });

  return (
    <mesh position={v.pos} scale={v.scale || 1} castShadow={!v.isBase} receiveShadow>
      {shape === 'sphere' && <sphereGeometry args={[0.65, 16, 16]} />}
      {shape === 'hexagon' && <cylinderGeometry args={[0.65, 0.65, 1, 6]} />}
      {shape === 'diamond' && <octahedronGeometry args={[0.75]} />}
      {shape === 'cube' && <boxGeometry args={[1, 1, 1]} />}
      <meshStandardMaterial ref={materialRef} color={v.color} roughness={0.9} />
    </mesh>
  );
}

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [treeType, setTreeType] = useState('cherryblossom');
  
  const [voxelShape, setVoxelShape] = useState('cube');
  
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [recentlyCreated, setRecentlyCreated] = useState(null);
  const [myLinks, setMyLinks] = useState([]);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [selectedQrForModal, setSelectedQrForModal] = useState(null);

  const [slugError, setSlugError] = useState('');
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const resultRef = useRef(null);

  useEffect(() => {
    setSlugError('');
    setSlugSuggestions([]);
  }, [customSlug]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const q = query(collection(db, 'qrs'), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const links = [];
      querySnapshot.forEach((doc) => links.push({ id: doc.id, ...doc.data() }));
      setMyLinks(links.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    });
    return () => unsubscribe();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (recentlyCreated && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          const defaults = { startVelocity: 45, spread: 60, ticks: 150, zIndex: 100, gravity: 1.2 };
          confetti({ ...defaults, particleCount: 70, angle: 60, origin: { x: 0, y: 1 } });
          confetti({ ...defaults, particleCount: 70, angle: 120, origin: { x: 1, y: 1 } });
        }, 800); 
      }, 100);
    }
  }, [recentlyCreated]);

  async function confirmDelete() {
    if (!linkToDelete) return;
    await deleteDoc(doc(db, 'qrs', linkToDelete));
    setLinkToDelete(null);
  }

  const handleCapture = () => {
    const canvas = document.querySelector('#tree-preview-wrapper canvas');
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${linkTitle || 'voxly-tree-preview'}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setSlugError('');
    setSlugSuggestions([]);
    setLinkCopied(false);
    
    try {
      let finalId = '';
      if (customSlug.trim()) {
        const baseSlug = customSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const docRef = doc(db, 'qrs', baseSlug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const suggestions = [];
          let counter = 1;
          while (suggestions.length < 3 && counter < 50) {
            const testSlug = `${baseSlug}-${counter}`;
            const testSnap = await getDoc(doc(db, 'qrs', testSlug));
            if (!testSnap.exists()) suggestions.push(testSlug);
            counter++;
          }
          setSlugError('This custom link is already taken!');
          setSlugSuggestions(suggestions);
          setLoading(false);
          return; 
        } else {
          finalId = baseSlug;
        }
      } else {
        finalId = doc(collection(db, 'qrs')).id;
      }

      const canvas = document.querySelector('#tree-preview-wrapper canvas');
      let previewImageData = null;
      if (canvas) {
        try {
          previewImageData = canvas.toDataURL('image/webp', 0.5); 
        } catch (e) {
          console.warn("Could not capture 3D snapshot", e);
        }
      }

      await setDoc(doc(db, 'qrs', finalId), {
        userId: currentUser.uid, 
        title: linkTitle || 'Untitled Tree',
        destinationUrl: url, 
        treeType, 
        voxelShape, 
        previewImage: previewImageData,
        createdAt: serverTimestamp(), 
        clicks: 0
      });

      const shortLink = `${window.location.origin}/qr/${finalId}`;
      const theme = TREE_THEMES[treeType];
      
      const qrDataUrl = await generateCustomQR(shortLink, theme, voxelShape);

      setRecentlyCreated({ link: shortLink, img: qrDataUrl, title: linkTitle || 'Untitled Tree' });
      setUrl(''); 
      setLinkTitle(''); 
      setCustomSlug('');
      setPanX(0);
      setPanY(0);
    } catch (error) {
      console.error(error);
      alert("Failed to grow link.");
    }
    setLoading(false);
  }

  const handleShareRecentlyCreated = async () => {
    if (!navigator.share || !recentlyCreated) return alert("Sharing is not supported on this device.");
    try {
      const res = await fetch(recentlyCreated.img);
      const blob = await res.blob();
      const file = new File([blob], `${recentlyCreated.title || 'voxly-tree'}.png`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: recentlyCreated.title || 'Grow-Voxly',
          text: `Scan to interact with my 3D tree!\n\n${recentlyCreated.link}`,
          files: [file]
        });
      } else {
        await navigator.share({
          title: recentlyCreated.title || 'Grow-Voxly',
          text: 'Check out my interactive 3D tree!',
          url: recentlyCreated.link
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Error sharing", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recentlyCreated.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const downloadQR = async (qr) => {
    try {
      const shortLink = `${window.location.origin}/qr/${qr.slug || qr.id}`;
      const theme = TREE_THEMES[qr.treeType] || TREE_THEMES.cherryblossom;
      const imgUrl = await generateCustomQR(shortLink, theme, qr.voxelShape || 'cube');
      const link = document.createElement('a');
      link.download = `${qr.title || 'voxly-tree'}-qr.png`;
      link.href = imgUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download QR code", error);
    }
  };

  const previewVoxels = useMemo(() => {
    const matrix = QRCode.create(url || "https://vox.ly", { errorCorrectionLevel: 'M' });
    return generateTree(treeType, matrix.modules.data, matrix.modules.size);
  }, [url, treeType]);

  const scrollbarCSS = `
    .custom-slim-scrollbar::-webkit-scrollbar { height: 6px; }
    .custom-slim-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-slim-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-slim-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `;

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200 flex flex-col relative">
      <style>{scrollbarCSS}</style>

      {linkToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl ring-1 ring-slate-900/5 text-center animate-[fadeInUp_0.2s_ease-out]">
            <h3 className="font-serif text-2xl text-slate-800 mb-2">Uproot this tree?</h3>
            <p className="text-slate-500 mb-8 text-sm">This action cannot be undone. The link will immediately stop working.</p>
            <div className="flex gap-4">
              <button onClick={() => setLinkToDelete(null)} className="flex-1 py-3 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}

      {selectedQrForModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl ring-1 ring-slate-900/5 text-center animate-[fadeInUp_0.2s_ease-out]">
            <button onClick={() => setSelectedQrForModal(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 p-1.5 rounded-full">
              <X size={20} />
            </button>
            
            <h3 className="font-serif text-2xl text-slate-800 mb-2 mt-2">{selectedQrForModal.title}</h3>
            <p className="text-slate-500 mb-6 text-sm">Scan or download to share.</p>
            
            <img src={selectedQrForModal.qrImgUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-8 rounded-xl shadow-sm ring-1 ring-slate-900/5" />
            
            <div className="flex gap-3">
              <button onClick={async () => {
                if (!navigator.share) return alert("Sharing is not supported here.");
                try {
                  const res = await fetch(selectedQrForModal.qrImgUrl);
                  const blob = await res.blob();
                  const file = new File([blob], `${selectedQrForModal.title}-qr.png`, { type: blob.type });
                  
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ 
                      title: selectedQrForModal.title || 'Grow-Voxly', 
                      text: `Scan to interact with my 3D tree!\n\n${selectedQrForModal.publicUrl}`, 
                      files: [file] 
                    });
                  } else {
                    await navigator.share({
                      title: selectedQrForModal.title || 'Grow-Voxly',
                      text: 'Check out my interactive 3D tree!',
                      url: selectedQrForModal.publicUrl
                    });
                  }
                } catch(e) { console.error(e) }
              }} className="flex-1 py-3 font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Share2 size={18} /> Share
              </button>
              
              <a href={selectedQrForModal.qrImgUrl} download={`${selectedQrForModal.title}-qr.png`} className="flex-1 py-3 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                <Download size={18} /> Save
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="max-w-6xl mx-auto w-full pt-8 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-emerald-900 tracking-wide">Grow-Voxly</h1>
        
        <button 
          onClick={() => navigate('/profile')} 
          title="Profile"
          className="w-10 h-10 rounded-full shadow-sm ring-2 ring-white hover:shadow-md hover:ring-emerald-100 transition-all bg-slate-100 overflow-hidden group flex items-center justify-center"
        >
          {currentUser?.photoURL ? (
            <img 
              src={avatars.find(a => a.id === parseInt(currentUser.photoURL))?.src || avatars[0].src} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <User size={18} />
            </div>
          )}
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full mt-16 px-6 pb-20 flex-grow">
        <div className="flex gap-12 mb-12 border-b border-slate-200 px-4">
          <button onClick={() => setActiveTab('create')} className={`pb-4 text-lg font-medium transition-all ${activeTab === 'create' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>Cultivate</button>
          <button onClick={() => setActiveTab('links')} className={`pb-4 text-lg font-medium transition-all ${activeTab === 'links' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>My Garden</button>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <input 
              type="text" 
              placeholder="Name your tree..." 
              value={linkTitle} 
              onChange={(e) => setLinkTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              className="w-full bg-transparent font-serif font-bold text-4xl sm:text-5xl leading-normal py-4 text-emerald-950 placeholder:text-emerald-900/30 focus:outline-none px-4 drop-shadow-sm"
            />

            <div id="tree-preview-wrapper" className="relative w-full h-[28rem] bg-white/50 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 overflow-hidden group">
              
              <button 
                type="button" 
                onClick={handleCapture} 
                className="absolute top-6 left-6 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm ring-1 ring-slate-900/5 transition-all text-slate-500 hover:text-emerald-600" 
                title="Capture Image"
              >
                <Camera size={20} />
              </button>

              <button type="button" onClick={() => setShowControls(!showControls)} className={`absolute bottom-6 right-6 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm ring-1 ring-slate-900/5 transition-all ${showControls ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 bg-emerald-50/90'}`} title={showControls ? "Hide Controls" : "Show Controls"}>
                {showControls ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                )}
              </button>

              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm ring-1 ring-slate-900/5 z-10 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'}`}>
                <button type="button" onClick={() => setPanX(p => Math.max(-30, p - 2))} className="text-slate-500 hover:text-emerald-600 transition-colors p-1" title="Move Left"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg></button>
                <input type="range" min="-30" max="30" value={panX} onChange={(e) => setPanX(Number(e.target.value))} className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:rounded-full" />
                <button type="button" onClick={() => setPanX(p => Math.min(30, p + 2))} className="text-slate-500 hover:text-emerald-600 transition-colors p-1" title="Move Right"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg></button>
              </div>
              
              <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-white/80 backdrop-blur-md px-2 py-4 rounded-full shadow-sm ring-1 ring-slate-900/5 z-10 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-x-0 visible' : 'opacity-0 translate-x-4 invisible pointer-events-none'}`}>
                <button type="button" onClick={() => setPanY(p => Math.min(30, p + 2))} className="text-slate-500 hover:text-emerald-600 transition-colors p-1 z-10" title="Move Up"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg></button>
                <div className="relative w-4 h-24 sm:h-32 flex items-center justify-center my-2">
                  <input type="range" min="-30" max="30" value={panY} onChange={(e) => setPanY(Number(e.target.value))} className="absolute w-24 sm:w-32 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer -rotate-90 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:rounded-full" />
                </div>
                <button type="button" onClick={() => setPanY(p => Math.max(-30, p - 2))} className="text-slate-500 hover:text-emerald-600 transition-colors p-1 z-10" title="Move Down"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg></button>
              </div>

              <Canvas id="tree-preview-canvas" shadows dpr={[2, 4]} gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: [50, 75, 65], zoom: 4.8 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
                <Environment preset="city" />
                <group rotation={[0, Date.now() * 0.0005, 0]}>
                  {previewVoxels.map((v, i) => <AnimatedVoxel key={`preview-${i}`} v={v} shape={voxelShape} />)}
                </group>
                <OrbitControls 
                  enablePan={false} 
                  enableZoom={true} 
                  enableRotate={true} 
                  autoRotate 
                  autoRotateSpeed={1.5} 
                  target={[-panX, -panY + 15, 0]} 
                />
              </Canvas>
            </div>

            <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Botanical Species</label>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 custom-slim-scrollbar">
                  {Object.entries(TREE_THEMES).map(([id, theme]) => {
                    const isActive = treeType === id;
                    return (
                      <button
                        key={id} 
                        type="button" 
                        onClick={() => setTreeType(id)}
                        style={isActive ? { 
                          borderColor: theme.leaf[0], 
                          backgroundColor: `${theme.leaf[0]}15`, 
                          color: theme.leaf[0] 
                        } : {}}
                        className={`flex-1 min-w-[130px] py-4 rounded-2xl transition-all flex flex-col items-center gap-3 border-2 ${
                          isActive 
                            ? 'shadow-md -translate-y-1' 
                            : 'bg-white border-transparent ring-1 ring-slate-900/5 text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: theme.leaf[0] }}></div>
                          {theme.flower && (
                             <div className="w-6 h-6 rounded-full shadow-inner border-2 border-white -ml-2" style={{ backgroundColor: theme.flower[0] }}></div>
                          )}
                        </div>
                        <span className="font-medium text-xs capitalize text-center px-2">{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Particle Shape</label>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 custom-slim-scrollbar">
                  {[
                    { id: 'cube', name: 'Voxel Cube' },
                    { id: 'sphere', name: 'Smooth Sphere' },
                    { id: 'hexagon', name: 'Hexagon Tile' },
                    { id: 'diamond', name: 'Crystal Diamond' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setVoxelShape(shape.id)}
                      className={`flex-1 min-w-[110px] py-3 rounded-2xl transition-all border-2 font-medium text-xs tracking-wide ${
                        voxelShape === shape.id 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md -translate-y-1' 
                          : 'bg-white border-transparent ring-1 ring-slate-900/5 text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'
                      }`}
                    >
                      {shape.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Destination Link</label>
                <input type="url" required placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Custom URL Slug (Optional)</label>
                <div className="flex rounded-2xl shadow-sm ring-1 ring-slate-900/5 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                  <span className="flex items-center pl-5 pr-2 text-slate-400 bg-slate-50/50 select-none border-r border-slate-100 text-sm font-medium">/qr/</span>
                  <input type="text" placeholder="my-awesome-link" value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} className="w-full px-5 py-4 focus:outline-none text-slate-700 bg-transparent transition-all" />
                </div>
                {slugError ? (
                  <div className="mt-3 ml-2 animate-[fadeIn_0.2s_ease-out]">
                    <p className="text-sm text-red-500 font-medium mb-2">{slugError}</p>
                    <p className="text-xs text-slate-500 mb-2">Try one of these available links instead:</p>
                    <div className="flex gap-2 flex-wrap">
                      {slugSuggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => setCustomSlug(suggestion)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors shadow-sm">{suggestion}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2 ml-2">Leave blank to let nature generate a random ID.</p>
                )}
              </div>
              <button disabled={loading || !url} className="w-full bg-slate-900 text-white font-medium py-5 rounded-2xl hover:bg-slate-800 hover:shadow-xl transition-all disabled:opacity-50 mt-4">
                {loading ? 'Cultivating...' : 'Grow Interactive Code'}
              </button>
            </form>

            {recentlyCreated && (
              <div ref={resultRef} className="scroll-mt-8 max-w-md mx-auto bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 text-center animate-[fadeIn_0.5s_ease-out]">
                <h3 className="font-serif text-2xl text-emerald-900 mb-2">{recentlyCreated.title} is ready.</h3>
                <p className="text-slate-500 text-sm mb-6">Scan to interact, or share the link below.</p>
                <img src={recentlyCreated.img} alt="Colored QR" className="w-48 h-48 mx-auto mb-6 rounded-xl shadow-sm" />
                
                <div className="flex items-center justify-center gap-2 mb-6 w-full px-4 overflow-hidden">
                  <a href={recentlyCreated.link} target="_blank" rel="noreferrer" className="text-emerald-600 font-medium hover:underline truncate">{recentlyCreated.link}</a>
                  <button onClick={copyToClipboard} className="text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 p-2 rounded-lg shrink-0">
                    {linkCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button onClick={handleShareRecentlyCreated} className="flex-1 py-3 font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Share2 size={18} /> Share
                    </button>
                    <a href={recentlyCreated.img} download="voxly-tree.png" className="flex-1 py-3 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md block text-center flex items-center justify-center gap-2">
                      <Download size={18} /> Save Image
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* THE GARDEN GRID RESTORED PERFECTLY */}
        {activeTab === 'links' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {myLinks.length === 0 ? (
               <div className="text-center py-20 text-slate-400 font-medium">Your garden is currently empty.</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {myLinks.map((qr) => {
                  
                  const PREVIEW_IMAGES = {
                    cherryblossom: "https://images.unsplash.com/photo-McsNra2VRQQ?auto=format&fit=crop&w=600&q=80",
                    pine: "https://images.unsplash.com/photo-ojFeqwArP2Y?auto=format&fit=crop&w=600&q=80",
                    socotradragon: "https://images.unsplash.com/photo-siq3xkHUhSg?auto=format&fit=crop&w=600&q=80",
                    maple: "https://images.unsplash.com/photo-gpviBaY_E_A?auto=format&fit=crop&w=600&q=80",
                    juniper: "https://images.unsplash.com/photo-BjK9FvgB3K8?auto=format&fit=crop&w=600&q=80",
                    baobab: "https://images.unsplash.com/photo-rbO3N8m7Ka4?auto=format&fit=crop&w=600&q=80",
                    weepingwillow: "https://images.unsplash.com/photo-LBZiGuxxe-8?auto=format&fit=crop&w=600&q=80",
                    pricklypearcactus: "https://images.unsplash.com/photo-6ZeLo8O7lU0?auto=format&fit=crop&w=600&q=80",
                    southernmagnolia: "https://images.unsplash.com/photo-p0wSelMmRtI?auto=format&fit=crop&w=600&q=80",
                    default: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80"
                  };

                  const previewSrc = qr.previewImage || PREVIEW_IMAGES[qr.treeType] || PREVIEW_IMAGES.default;
                  const publicUrl = `${window.location.origin}/qr/${qr.slug || qr.id}`;

                  return (
                    <div 
                      key={qr.id} 
                      className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 ring-1 ring-slate-900/5 flex flex-col"
                    >
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                        <img 
                          src={previewSrc} 
                          alt={qr.title} 
                          className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 ${qr.previewImage ? 'object-contain scale-125 pt-4' : 'object-cover'}`} 
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>

                        <a 
                          href={publicUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          title="Visit 3D Tree"
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-600 p-3 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white hover:scale-110 active:scale-95 transition-all ring-1 ring-black/5 z-10"
                        >
                          <ExternalLink size={18} strokeWidth={2.5} />
                        </a>

                        <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm capitalize tracking-wide flex items-center gap-1.5 pointer-events-none">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          {TREE_THEMES[qr.treeType]?.name || qr.treeType}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow bg-white">
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-1 truncate">{qr.title}</h3>
                        
                        <div className="flex items-center gap-2 text-slate-500 mb-6">
                           <LinkIcon size={14} className="flex-shrink-0" />
                           <p className="text-sm truncate">{qr.destinationUrl}</p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-4 px-4 py-3 bg-slate-50 rounded-2xl ring-1 ring-slate-900/5">
                             <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scans</span>
                                <span className="text-lg font-bold text-emerald-700">{qr.clicks || 0}</span>
                             </div>
                             <div className="h-8 w-px bg-slate-200"></div>
                             <div className="flex flex-col text-right">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planted</span>
                                <span className="text-sm font-medium text-slate-600">
                                   {qr.createdAt?.toDate ? qr.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </span>
                             </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={async () => {
                                  const theme = TREE_THEMES[qr.treeType] || TREE_THEMES.cherryblossom;
                                  const imgUrl = await generateCustomQR(publicUrl, theme, qr.voxelShape || 'cube');
                                  setSelectedQrForModal({ title: qr.title, qrImgUrl: imgUrl, publicUrl });
                                }} 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors ring-1 ring-slate-200 hover:ring-emerald-200"
                              >
                                <QrCode size={16} /> QR Code
                              </button>
                              
                              <button 
                                onClick={() => navigator.clipboard.writeText(publicUrl)} 
                                title="Copy Link"
                                className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors ring-1 ring-slate-200 hover:ring-emerald-200"
                              >
                                <Copy size={18} />
                              </button>
                            </div>

                            <button 
                              onClick={() => setLinkToDelete(qr.id)} 
                              title="Delete Tree"
                              className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ring-1 ring-slate-200 hover:ring-red-200"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full pb-8 text-center mt-auto">
        <p className="text-sm text-slate-400 font-medium">
          Crafted by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">Shovith</a>
        </p>
      </footer>
    </div>
  );
}
