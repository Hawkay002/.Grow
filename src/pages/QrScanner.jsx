import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { generateTree } from '../trees/VoxelEngine';

function CameraController({ viewMode }) {
  useFrame((state) => {
    const targetPosition = viewMode === 'qr' 
      ? new THREE.Vector3(0, 100, 0) 
      : new THREE.Vector3(50, 60, 50); 

    state.camera.position.lerp(targetPosition, 0.08);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function SpinningGroup({ viewMode, children }) {
  const [rotation, setRotation] = useState(0);
  
  useFrame((state, delta) => {
    if (viewMode === 'tree') {
      setRotation((prev) => prev + delta * 0.5);
    } else {
      setRotation(0);
    }
  });

  return <group rotation={[0, rotation, 0]}>{children}</group>;
}

export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); 

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
        <CameraController viewMode={viewMode} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />
        
        <SpinningGroup viewMode={viewMode}>
          {voxels.map((v, i) => (
            <mesh key={i} position={v.pos} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={v.color} roughness={0.9} />
            </mesh>
          ))}
        </SpinningGroup>
        
        <OrbitControls enableZoom={true} enableRotate={viewMode === 'tree'} target={[0, 5, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>

      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center pointer-events-none z-10 px-6">
        
        <div className="mb-6 pointer-events-auto flex bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm ring-1 ring-slate-900/5">
          <button onClick={() => setViewMode('tree')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'tree' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            3D Canvas
          </button>
          <button onClick={() => setViewMode('qr')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'qr' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            2D Code
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
