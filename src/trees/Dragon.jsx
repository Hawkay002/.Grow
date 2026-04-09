import React, { useMemo } from 'react';
import { generateOrganicTree } from './VoxelEngine';

export default function Dragon({ qrData, qrSize }) {
  const voxels = useMemo(() => {
    if (!qrData) return [];
    return generateOrganicTree({
      qrSize, qrData,
      colors: {
        baseDark: '#84cc16', baseLight: '#f4f4f5', trunk: '#78350f',
        leaf: ['#a3e635', '#84cc16', '#bef264', '#65a30d']
      },
      branchAngles: { spread: Math.PI * 1.8, lift: Math.PI * 0.7 }, // Very wide, almost flat
      leafDensity: 0.9, 
      maxDepth: 2 // Short branch depth creates the flat umbrella canopy
    });
  }, [qrData, qrSize]);

  return (
    <group>
      {voxels.map((v, i) => (
        <mesh key={i} position={v.pos} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={v.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
