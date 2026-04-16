import { generateTreeBase, getLeafColor } from '../VoxelUtils';

export const maple = {
  theme: { 
    name: 'maple', density: 0.4, clusterSize: 2.0,
    qrDark: '#9a3412', qrLight: '#fff7ed', trunk: '#3A2618', 
    leaf: ['#9D0208', '#D00000', '#DC2F02', '#E85D04', '#F48C06']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, maple.theme, {
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      const isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
      let isValidCanopy = false;

      if (y >= trunkHeight * 0.4) {
        isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/1 + (z*z)/2.5) <= radius;
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