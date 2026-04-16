import { generateTreeBase, getLeafColor } from '../VoxelUtils';

export const juniper = {
  theme: { 
    name: 'juniper', density: 0.35, clusterSize: 2.5,
    qrDark: '#0f766e', qrLight: '#f0fdfa', trunk: '#1A1A1A', 
    leaf: ['#2D4A22', '#3A5A40', '#588157', '#A3B18A', '#344E41']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, juniper.theme, {
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      let isTrunk = false;
      if (y <= trunkHeight) {
        let tx = x - Math.sin(y * 0.5) * 1.5; 
        let tz = z - Math.cos(y * 0.5) * 1.5; 
        isTrunk = Math.sqrt(tx*tx + tz*tz) <= 1.5;
      }

      let isValidCanopy = false;
      if (y >= trunkHeight * 0.4) {
        const swirlX = x - Math.sin(cy_y * 0.8) * (radius * 0.5);
        const swirlZ = z - Math.cos(cy_y * 0.8) * (radius * 0.5);
        isValidCanopy = Math.sqrt(swirlX*swirlX + (cy_y*cy_y) + swirlZ*swirlZ) <= radius * 1.25;
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