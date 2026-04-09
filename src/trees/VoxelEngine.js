export const TREE_THEMES = {
  cherryblossom: { 
    name: 'Cherry', shape: 'squashed_sphere', density: 0.35,
    qrDark: '#be185d', qrLight: '#fdf2f8', trunk: '#451a03',
    leaf: ['#f472b6', '#db2777', '#fbcfe8', '#be185d']
  },
  pine: { 
    name: 'Pine', shape: 'cone', density: 0.45,
    qrDark: '#064e3b', qrLight: '#f0fdf4', trunk: '#291002',
    leaf: ['#15803d', '#166534', '#22c55e', '#14532d']
  },
  dragon: { 
    name: 'Dragon', shape: 'umbrella', density: 0.6,
    qrDark: '#451a03', qrLight: '#fefce8', trunk: '#78350f',
    leaf: ['#a3e635', '#84cc16', '#bef264', '#65a30d']
  },
  maple: { 
    name: 'Maple', shape: 'wide_ellipsoid', density: 0.4,
    qrDark: '#9a3412', qrLight: '#fff7ed', trunk: '#451a03',
    leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412']
  },
  juniper: { 
    name: 'Juniper', shape: 'swirl', density: 0.3,
    qrDark: '#0f766e', qrLight: '#f0fdfa', trunk: '#1c1917',
    leaf: ['#0d9488', '#0f766e', '#14b8a6', '#042f2e']
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
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight });
      }
    }
  }

  const trunkHeight = Math.floor(7 * scale);
  for (let y = 1; y <= trunkHeight + 3; y++) {
    voxels.push({ pos: [0, y, 0], color: theme.trunk });
    if (y < trunkHeight - 2) { 
      voxels.push({ pos: [1, y, 0], color: theme.trunk });
      voxels.push({ pos: [-1, y, 0], color: theme.trunk });
      voxels.push({ pos: [0, y, 1], color: theme.trunk });
      voxels.push({ pos: [0, y, -1], color: theme.trunk });
    }
  }

  const cy = trunkHeight;
  const radius = Math.floor(5 * scale);
  const getLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];
  const bounds = Math.floor(8 * scale);

  for (let y = 0; y <= bounds * 2; y++) {
    for (let x = -bounds; x <= bounds; x++) {
      for (let z = -bounds; z <= bounds; z++) {
        
        let isValidShape = false;
        
        if (theme.shape === 'squashed_sphere') {
          isValidShape = Math.sqrt((x*x)/1.5 + ((y-radius)*(y-radius))/0.8 + (z*z)/1.5) <= radius;
        } 
        else if (theme.shape === 'cone') {
          const h = bounds * 1.5;
          isValidShape = y < h && Math.sqrt(x*x + z*z) <= (h - y) * 0.6;
        } 
        else if (theme.shape === 'umbrella') {
          isValidShape = y >= radius - 1.5 && y <= radius + 1 && Math.sqrt(x*x + z*z) <= radius + 1.5;
        } 
        else if (theme.shape === 'wide_ellipsoid') {
          isValidShape = Math.sqrt((x*x)/2.0 + ((y-radius)*(y-radius))/1 + (z*z)/2.0) <= radius;
        }
        else if (theme.shape === 'swirl') {
          const swirlX = x - Math.sin(y * 0.5) * 2;
          const swirlZ = z - Math.cos(y * 0.5) * 2;
          isValidShape = Math.sqrt(swirlX*swirlX + ((y-radius)*(y-radius)) + swirlZ*swirlZ) <= radius;
        }

        const distToCenter = Math.sqrt(x*x + (y-radius)*(y-radius) + z*z);
        const isCore = distToCenter < radius * 0.4; 

        if (isValidShape && (isCore || hash(x, y, z) < theme.density)) {
          voxels.push({ pos: [x, cy + y, z], color: getLeafColor() });
        }
      }
    }
  }

  return voxels;
}
