import { hash, generateTreeBase, getLeafColor, getFlowerColor } from '../VoxelUtils';

export const cactus = {
  theme: {
    name: 'prickly pear cactus', density: 1.0, clusterSize: 1.0,
    qrDark: '#14532d', qrLight: '#fef3c7', trunk: '#14532d',
    leaf: ['#4ade80', '#22c55e', '#16a34a', '#15803d'], 
    flower: ['#f43f5e', '#fb7185', '#e11d48'] 
  },
  generate: (qrData, qrSize) => generateTreeBase(qrData, qrSize, cactus.theme, {
    getTrunkHeight: () => 1,
    getBounds: (scale) => Math.floor(10 * scale),
    setup: (scale) => {
      const s = Math.max(1, scale * 1.2);
      const cactusPads = [];
      const addPad = (cx, cy, cz, r, axis) => {
        const flowers = [];
        flowers.push({ fx: cx, fy: cy + r * 0.85, fz: cz });
        if (axis === 'z') {
            flowers.push({ fx: cx - r * 0.7, fy: cy + r * 0.4, fz: cz });
            flowers.push({ fx: cx + r * 0.7, fy: cy + r * 0.4, fz: cz });
        } else {
            flowers.push({ fx: cx, fy: cy + r * 0.4, fz: cz - r * 0.7 });
            flowers.push({ fx: cx, fy: cy + r * 0.4, fz: cz + r * 0.7 });
        }
        cactusPads.push({ cx, cy, cz, r, axis, flowers });
      };
      addPad(0, 3*s, 0, 4*s, 'z'); 
      addPad(-3*s, 8*s, 1.5*s, 3.5*s, 'x'); 
      addPad(3*s, 7.5*s, -1.5*s, 3.5*s, 'x'); 
      addPad(-5*s, 13*s, 0, 3*s, 'z'); 
      addPad(1*s, 12.5*s, -3.5*s, 2.5*s, 'z'); 
      addPad(5*s, 12*s, 2*s, 3*s, 'z'); 
      return { cactusPads };
    },
    processVoxel: ({ x, y, z, cy_y, voxels, theme, context }) => {
      let isFlower = false;
      let isPadEdge = false; 
      let vScale = 1; 
      let isValidCanopy = false;
      let inPad = false;

      for (let p of context.cactusPads) {
         const dx = x - p.cx;
         const dy = cy_y - p.cy;
         const dz = z - p.cz;
         const dist = p.axis === 'z' ? Math.sqrt((dx*dx)/2.5 + (dy*dy)/1.2 + (dz*dz)*4.0) : Math.sqrt((dx*dx)*4.0 + (dy*dy)/1.2 + (dz*dz)/2.5);
             
         if (dist <= p.r) {
             inPad = true;
             if (dist > p.r - 0.95) isPadEdge = true; 
         }
         for (let f of p.flowers) {
             const fdx = Math.abs(x - f.fx), fdy = Math.abs(cy_y - f.fy), fdz = Math.abs(z - f.fz);
             const fDist = Math.sqrt(fdx*fdx + fdy*fdy + fdz*fdz);
             if (fDist < 1.2) {
                 isFlower = true; isValidCanopy = true; vScale = 1.5; 
             } else if (fDist < 2.0 && (fdx < 0.8 || fdy < 0.8 || fdz < 0.8)) {
                 isFlower = true; isValidCanopy = true; vScale = 0.6; 
             }
         }
      }
      
      if (inPad && !isFlower && hash(x,y,z) > 0.95) {
         vScale = 0.4; isValidCanopy = true; isPadEdge = true; 
      } else if (inPad && !isFlower) {
         isValidCanopy = true;
      }

      if (isValidCanopy) {
        if (isFlower) {
           voxels.push({ pos: [x, y, z], color: getFlowerColor(theme), qrColor: theme.qrDark, scale: vScale });
        } else {
           const padColor = isPadEdge ? theme.trunk : getLeafColor(theme);
           voxels.push({ pos: [x, y, z], color: padColor, qrColor: theme.qrDark, scale: vScale });
        }
      }
    }
  })
};