import { generateTreeBase, getLeafColor } from '../VoxelUtils';

export const baobab = {
  theme: {
    name: 'baobab', density: 0.6, clusterSize: 3.5,
    qrDark: '#4a3f35', qrLight: '#f5f5f4', trunk: '#75695c',
    leaf: ['#56692e', '#6a8239', '#445423', '#839e4a']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, baobab.theme, {
    getTrunkHeight: (scale) => Math.floor(7 * scale) + Math.floor(6 * scale),
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      let isTrunk = false;
      if (y <= trunkHeight) {
        const midY = trunkHeight / 2;
        const normalizedDist = Math.abs(y - midY) / midY; 
        const trunkRadius = 4.0 - (normalizedDist * 2.0); 
        isTrunk = Math.sqrt(x*x + z*z) <= trunkRadius;
      }

      let isValidCanopy = false;
      if (y >= trunkHeight * 0.4) {
        isValidCanopy = cy_y >= 0 && cy_y <= radius * 1.2 && Math.sqrt((x*x)/1.5 + (cy_y*cy_y)*1.5 + (z*z)/1.5) <= radius * 1.5;
      }

      if (isTrunk) {
        voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
      } else if (isValidCanopy) {
        const angle = Math.atan2(z, x);
        const branchFactor = Math.cos(4 * angle);
        const distToCenterXZ = Math.sqrt(x*x + z*z);
        const isBranch = isCore || (branchFactor > 0.4 && distToCenterXZ < radius * 1.2);
        const isLeafArea = branchFactor > 0.1 && distToCenterXZ >= radius * 0.6 && distToCenterXZ <= radius * 1.5 && cy_y >= radius * 0.2;
        
        if (isBranch) {
           if (cy_y > radius * 0.5 && clusterNoise < 0.4) {
              voxels.push({ pos: [x, y, z], color: getLeafColor(theme), qrColor: theme.qrDark, scale: 1 });
           } else {
              voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
           }
        } else if (isLeafArea && clusterNoise < 0.85) { 
           voxels.push({ pos: [x, y, z], color: getLeafColor(theme), qrColor: theme.qrDark, scale: 1 });
        }
      }
    }
  })
};