import React, { useMemo } from 'react';
import { generateOrganicTree } from './VoxelEngine';

export default function CherryBlossom({ qrData, qrSize }) {
  
  // useMemo ensures we only calculate this heavy math once when the QR data changes
  const voxels = useMemo(() => {
    if (!qrData) return [];

    const treeDNA = {
      colors: {
        baseDark: '#84cc16', 
        baseLight: '#f4f4f5',
        trunk: '#451a03', 
        // 4 shades of pink for depth
        leaf: ['#f472b6', '#db2777', '#fbcfe8', '#be185d'] 
      },
      branchAngles: {
        spread: Math.PI * 1.5, // How wide the branches split out
        lift: Math.PI * 0.4    // How much they lean outward vs straight up
      },
      leafDensity: 0.65, // 65% solid, 35% empty air gaps via noise
      maxDepth: 3        // Trunk -> Primary Limbs -> Secondary Limbs -> Leaves
    };

    return generateOrganicTree({
      qrSize,
      qrData,
      ...treeDNA
    });
  }, [qrData, qrSize]);

  return (
    <group>
      {voxels.map((v, i) => (
        <mesh key={i} position={v.pos} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={v.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
