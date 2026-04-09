import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import QRCode from 'qrcode';

// --- Procedural Voxel Math ---
function generateVoxelScene(qrModules, size, treeType) {
  const voxels = [];
  const center = Math.floor(size / 2);
  
  // Theme Colors
  const COLORS = {
    baseDark: '#84cc16', // Grass green
    baseLight: '#f4f4f5', // Path white
    cherry: { trunk: '#78350f', leaf: '#f472b6' },
    pine: { trunk: '#451a03', leaf: '#15803d' },
    dragon: { trunk: '#78350f', leaf: '#a3e635' },
    maple: { trunk: '#451a03', leaf: '#ea580c' },
    juniper: { trunk: '#1c1917', leaf: '#065f46' }
  };

  const theme = COLORS[treeType === 'cherryblossom' ? 'cherry' : treeType];

  // 1. Generate QR Base
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isDark = qrModules[row * size + col];
      const x = col - center;
      const z = row - center;
      voxels.push({ pos: [x, 0, z], color: isDark ? COLORS.baseDark : COLORS.baseLight });
    }
  }

  // 2. Tree Math based on QR Scale
  const scaleRatio = Math.max(1, size / 21); // Normalizes against smallest QR
  const trunkHeight = Math.floor(4 * scaleRatio);
  
  // Generate Trunk
  for (let y = 1; y <= trunkHeight; y++) {
    voxels.push({ pos: [0, y, 0], color: theme.trunk });
    // Thicken trunk for larger codes
    if (scaleRatio > 1.2 && y < trunkHeight - 1) {
      voxels.push({ pos: [1, y, 0], color: theme.trunk });
      voxels.push({ pos: [-1, y, 0], color: theme.trunk });
      voxels.push({ pos: [0, y, 1], color: theme.trunk });
      voxels.push({ pos: [0, y, -1], color: theme.trunk });
    }
  }

  // 3. Procedural Canopies
  const canopyBaseY = trunkHeight;
  
  if (treeType === 'cherryblossom' || treeType === 'maple') {
    const radius = Math.floor(4 * scaleRatio);
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + y*y + z*z) <= radius + (Math.random()*0.5)) {
            voxels.push({ pos: [x, y + canopyBaseY + 2, z], color: theme.leaf });
          }
        }
      }
    }
  } 
  
  else if (treeType === 'pine') {
    const height = Math.floor(7 * scaleRatio);
    for (let y = 0; y < height; y++) {
      const radius = Math.max(0, Math.floor(height/1.5) - y);
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.abs(x) + Math.abs(z) <= radius + (Math.random()*0.5)) {
            voxels.push({ pos: [x, y + canopyBaseY, z], color: theme.leaf });
          }
        }
      }
    }
  }

  else if (treeType === 'dragon') {
    const radius = Math.floor(5 * scaleRatio);
    for (let x = -radius; x <= radius; x++) {
      for (let y = 0; y <= 2; y++) { // Flat bottom, shallow top
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + z*z) <= radius - y) {
            voxels.push({ pos: [x, y + canopyBaseY + 1, z], color: theme.leaf });
          }
        }
      }
    }
  }

  else if (treeType === 'juniper') {
    const height = Math.floor(6 * scaleRatio);
    for (let y = 0; y < height; y++) {
      const xOffset = Math.sin(y) * 2;
      const zOffset = Math.cos(y) * 2;
      const radius = 2 * scaleRatio;
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + z*z) <= radius && Math.random() > 0.3) {
            voxels.push({ pos: [Math.round(x + xOffset), y + canopyBaseY, Math.round(z + zOffset)], color: theme.leaf });
          }
        }
      }
    }
  }

  return voxels;
}

// --- React Component ---
export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [voxels, setVoxels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch Link Data
        const docSnap = await getDoc(doc(db, 'qrs', id));
        if (!docSnap.exists()) {
          setError("Link not found.");
          return;
        }
        
        const dbData = docSnap.data();
        setData(dbData);

        // 2. Generate QR Matrix for Base Mapping
        const qrMatrix = QRCode.create(dbData.destinationUrl, { errorCorrectionLevel: 'M' });
        
        // 3. Calculate 3D Scene
        const sceneVoxels = generateVoxelScene(qrMatrix.modules.data, qrMatrix.modules.size, dbData.treeType);
        setVoxels(sceneVoxels);

      } catch (err) {
        console.error(err);
        setError("Error loading 3D scene.");
      }
    }
    loadData();
  }, [id]);

  if (error) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl text-red-500">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl animate-pulse text-brand-dark">Planting...</div>;

  return (
    <div className="relative w-screen h-screen bg-[#f4f4f5] overflow-hidden">
      
      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        {/* Isometric Setup */}
        <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={15} />
        <OrbitControls enablePan={false} enableZoom={true} maxZoom={40} minZoom={5} autoRotate autoRotateSpeed={1.5} />
        <Environment preset="city" />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

        {/* Animated Wrapper for the entire tree */}
        <motion.group
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, mass: 1.2 }}
        >
          {voxels.map((v, i) => (
            <mesh key={i} position={v.pos}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={v.color} roughness={0.8} />
            </mesh>
          ))}
        </motion.group>
      </Canvas>

      {/* Brutalist UI Overlay */}
      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border-4 border-brand-dark text-center pointer-events-auto mx-4 max-w-sm w-full transform transition-transform hover:scale-105">
          <h2 className="font-display font-black text-xl uppercase mb-4 text-brand-dark tracking-tight">Destination Unlocked</h2>
          <a 
            href={data.destinationUrl}
            className="block w-full bg-brand-pop text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            Enter Link
          </a>
        </div>
      </div>
    </div>
  );
}
