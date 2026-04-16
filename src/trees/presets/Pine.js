import { generateTreeBase, getLeafColor } from '../VoxelUtils';

export const pine = {
  theme: { 
    name: 'pine', density: 0.5, clusterSize: 1.5,
    qrDark: '#064e3b', qrLight: '#f0fdf4', trunk: '#2D241E', 
    leaf: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#081C15']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, pine.theme, {
    processVoxel: ({ x, y, z, cy_y, trunkHeight, bounds, clusterNoise, isCore, voxels, theme }) => {
      const isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
      const h = bounds * 2.2;
      
      // FIXED: Added `cy_y >= -1` so the wide base of the cone canopy stops exactly at the top of the trunk
      const isValidCanopy = cy_y >= -1 && cy_y < h && Math.sqrt(x*x + z*z) <= (h - cy_y) * 0.45;

      if (isTrunk) {
        voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
      } else if (isValidCanopy) {
        if (isCore || clusterNoise < theme.density) {
          voxels.push({ pos: [x, y, z], color: getLeafColor(theme), qrColor: theme.qrDark, scale: 1 });
        }
      }
    }
  })
};
