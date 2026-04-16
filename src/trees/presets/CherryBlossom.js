import { hash, generateTreeBase, getLeafColor } from '../VoxelUtils';

export const cherryblossom = {
  theme: { 
    name: 'cherryblossom', density: 0.45, clusterSize: 2.5,
    qrDark: '#be185d', qrLight: '#fdf2f8', trunk: '#3A2318', 
    leaf: ['#FFB7C5', '#FF9EB5', '#FF85A1', '#FF7096', '#FFE4E9']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, cherryblossom.theme, {
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      const isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
      let isValidCanopy = false;

      if (y >= trunkHeight * 0.4) {
        const isPoke = hash(x, y, z) > 0.95 ? 1.5 : 0;
        isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/0.5 + (z*z)/2.5) <= radius + isPoke;
      }

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