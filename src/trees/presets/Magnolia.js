import { hash, generateTreeBase, getLeafColor, getFlowerColor } from '../VoxelUtils';

export const magnolia = {
  theme: {
    name: 'southern magnolia', density: 0.5, clusterSize: 2.2,
    qrDark: '#4c1d95', qrLight: '#f5f3ff', trunk: '#4b3f35',
    leaf: ['#1e3a1e', '#2d4c2d', '#3e5e3e'], 
    flower: ['#ffffff', '#fdf2f8', '#fae8ff', '#f0abfc'] 
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, magnolia.theme, {
    getBounds: (scale) => Math.floor(10 * scale),
    processVoxel: ({ x, y, z, cy_y, trunkHeight, radius, clusterNoise, isCore, voxels, theme }) => {
      const isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
      let isFlower = false;
      let isValidCanopy = false;

      if (y >= trunkHeight * 0.4) {
        isValidCanopy = Math.sqrt((x*x)/2.2 + (cy_y*cy_y)/1.2 + (z*z)/2.2) <= radius * 1.3;
        if (isValidCanopy && hash(x,y,z) > 0.96) isFlower = true;
      }

      if (isTrunk) {
        voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark, scale: 1 });
      } else if (isValidCanopy) {
        if (isFlower) {
           const fScale = 0.35;
           const baseColor = getFlowerColor(theme);
           
           voxels.push({ pos: [x, y, z], color: '#facc15', qrColor: theme.qrDark, scale: fScale * 1.1 });
           
           const distFromCenter = Math.sqrt(x*x + cy_y*cy_y + z*z) || 1;
           const nx = x / distFromCenter, ny = cy_y / distFromCenter, nz = z / distFromCenter;
           
           const phi = Math.acos(ny), theta = Math.atan2(nx, nz);
           const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
           const cosTheta = Math.cos(theta), sinTheta = Math.sin(theta);

           const petals = [
               [0.35, 0.1, 0], [-0.35, 0.1, 0], [0, 0.1, 0.35], [0, 0.1, -0.35],
               [0.25, 0.25, 0.25], [-0.25, 0.25, -0.25], [0.25, 0.25, -0.25], [-0.25, 0.25, 0.25]
           ];
           
           petals.forEach(([px, py, pz]) => {
               const py1 = py * cosPhi - pz * sinPhi;
               const pz1 = py * sinPhi + pz * cosPhi;
               const rx = px * cosTheta + pz1 * sinTheta;
               const rz = -px * sinTheta + pz1 * cosTheta;
               const pColor = Math.random() > 0.6 ? getFlowerColor(theme) : baseColor;
               voxels.push({ pos: [x + rx, y + py1, z + rz], color: pColor, qrColor: theme.qrDark, scale: fScale });
           });
        } else if (isCore || clusterNoise < theme.density) {
           voxels.push({ pos: [x, y, z], color: getLeafColor(theme), qrColor: theme.qrDark, scale: 1 });
        }
      }
    }
  })
};