import { hash, generateTreeBase, getLeafColor } from '../VoxelUtils';

export const weepingwillow = {
  theme: {
    name: 'weeping willow', density: 0.4, clusterSize: 1.5,
    qrDark: '#2d4a22', qrLight: '#f0fdf4', trunk: '#3d3224',
    leaf: ['#8f9e59', '#a2b366', '#768545', '#b7c975', '#606e33']
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, weepingwillow.theme, {
    getTrunkHeight: (scale) => Math.floor(7 * scale) + Math.floor(3 * scale),
    getBounds: (scale) => Math.floor(10 * scale),
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      const isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.8;
      let isValidCanopy = false;

      const cloudNoise = hash(Math.floor(x/2), Math.floor(y/2), Math.floor(z/2));
      const cloudRadius = radius * 1.6 + (cloudNoise > 0.5 ? 1.5 : -1.5);
      const cloudDome = cy_y >= -1 && cy_y <= radius * 1.2 && Math.sqrt((x*x)/1.8 + (cy_y*cy_y)*1.8 + (z*z)/1.8) <= cloudRadius;
      
      const vineNoise = hash(x, 0, z);
      const dropLength = radius * 1.2 + (vineNoise * radius * 2.5);
      const isVine = cy_y < 0 && cy_y >= -dropLength && vineNoise < 0.20 && Math.sqrt((x*x)/1.5 + (z*z)/1.5) <= radius * 1.4;
      
      isValidCanopy = cloudDome || isVine;

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