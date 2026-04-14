import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
// ADDED: updateDoc and increment for the analytics counter
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree, TREE_THEMES } from '../trees/VoxelEngine';
import { Box, QrCode, ChevronRight } from 'lucide-react';

function CameraController({ viewMode, controlsRef }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevMode = useRef(viewMode);

  useEffect(() => {
    if (prevMode.current !== viewMode) {
       setIsTransitioning(true);
       prevMode.current = viewMode;
    }
  }, [viewMode]);

  useFrame((state) => {
    if (!controlsRef.current) return;

    if (viewMode === 'qr') {
      state.camera.position.lerp(new THREE.Vector3(0, 100, 15), 0.08);
      state.camera.up.lerp(new THREE.Vector3(0, 0, -1), 0.08);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 15), 0.08);
    } 
    else if (isTransitioning) {
      state.camera.position.lerp(new THREE.Vector3(45, 75, 45), 0.1);
      state.camera.up.lerp(new THREE.Vector3(0, 1, 0), 0.1);
      controlsRef.current.target.lerp(new THREE.Vector3(0, -12, 0), 0.1);

      if (state.camera.position.distanceTo(new THREE.Vector3(45, 75, 45)) < 1) {
         setIsTransitioning(false);
      }
    }
  });
  return null;
}

function SpinningGroup({ viewMode, children }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (viewMode === 'tree') {
      groupRef.current.rotation.y += delta * 0.15; 
    } else {
      const currentRot = groupRef.current.rotation.y;
      const targetRot = Math.round(currentRot / (Math.PI * 2)) * (Math.PI * 2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot, 0.08);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function AnimatedVoxel({ v, viewMode }) {
  const materialRef = useRef();
  const targetColor = useMemo(() => new THREE.Color(), []);
  const black = useMemo(() => new THREE.Color('#000000'), []);

  useFrame(() => {
    if (!materialRef.current) return;
    const targetHex = viewMode === 'qr' ? v.qrColor : v.color;
    targetColor.set(targetHex);
    materialRef.current.color.lerp(targetColor, 0.1);

    if (viewMode === 'qr' || v.isBase) {
      materialRef.current.emissive.lerp(targetColor, 0.1);
    } else {
      materialRef.current.emissive.lerp(black, 0.1);
    }
  });

  return (
    <mesh position={v.pos} scale={v.scale || 1} castShadow={!v.isBase} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial ref={materialRef} color={v.color} roughness={0.9} />
    </mesh>
  );
}

export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); 
  const controlsRef = useRef();

  useEffect(() => {
    async function loadData() {
      const docRef = doc(db, 'qrs', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      setData(docSnap.data());

      // NEW: Increment the click counter every time the tree is viewed!
      try {
        await updateDoc(docRef, {
          clicks: increment(1) 
        });
      } catch (err) {
        console.warn("Could not increment analytics", err);
      }
    }
    loadData();
  }, [id]);

  const voxels = useMemo(() => {
    if (!data) return [];
    const matrix = QRCode.create(data.destinationUrl, { errorCorrectionLevel: 'M' });
    return generateTree(data.treeType, matrix.modules.data, matrix.modules.size);
  }, [data]);

  const bounceAnimationCSS = `
    @keyframes bounce-horizontal {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(4px); }
    }
    .animate-bounce-horizontal {
      animation: bounce-horizontal 1s ease-in-out infinite;
    }
    .font-aestera {
      font-family: 'Aestera', Georgia, serif;
    }
  `;

  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-serif text-2xl text-slate-400">Growing...</div>;

  return (
    <div className="relative w-screen h-screen bg-slate-50 overflow-hidden font-sans">
      <style>{bounceAnimationCSS}</style>

      <div className="absolute top-8 left-0 w-full flex justify-center pointer-events-none z-20 px-6 animate-[fadeInUp_0.5s_ease-out]">
        <a href="https://grow-voxly.vercel.app" target="_blank" rel="noreferrer"
          className="pointer-events-auto px-6 py-3 bg-white/80 backdrop-blur-md text-emerald-800 border border-emerald-100 rounded-full text-xs font-serif font-bold shadow-sm hover:bg-white hover:text-emerald-900 hover:shadow-md transition-all">
          Grow your own trees on Grow-Voxly ✨
        </a>
      </div>
      
      <Canvas shadows>
        <OrthographicCamera makeDefault position={[45, 75, 45]} zoom={8} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />
        
        <CameraController viewMode={viewMode} controlsRef={controlsRef} />
        
        <SpinningGroup viewMode={viewMode}>
          {voxels.map((v, i) => (
            <AnimatedVoxel key={`voxel-${i}`} v={v} viewMode={viewMode} />
          ))}
        </SpinningGroup>
        
        <OrbitControls 
          ref={controlsRef}
          enableZoom={true} 
          enablePan={true} 
          target={[0, -12, 0]} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>

      <div className="absolute bottom-10 sm:bottom-16 left-0 w-full flex flex-col items-center pointer-events-none z-10 px-6 pb-6">
        
        <h2 className="font-aestera text-3xl sm:text-4xl text-slate-800 mb-4 capitalize tracking-wide font-normal drop-shadow-md">
          {TREE_THEMES[data.treeType]?.name || 'Botanical Species'}
        </h2>

        <div className="mb-6 pointer-events-auto flex bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm ring-1 ring-slate-900/5">
          <button onClick={() => setViewMode('tree')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'tree' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            <Box size={16} /> Free Roam
          </button>
          <button onClick={() => setViewMode('qr')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'qr' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            <QrCode size={16} /> Top-Down Scan
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 text-center pointer-events-auto max-w-sm w-full">
          <h2 className="font-serif text-2xl text-slate-800 mb-6">Link Discovered</h2>
          <a href={data.destinationUrl} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-medium py-4 rounded-2xl hover:bg-slate-700 hover:shadow-xl active:scale-[0.98] transition-all duration-200 group">
            Continue to Destination
            <ChevronRight size={20} className="animate-bounce-horizontal text-emerald-400" />
          </a>
        </div>
      </div>

      {/* SCANNER FOOTER */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 w-full text-center z-30 pointer-events-none">
        <p className="text-xs text-slate-400 font-medium pointer-events-auto backdrop-blur-md bg-white/30 inline-block px-3 py-1 rounded-full shadow-sm ring-1 ring-slate-900/5">
          Crafted by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline transition-colors">Shovith</a>
        </p>
      </div>

    </div>
  );
}
