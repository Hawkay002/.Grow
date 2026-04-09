import React, { useEffect, useState } from 'react';
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
  
  // Theme Colors (Now using arrays for leaf color variation!)
  const COLORS = {
    baseDark: '#84cc16', // Grass green
    baseLight: '#f4f4f5', // Path white
    cherry: { 
      trunk: '#451a03', 
      leaf: ['#f472b6', '#db2777', '#fbcfe8', '#be185d'] // Pinks: standard, dark, pale, deep
    },
    pine: { 
      trunk: '#291002', 
      leaf: ['#15803d', '#166534', '#22c55e', '#14532d'] // Greens: standard, dark, bright, deep
    },
    dragon: { 
      trunk: '#78350f', 
      leaf: ['#a3e635', '#84cc16', '#bef264', '#65a30d'] // Yellow-greens
    },
    maple: { 
      trunk: '#451a03', 
      leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412'] // Oranges
    },
    juniper: { 
      trunk: '#1c1917', 
      leaf: ['#065f46', '#047857', '#059669', '#064e3b'] // Teals
    }
  };

  const theme = COLORS[treeType === 'cherryblossom' ? 'cherry' : treeType];
  
  // Helper to pick a random shade for the leaves
  const getRandomLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];

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
  const scaleRatio = Math.max(1, size / 21);
  const trunkHeight = Math.floor(5 * scaleRatio); // Slightly taller to match thicker base
  
  // Generate Thicker Trunk
  for (let y = 1; y <= trunkHeight; y++) {
    voxels.push({ pos: [0, y, 0], color: theme.trunk }); // Center core
    
    // Thicken the bottom half of the trunk to create "roots" and weight
    if (y < trunkHeight - 1) {
      voxels.push({ pos: [1, y, 0], color: theme.trunk });
      voxels.push({ pos: [-1, y, 0], color: theme.trunk });
      voxels.push({ pos: [0, y, 1], color: theme.trunk });
      voxels.push({ pos: [0, y, -1], color: theme.trunk });
      
      // If it's a larger QR, make the base a full 3x3 block
      if (scaleRatio > 1.2 && y < trunkHeight - 2) {
         voxels.push({ pos: [1, y, 1], color: theme.trunk });
         voxels.push({ pos: [-1, y, -1], color: theme.trunk });
         voxels.push({ pos: [1, y, -1], color: theme.trunk });
         voxels.push({ pos: [-1, y, 1], color: theme.trunk });
      }
    }
  }

  // 3. Procedural Canopies (With Gaps and Color Variance)
  const canopyBaseY = trunkHeight;
  const GAP_CHANCE = 0.25; // 25% chance a leaf is missing to create air gaps
  
  if (treeType === 'cherryblossom' || treeType === 'maple') {
    const radius = Math.floor(4.5 * scaleRatio);
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + y*y + z*z) <= radius + (Math.random()*0.5)) {
            // Apply Gap Chance
            if (Math.random() > GAP_CHANCE) {
              voxels.push({ pos: [x, y + canopyBaseY + 2, z], color: getRandomLeafColor() });
            }
          }
        }
      }
    }
  } 
  
  else if (treeType === 'pine') {
    const height = Math.floor(8 * scaleRatio);
    for (let y = 0; y < height; y++) {
      const radius = Math.max(0, Math.floor(height/1.5) - y);
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.abs(x) + Math.abs(z) <= radius + (Math.random()*0.5)) {
            if (Math.random() > GAP_CHANCE) {
              voxels.push({ pos: [x, y + canopyBaseY, z], color: getRandomLeafColor() });
            }
          }
        }
      }
    }
  }

  else if (treeType === 'dragon') {
    const radius = Math.floor(5.5 * scaleRatio);
    for (let x = -radius; x <= radius; x++) {
      for (let y = 0; y <= 2; y++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + z*z) <= radius - y) {
             // Less gaps for dragon tree to keep its umbrella shape solid
            if (Math.random() > 0.15) {
              voxels.push({ pos: [x, y + canopyBaseY + 1, z], color: getRandomLeafColor() });
            }
          }
        }
      }
    }
  }

  else if (treeType === 'juniper') {
    const height = Math.floor(7 * scaleRatio);
    for (let y = 0; y < height; y++) {
      const xOffset = Math.sin(y) * 2;
      const zOffset = Math.cos(y) * 2;
      const radius = 2.5 * scaleRatio;
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x*x + z*z) <= radius) {
            // High gap chance for a wild, twisty look
            if (Math.random() > 0.35) {
              voxels.push({ pos: [Math.round(x + xOffset), y + canopyBaseY, Math.round(z + zOffset)], color: getRandomLeafColor() });
            }
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
        const docSnap = await getDoc(doc(db, 'qrs', id));
        if (!docSnap.exists()) {
          setError("Link not found.");
          return;
        }
        
        const dbData = docSnap.data();
        setData(dbData);

        const qrMatrix = QRCode.create(dbData.destinationUrl, { errorCorrectionLevel: 'M' });
        const sceneVoxels = generateVoxelScene(qrMatrix.modules.data, qrMatrix.modules.size, dbData.treeType);
        setVoxels(sceneVoxels);

      } catch (err) {
        console.error(err);
        setError("Error loading 3D scene.");
      }
    }
    loadData();
  }, [id]);

  if (error) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl text-red-500 bg-[#f4f4f5]">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl animate-pulse text-brand-dark bg-[#f4f4f5]">Planting...</div>;

  return (
    <div className="relative w-screen h-screen bg-[#f4f4f5] overflow-hidden">
      
      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={12} />
        <OrbitControls enablePan={false} enableZoom={true} maxZoom={40} minZoom={5} autoRotate autoRotateSpeed={1.0} />
        <Environment preset="city" />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

        <motion.group
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, mass: 1.2 }}
        >
          {voxels.map((v, i) => (
            <mesh key={i} position={v.pos}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={v.color} roughness={0.9} metalness={0.1} />
            </mesh>
          ))}
        </motion.group>
      </Canvas>

      {/* Brutalist UI Overlay */}
      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border-4 border-brand-dark text-center pointer-events-auto mx-4 max-w-sm w-full transform transition-transform hover:scale-105">
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
