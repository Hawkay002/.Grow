import React, { useMemo } from 'react';
import { generateOrganicTree } from './VoxelEngine';

export default function Pine({ qrData, qrSize }) {
  const voxels = useMemo(() => {
    if (!qrData) return [];
    return generateOrganicTree({
      qrSize, qrData,
      colors: {
        baseDark: '#84cc16', baseLight: '#f4f4f5', trunk: '#291002',
        leaf: ['#15803d', '#166534', '#22c55e', '#14532d']
      },
      branchAngles: { spread: Math.PI * 0.8, lift: Math.PI * 0.1 }, // Sharp upward lift
      leafDensity: 0.85, 
      maxDepth: 4 // More branches for a taller look
    });
  }, [qrData, qrSize]);

  return (
    <group>
      {voxels.map((v, i) => (
        <mesh key={i} position={v.pos} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={v.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
