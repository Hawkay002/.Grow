import React, { useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import QRCode from 'qrcode';
import * as THREE from 'three';

// Import our trees
import CherryBlossom from '../trees/CherryBlossom';
import Pine from '../trees/Pine';
import Maple from '../trees/Maple';
import Dragon from '../trees/Dragon';
import Juniper from '../trees/Juniper';

// Helper component to animate the camera smoothly
function CameraRig({ isTopDown }) {
  useFrame((state) => {
    // Determine the target camera position based on the toggle state
    const targetPos = isTopDown 
      ? new THREE.Vector3(0, 100, 0) // Looking straight down
      : new THREE.Vector3(50, 50, 50); // Standard isometric angle

    // Smoothly interpolate the camera position
    state.camera.position.lerp(targetPos, 0.08);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Helper component to spin the scene unless it's top-down
function SpinningScene({ isTopDown, children }) {
  const [rotation, setRotation] = useState(0);
  
  useFrame((state, delta) => {
    if (!isTopDown) {
      setRotation((prev) => prev + delta * 0.5); // Spin speed
    } else {
      // Snap to 0 rotation so the QR code is perfectly straight and readable
      setRotation(0); 
    }
  });

  return <group rotation={[0, rotation, 0]}>{children}</group>;
}

export default function TreePreview({ url, treeType }) {
  const [isTopDown, setIsTopDown] = useState(false);

  // Dynamically generate the QR matrix based on what the user is currently typing
  const qrMatrix = useMemo(() => {
    const dataString = url || "https://vox.ly"; // Fallback so a tree always shows
    return QRCode.create(dataString, { errorCorrectionLevel: 'M' });
  }, [url]);

  const TreeComponent = {
    cherryblossom: CherryBlossom,
    pine: Pine,
    maple: Maple,
    dragon: Dragon,
    juniper: Juniper
  }[treeType] || CherryBlossom;

  return (
    <div 
      className="w-full h-80 bg-[#e5e5e5] border-8 border-brand-dark cursor-pointer relative overflow-hidden group shadow-[8px_8px_0px_rgba(26,26,26,1)] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0px_rgba(26,26,26,1)]"
      onClick={() => setIsTopDown(!isTopDown)}
    >
      {/* UI Hint */}
      <div className="absolute top-4 right-4 z-10 bg-white border-4 border-brand-dark px-4 py-2 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_rgba(26,26,26,1)] group-hover:bg-brand-pop group-hover:text-white transition-colors">
        {isTopDown ? "Click to Spin" : "Click for Top View"}
      </div>

      <Canvas shadows>
        <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={12} />
        <CameraRig isTopDown={isTopDown} />
        <Environment preset="city" />
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />

        {/* Deep Ground Shadow to contrast the bright trees */}
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.6} far={20} color="#000000" />

        <SpinningScene isTopDown={isTopDown}>
          {/* Framer Motion key forces a re-mount animation every time the treeType changes */}
          <motion.group 
            key={treeType}
            initial={{ scale: 0, y: -20 }} 
            animate={{ scale: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 100, damping: 12, mass: 1.2 }}
          >
            <TreeComponent qrData={qrMatrix.modules.data} qrSize={qrMatrix.modules.size} />
          </motion.group>
        </SpinningScene>
      </Canvas>
    </div>
  );
}
