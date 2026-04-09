// Centralized Themes so the entire app (3D and 2D QRs) shares the exact same colors
export const TREE_THEMES = {
  cherryblossom: { 
    name: 'Cherry', shape: 'sphere', density: 0.35, // 65% empty space!
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
    name: 'Maple', shape: 'ellipsoid', density: 0.4,
    qrDark: '#9a3412', qrLight: '#fff7ed', trunk: '#451a03',
    leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412']
  },
  juniper: { 
    name: 'Juniper', shape: 'wild', density: 0.3,
    qrDark: '#0f766e', qrLight: '#f0fdfa', trunk: '#1c1917',
    leaf: ['#0d9488', '#0f766e', '#14b8a6', '#042f2e']
  }
};

// Extremely fast noise alternative for organic gaps
const hash = (x, y, z) => {
  let h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return h - Math.floor(h);
};

export function generateTree(treeType, qrData, qrSize) {
  const theme = TREE_THEMES[treeType] || TREE_THEMES.cherryblossom;
  const voxels = [];
  const center = Math.floor(qrSize / 2);
  const scale = Math.max(1, qrSize / 21);
  
  // 1. Draw QR Ground (The Shadowed Area)
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qrData[row * qrSize + col]) {
        // Deepen the ground color to look like a shadow
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight });
      }
    }
  }

  // 2. Draw Taller, Solid Trunk
  const trunkHeight = Math.floor(7 * scale);
  for (let y = 1; y <= trunkHeight; y++) {
    voxels.push({ pos: [0, y, 0], color: theme.trunk });
    if (y < trunkHeight - 2) { // Thicker base
      voxels.push({ pos: [1, y, 0], color: theme.trunk });
      voxels.push({ pos: [-1, y, 0], color: theme.trunk });
      voxels.push({ pos: [0, y, 1], color: theme.trunk });
      voxels.push({ pos: [0, y, -1], color: theme.trunk });
    }
  }

  // 3. Fast Geometric Canopy Generation
  const cy = trunkHeight;
  const radius = Math.floor(5 * scale);
  const getLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];

  // Single 3D loop bounding box (Incredibly fast)
  const bounds = Math.floor(8 * scale);
  for (let y = 0; y <= bounds * 2; y++) {
    for (let x = -bounds; x <= bounds; x++) {
      for (let z = -bounds; z <= bounds; z++) {
        
        let isValidShape = false;
        
        // Shape Math
        if (theme.shape === 'sphere') {
          isValidShape = Math.sqrt(x*x + (y-radius)*(y-radius) + z*z) <= radius;
        } 
        else if (theme.shape === 'cone') {
          const h = bounds * 1.5;
          isValidShape = y < h && Math.sqrt(x*x + z*z) <= (h - y) * 0.6;
        } 
        else if (theme.shape === 'umbrella') {
          isValidShape = y > radius && y < radius + 3 && Math.sqrt(x*x + z*z) <= radius + 2;
        } 
        else if (theme.shape === 'ellipsoid') {
          isValidShape = Math.sqrt((x*x)/1 + ((y-radius)*(y-radius))/2 + (z*z)/1) <= radius * 0.8;
        }
        else if (theme.shape === 'wild') {
          const d1 = Math.sqrt(x*x + (y-radius)*(y-radius) + z*z);
          const d2 = Math.sqrt((x-3)*(x-3) + (y-radius+2)*(y-radius+2) + z*z);
          const d3 = Math.sqrt((x+2)*(x+2) + (y-radius-2)*(y-radius-2) + (z-2)*(z-2));
          isValidShape = d1 < radius*0.7 || d2 < radius*0.6 || d3 < radius*0.5;
        }

        // Apply massive air gaps using density
        if (isValidShape && hash(x, y, z) < theme.density) {
          voxels.push({ pos: [x, cy + y, z], color: getLeafColor() });
        }
      }
    }
  }

  return voxels;
}
