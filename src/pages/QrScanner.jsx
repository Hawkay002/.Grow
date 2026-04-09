import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree } from '../trees/VoxelEngine';

function CameraController({ viewMode, controlsRef }) {
  useFrame((state) => {
    if (!controlsRef.current) return;

    if (viewMode === 'qr') {
      // Swoop camera to top-down view for structural scanning
      state.camera.position.lerp(new THREE.Vector3(0, 100, 0), 0.08);
      state.camera.up.lerp(new THREE.Vector3(0, 0, -1), 0.08); // Prevents the diamond twist
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
      controlsRef.current.autoRotate = false; // Stop spinning so they can scan it!
    } else {
      // Revert UP vector, but DO NOT force position. 
      // This allows the user to freely drag the tree without it fighting back!
      state.camera.up.lerp(new THREE.Vector3(0, 1, 0), 0.08);
      controlsRef.current.autoRotate = true; // Resume native majestic spinning
    }
  });
  return null;
}

export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); 
  const controlsRef = useRef();

  useEffect(() => {
    async function loadData() {
      const docSnap = await getDoc(doc(db, 'qrs', id));
      if (!docSnap.exists()) return;
      setData(docSnap.data());
    }
    loadData();
  }, [id]);

  const voxels = useMemo(() => {
    if (!data) return [];
    const matrix = QRCode.create(data.destinationUrl, { errorCorrectionLevel: 'M' });
    return generateTree(data.treeType, matrix.modules.data, matrix.modules.size);
  }, [data]);

  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-serif text-2xl text-slate-400">Growing...</div>;

  return (
    <div className="relative w-screen h-screen bg-slate-50 overflow-hidden font-sans">
      
      <Canvas shadows>
        <OrthographicCamera makeDefault position={[50, 60, 50]} zoom={8} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />
        
        <CameraController viewMode={viewMode} controlsRef={controlsRef} />
        
        <group>
          {voxels.map((v, i) => (
            <mesh key={`voxel-${i}`} position={v.pos} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={v.color} roughness={0.9} />
            </mesh>
          ))}
        </group>
        
        <OrbitControls 
          ref={controlsRef}
          enableZoom={true} 
          enablePan={true} // User requested absolute free movement
          autoRotateSpeed={1.0} 
          target={[0, 5, 0]} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>

      <div className="absolute bottom-20 left-0 w-full flex flex-col items-center pointer-events-none z-10 px-6">
        
        <a href="https://grow-voxly.vercel.app" target="_blank" rel="noreferrer"
          className="pointer-events-auto mb-4 px-5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-emerald-100 hover:shadow-md transition-all">
          Grow your own on Vox.ly ✨
        </a>

        <div className="mb-6 pointer-events-auto flex bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm ring-1 ring-slate-900/5">
          <button onClick={() => setViewMode('tree')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'tree' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            Free Roam
          </button>
          <button onClick={() => setViewMode('qr')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'qr' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            Top-Down Scan
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 text-center pointer-events-auto max-w-sm w-full">
          <h2 className="font-serif text-2xl text-slate-800 mb-6">Link Discovered</h2>
          <a href={data.destinationUrl} className="block w-full bg-slate-900 text-white font-medium py-4 rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Continue to Destination
          </a>
        </div>
      </div>
    </div>
  );
}
