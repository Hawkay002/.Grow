export const TREE_THEMES = {
  cherryblossom: { 
    name: 'cherryblossom', shape: 'squashed_sphere', density: 0.45, clusterSize: 2.5,
    qrDark: '#be185d', qrLight: '#fdf2f8', trunk: '#3A2318', 
    leaf: ['#FFB7C5', '#FF9EB5', '#FF85A1', '#FF7096', '#FFE4E9']
  },
  pine: { 
    name: 'pine', shape: 'cone', density: 0.5, clusterSize: 1.5,
    qrDark: '#064e3b', qrLight: '#f0fdf4', trunk: '#2D241E', 
    leaf: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#081C15']
  },
  socotradragon: { 
    name: 'socotra dragon', shape: 'umbrella', density: 0.7, clusterSize: 3.0,
    qrDark: '#451a03', qrLight: '#fefce8', trunk: '#5C1A06', 
    leaf: ['#274C2B', '#386641', '#4C956C', '#2D6A4F', '#132A13']
  },
  maple: { 
    name: 'maple', shape: 'wide_ellipsoid', density: 0.4, clusterSize: 2.0,
    qrDark: '#9a3412', qrLight: '#fff7ed', trunk: '#3A2618', 
    leaf: ['#9D0208', '#D00000', '#DC2F02', '#E85D04', '#F48C06']
  },
  juniper: { 
    name: 'juniper', shape: 'swirl', density: 0.35, clusterSize: 2.5,
    qrDark: '#0f766e', qrLight: '#f0fdfa', trunk: '#1A1A1A', 
    leaf: ['#2D4A22', '#3A5A40', '#588157', '#A3B18A', '#344E41']
  },
  baobab: {
    name: 'baobab', shape: 'baobab', density: 0.6, clusterSize: 3.5,
    qrDark: '#4a3f35', qrLight: '#f5f5f4', trunk: '#75695c',
    leaf: ['#56692e', '#6a8239', '#445423', '#839e4a']
  },
  weepingwillow: {
    name: 'weeping willow', shape: 'willow', density: 0.4, clusterSize: 1.5,
    qrDark: '#2d4a22', qrLight: '#f0fdf4', trunk: '#3d3224',
    leaf: ['#8f9e59', '#a2b366', '#768545', '#b7c975', '#606e33']
  },
  // NEW PRESETS
  cactus: {
    name: 'prickly pear', shape: 'cactus', density: 0.8, clusterSize: 1.2,
    qrDark: '#14532d', qrLight: '#fef3c7', trunk: '#14532d',
    leaf: ['#4ade80', '#22c55e', '#16a34a', '#15803d'], // Pad colors
    flower: ['#f43f5e', '#fb7185', '#e11d48'] // Pink/Red flowers
  },
  magnolia: {
    name: 'magnolia', shape: 'magnolia', density: 0.5, clusterSize: 2.2,
    qrDark: '#4c1d95', qrLight: '#f5f3ff', trunk: '#4b3f35',
    leaf: ['#1e3a1e', '#2d4c2d', '#3e5e3e'], // Dark glossy leaves
    flower: ['#ffffff', '#fdf2f8', '#fae8ff', '#f0abfc'] // White/Pink blooms
  }
};

const hash = (x, y, z) => {
  let h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return h - Math.floor(h);
};

export function generateTree(treeType, qrData, qrSize) {
  const theme = TREE_THEMES[treeType] || TREE_THEMES.cherryblossom;
  const voxels = [];
  
  const center = Math.floor(qrSize / 2);
  const scale = Math.max(1, qrSize / 21);
  
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qrData[row * qrSize + col]) {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark, qrColor: theme.qrDark, isBase: true });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight, qrColor: theme.qrLight, isBase: true });
      }
    }
  }

  let trunkHeight = Math.floor(7 * scale);
  if (theme.shape === 'willow') {
    trunkHeight += Math.floor(3 * scale); 
  } else if (theme.shape === 'baobab') {
    trunkHeight += Math.floor(6 * scale); 
  } else if (theme.name === 'socotra dragon') {
    trunkHeight += Math.floor(5 * scale); 
  } else if (theme.shape === 'cactus') {
    trunkHeight = 2; // Short base for cactus
  }

  const radius = Math.floor(5 * scale);
  const bounds = (theme.shape === 'willow' || theme.name === 'socotra dragon' || theme.shape === 'magnolia') ? Math.floor(10 * scale) : Math.floor(8 * scale);
  
  const getLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];
  const getFlowerColor = () => theme.flower[Math.floor(Math.random() * theme.flower.length)];

  for (let y = 1; y <= bounds * 2.5; y++) {
    for (let x = -bounds * 2; x <= bounds * 2; x++) {
      for (let z = -bounds * 2; z <= bounds * 2; z++) {
        
        const col = Math.floor(x) + center;
        const row = Math.floor(z) + center;

        if (col < 0 || col >= qrSize || row < 0 || row >= qrSize) continue;
        if (!qrData[row * qrSize + col]) continue; 

        let isTrunk = false;
        let isFlower = false;
        const cy_y = y - trunkHeight;

        if (y <= trunkHeight) {
           let trunkRadius = 1.5;
           let tx = x, tz = z;
           
           if (theme.name === 'baobab') {
              const midY = trunkHeight / 2;
              const distFromMid = Math.abs(y - midY);
              const normalizedDist = distFromMid / midY; 
              trunkRadius = 4.0 - (normalizedDist * 2.0); 
           } else if (theme.name === 'juniper') {
              tx = x - Math.sin(y * 0.5) * 1.5; 
              tz = z - Math.cos(y * 0.5) * 1.5; 
           } else if (theme.shape === 'willow') {
              trunkRadius = 1.8; 
           }
           
           isTrunk = Math.sqrt(tx*tx + tz*tz) <= trunkRadius;
        }

        let isValidCanopy = false;

        if (y >= trunkHeight * 0.4 || theme.shape === 'willow' || theme.shape === 'cactus') {
          if (theme.shape === 'squashed_sphere') {
            const isPoke = hash(x, y, z) > 0.95 ? 1.5 : 0;
            isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/0.5 + (z*z)/2.5) <= radius + isPoke;
          } 
          else if (theme.shape === 'cone') {
            const h = bounds * 2.2;
            isValidCanopy = cy_y < h && Math.sqrt(x*x + z*z) <= (h - cy_y) * 0.45;
          } 
          else if (theme.shape === 'umbrella') {
            isValidCanopy = cy_y >= 0 && Math.sqrt((x*x)/3.0 + (cy_y*cy_y)*0.8 + (z*z)/3.0) <= radius * 1.6;
          } 
          else if (theme.shape === 'wide_ellipsoid') {
            isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/1 + (z*z)/2.5) <= radius;
          }
          else if (theme.shape === 'swirl') {
            const swirlX = x - Math.sin(cy_y * 0.8) * (radius * 0.5);
            const swirlZ = z - Math.cos(cy_y * 0.8) * (radius * 0.5);
            isValidCanopy = Math.sqrt(swirlX*swirlX + (cy_y*cy_y) + swirlZ*swirlZ) <= radius * 1.25;
          }
          else if (theme.shape === 'baobab') {
            isValidCanopy = cy_y >= 0 && cy_y <= radius * 1.2 && Math.sqrt((x*x)/1.5 + (cy_y*cy_y)*1.5 + (z*z)/1.5) <= radius * 1.5;
          }
          else if (theme.shape === 'willow') {
            const cloudNoise = hash(Math.floor(x/2), Math.floor(y/2), Math.floor(z/2));
            const cloudRadius = radius * 1.6 + (cloudNoise > 0.5 ? 1.5 : -1.5);
            const cloudDome = cy_y >= -1 && cy_y <= radius * 1.2 && Math.sqrt((x*x)/1.8 + (cy_y*cy_y)*1.8 + (z*z)/1.8) <= cloudRadius;
            const vineNoise = hash(x, 0, z);
            const dropLength = radius * 1.2 + (vineNoise * radius * 2.5);
            const isVine = cy_y < 0 && cy_y >= -dropLength && vineNoise < 0.20 && Math.sqrt((x*x)/1.5 + (z*z)/1.5) <= radius * 1.4;
            isValidCanopy = cloudDome || isVine;
          }
          // NEW SHAPE: CACTUS (Clustered flat pads)
          else if (theme.shape === 'cactus') {
            const padNoise = hash(Math.floor(x/2), Math.floor(y/3), Math.floor(z/2));
            const isMainColumn = y < 10 && Math.sqrt(x*x + z*z) < 2.2;
            const isSidePad = y >= 5 && y < 18 && padNoise > 0.6 && Math.sqrt(x*x + z*z) < 6;
            isValidCanopy = isMainColumn || isSidePad;
            if (isValidCanopy && y > 12 && hash(x,y,z) > 0.97) isFlower = true;
          }
          // NEW SHAPE: MAGNOLIA (Rounded with density gaps for flowers)
          else if (theme.shape === 'magnolia') {
            isValidCanopy = Math.sqrt((x*x)/2.2 + (cy_y*cy_y)/1.2 + (z*z)/2.2) <= radius * 1.3;
            if (isValidCanopy && hash(x,y,z) > 0.94) isFlower = true;
          }
        }

        if (isTrunk) {
          voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark });
        } else if (isValidCanopy) {
          const clusterX = Math.floor(x / theme.clusterSize);
          const clusterY = Math.floor(y / theme.clusterSize);
          const clusterZ = Math.floor(z / theme.clusterSize);
          const clusterNoise = hash(clusterX, clusterY, clusterZ);
          const isCore = Math.sqrt(x*x + cy_y*cy_y + z*z) < radius * 0.4; 

          if (isFlower) {
            voxels.push({ pos: [x, y, z], color: getFlowerColor(), qrColor: theme.qrDark });
          } else if (theme.name === 'baobab') {
             const angle = Math.atan2(z, x);
             const branchFactor = Math.cos(4 * angle);
             const distToCenterXZ = Math.sqrt(x*x + z*z);
             const isBranch = isCore || (branchFactor > 0.4 && distToCenterXZ < radius * 1.2);
             const isLeafArea = branchFactor > 0.1 && distToCenterXZ >= radius * 0.6 && distToCenterXZ <= radius * 1.5 && cy_y >= radius * 0.2;
             
             if (isBranch) {
                if (cy_y > radius * 0.5 && clusterNoise < 0.4) {
                   voxels.push({ pos: [x, y, z], color: getLeafColor(), qrColor: theme.qrDark });
                } else {
                   voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark });
                }
             } else if (isLeafArea && clusterNoise < 0.85) { 
                voxels.push({ pos: [x, y, z], color: getLeafColor(), qrColor: theme.qrDark });
             }
          } 
          else if (theme.name === 'socotra dragon') {
             const angle = Math.atan2(z, x);
             const branchFactor = Math.cos(5 * angle); 
             const distToCenterXZ = Math.sqrt(x*x + z*z);
             const expectedBranchDist = (cy_y / (radius * 1.0)) * (radius * 1.4);
             const isBranch = branchFactor > 0.6 && Math.abs(distToCenterXZ - expectedBranchDist) < 1.5 && cy_y >= 0 && cy_y <= radius * 0.8;
             const isLeafArea = cy_y > radius * 0.1;

             if (isCore || isBranch) {
                voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark });
             } else if (isLeafArea && clusterNoise < 0.85) {
                voxels.push({ pos: [x, y, z], color: getLeafColor(), qrColor: theme.qrDark });
             }
          }
          else {
             if (isCore || clusterNoise < theme.density) {
                voxels.push({ pos: [x, y, z], color: getLeafColor(), qrColor: theme.qrDark });
             }
          }
        }
      }
    }
  }

  return voxels;
}
