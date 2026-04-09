export const TREE_THEMES = {
  cherryblossom: { 
    name: 'Cherry', shape: 'squashed_sphere', density: 0.45, clusterSize: 2.5,
    qrDark: '#be185d', qrLight: '#fdf2f8', trunk: '#451a03',
    leaf: ['#f472b6', '#db2777', '#fbcfe8', '#be185d']
  },
  pine: { 
    name: 'Pine', shape: 'cone', density: 0.5, clusterSize: 1.5,
    qrDark: '#064e3b', qrLight: '#f0fdf4', trunk: '#291002',
    leaf: ['#15803d', '#166534', '#22c55e', '#14532d']
  },
  dragon: { 
    name: 'Dragon', shape: 'umbrella', density: 0.7, clusterSize: 3.0,
    qrDark: '#451a03', qrLight: '#fefce8', trunk: '#78350f',
    leaf: ['#a3e635', '#84cc16', '#bef264', '#65a30d']
  },
  maple: { 
    name: 'Maple', shape: 'wide_ellipsoid', density: 0.4, clusterSize: 2.0,
    qrDark: '#9a3412', qrLight: '#fff7ed', trunk: '#451a03',
    leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412']
  },
  juniper: { 
    name: 'Juniper', shape: 'swirl', density: 0.35, clusterSize: 2.5,
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

  for (let y = 0; y <= bounds * 2.5; y++) {
    for (let x = -bounds * 1.5; x <= bounds * 1.5; x++) {
      for (let z = -bounds * 1.5; z <= bounds * 1.5; z++) {
        
        let isValidShape = false;
        
        if (theme.shape === 'squashed_sphere') {
          // Squished Y, inflated middle. Poking branches added via noise.
          const isPoke = hash(x, y, z) > 0.95 ? 1.5 : 0;
          isValidShape = Math.sqrt((x*x)/2.5 + ((y-radius)*(y-radius))/0.5 + (z*z)/2.5) <= radius + isPoke;
        } 
        else if (theme.shape === 'cone') {
          // Pine height scales up significantly more (bounds * 2.2)
          const h = bounds * 2.2;
          isValidShape = y < h && Math.sqrt(x*x + z*z) <= (h - y) * 0.45;
        } 
        else if (theme.shape === 'umbrella') {
          // Dome shape: flat bottom, rounded top.
          const yDome = Math.max(0, y - radius + 1.5);
          isValidShape = y >= radius - 1.5 && Math.sqrt(x*x + (yDome * yDome * 3) + z*z) <= radius + 2;
        } 
        else if (theme.shape === 'wide_ellipsoid') {
          isValidShape = Math.sqrt((x*x)/2.5 + ((y-radius)*(y-radius))/1 + (z*z)/2.5) <= radius;
        }
        else if (theme.shape === 'swirl') {
          // Extreme swirl: increased frequency and amplitude
          const swirlX = x - Math.sin(y * 0.8) * 3.5;
          const swirlZ = z - Math.cos(y * 0.8) * 3.5;
          isValidShape = Math.sqrt(swirlX*swirlX + ((y-radius)*(y-radius)) + swirlZ*swirlZ) <= radius;
        }

        const distToCenter = Math.sqrt(x*x + (y-radius)*(y-radius) + z*z);
        const isCore = distToCenter < radius * 0.4; 

        if (isValidShape) {
          const clusterX = Math.floor(x / theme.clusterSize);
          const clusterY = Math.floor(y / theme.clusterSize);
          const clusterZ = Math.floor(z / theme.clusterSize);
          const clusterNoise = hash(clusterX, clusterY, clusterZ);

          if (isCore || clusterNoise < theme.density) {
            voxels.push({ pos: [x, cy + y, z], color: getLeafColor() });
          }
        }
      }
    }
  }

  return voxels;
}
