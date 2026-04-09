import React, { useMemo } from 'react';
import { generateOrganicTree } from './VoxelEngine';

export default function Maple({ qrData, qrSize }) {
  const voxels = useMemo(() => {
    if (!qrData) return [];
    return generateOrganicTree({
      qrSize, qrData,
      colors: {
        baseDark: '#84cc16', baseLight: '#f4f4f5', trunk: '#451a03',
        leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412']
      },
      branchAngles: { spread: Math.PI * 2, lift: Math.PI * 0.5 }, // Wide outward spread
      leafDensity: 0.75, 
      maxDepth: 3
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
