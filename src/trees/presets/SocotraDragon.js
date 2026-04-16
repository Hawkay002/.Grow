import { generateTreeBase, getLeafColor } from '../VoxelUtils';

export const socotradragon = {
  theme: { 
    name: 'socotra dragon', density: 0.7, clusterSize: 3.0,
    qrDark: '#451a03', qrLight: '#fefce8', trunk: '#5C1A06', 
    leaf: ['#274C2B', '#386641', '#4C956C', '#2D6A4F', '#132A13']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, socotradragon.theme, {
    getTrunkHeight: (scale) => Math.floor(7 * scale) + Math.floor(5 * scale),
    getBounds: (scale) => Math.floor(10 * scale),
    processVoxel: ({ x, y, z, cy_y, radius, clusterNoise, voxels, theme }) => {
      let isValidCanopy = false;
      if (y >= 0) {
        isValidCanopy = cy_y >= -2 && cy_y <= radius * 3.5 && Math.sqrt(x*x + z*z) <= radius * 3.0;
      }

      if (isValidCanopy) {
        const angle = Math.atan2(z, x);
        const distToCenterXZ = Math.sqrt(x*x + z*z);
        const maxH = radius * 1.2;
        const maxRadius = radius * 2.4;

        const nY = Math.max(0, Math.min(1, cy_y / maxH));
        const branchProfile = maxRadius * Math.pow(nY, 0.7);

        const numBranches = 10 + Math.floor(radius);
        const twist = nY * 3.5;
        const spiral1 = Math.cos(numBranches * angle + twist);
        const spiral2 = Math.cos(numBranches * angle - twist);
        
        const isBranchMesh = (spiral1 > 0.25 || spiral2 > 0.25);
        const distFromProfile = Math.abs(distToCenterXZ - branchProfile);
        const isBranch = isBranchMesh && distFromProfile < 1.8 && cy_y >= 0 && cy_y < maxH * 0.95;

        const canopyBase = maxH * 0.75; 
        const canopyHeight = maxH * 0.9; 
        
        const isTopCanopy = cy_y >= canopyBase && 
            (Math.pow(distToCenterXZ / maxRadius, 2) + Math.pow((cy_y - canopyBase) / canopyHeight, 2) <= 1);
            
        const isRimCanopy = cy_y >= maxH * 0.65 && cy_y < canopyBase && distToCenterXZ <= branchProfile + 2.5 && distToCenterXZ >= branchProfile - 1.5;
        
        const isLeafArea = isTopCanopy || isRimCanopy;
        const isCoreBase = Math.sqrt(x*x + z*z) < 2.5 && cy_y < radius * 0.4;

        if (isCoreBase || isBranch) {
            voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
        } else if (isLeafArea && clusterNoise < 0.85) {
            voxels.push({ pos: [x, y, z], color: getLeafColor(theme), qrColor: theme.qrDark, scale: 1 });
        }
      } else {
        const isTrunkBase = y <= (Math.floor(12 * Math.max(1, qrSize / 21))) && Math.sqrt(x*x + z*z) <= 1.5;
        if (isTrunkBase) voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
      }
    }
  })
};