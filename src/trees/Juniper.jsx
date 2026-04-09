import React, { useMemo } from 'react';
import { generateOrganicTree } from './VoxelEngine';

export default function Juniper({ qrData, qrSize }) {
  const voxels = useMemo(() => {
    if (!qrData) return [];
    return generateOrganicTree({
      qrSize, qrData,
      colors: {
        baseDark: '#84cc16', baseLight: '#f4f4f5', trunk: '#1c1917',
        leaf: ['#065f46', '#047857', '#059669', '#064e3b']
      },
      branchAngles: { spread: Math.PI * 2.5, lift: Math.PI * 0.3 }, // Chaotic spread
      leafDensity: 0.45, // Very patchy and gappy
      maxDepth: 4
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
