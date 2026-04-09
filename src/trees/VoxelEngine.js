export const TREE_THEMES = {
  cherryblossom: { 
    name: 'Cherry', shape: 'squashed_sphere', density: 0.45, clusterSize: 2.5,
    qrDark: '#831843', qrLight: '#fce7f3', trunk: '#451a03', // Deep Rose dark, visible pastel pink light
    leaf: ['#f472b6', '#db2777', '#fbcfe8', '#be185d']
  },
  pine: { 
    name: 'Pine', shape: 'cone', density: 0.5, clusterSize: 1.5,
    qrDark: '#022c22', qrLight: '#dcfce7', trunk: '#291002', // Deep Jungle dark, visible mint light
    leaf: ['#15803d', '#166534', '#22c55e', '#14532d']
  },
  dragon: { 
    name: 'Dragon', shape: 'umbrella', density: 0.7, clusterSize: 3.0,
    qrDark: '#291002', qrLight: '#fef08a', trunk: '#78350f', // Deep Mahogany dark, visible golden light
    leaf: ['#a3e635', '#84cc16', '#bef264', '#65a30d']
  },
  maple: { 
    name: 'Maple', shape: 'wide_ellipsoid', density: 0.4, clusterSize: 2.0,
    qrDark: '#7c2d12', qrLight: '#ffedd5', trunk: '#451a03', // Deep Rust dark, visible peach light
    leaf: ['#ea580c', '#c2410c', '#f97316', '#9a3412']
  },
  juniper: { 
    name: 'Juniper', shape: 'swirl', density: 0.35, clusterSize: 2.5,
    qrDark: '#134e4a', qrLight: '#ccfbf1', trunk: '#1c1917', // Deep Teal dark, visible cyan light
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
  
  // 1. Draw Ground Base Layer (Solid blocks for scanning contrast)
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
  const radius = Math.floor(5 * scale);
  const bounds = Math.floor(8 * scale);
  const getLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];

  // 2. Extrude the Tree with rigid QR matrix constraints
  for (let y = 1; y <= bounds * 2.5; y++) {
    for (let x = -bounds * 2; x <= bounds * 2; x++) {
      for (let z = -bounds * 2; z <= bounds * 2; z++) {
        
        // Map 3D coordinate to 2D QR Code Matrix
        const col = Math.floor(x) + center;
        const row = Math.floor(z) + center;

        // THE EXTRUSION CONSTRAINT:
        // Leaves and branches ONLY grow over dark QR modules.
        if (col < 0 || col >= qrSize || row < 0 || row >= qrSize) continue;
        if (!qrData[row * qrSize + col]) continue; 

        // Shape calculations
        let isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
        let isValidCanopy = false;
        const cy_y = y - trunkHeight; // Relative Y for canopy shaping

        if (y >= trunkHeight * 0.4) {
          if (theme.shape === 'squashed_sphere') {
            const isPoke = hash(x, y, z) > 0.95 ? 1.5 : 0;
            isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/0.5 + (z*z)/2.5) <= radius + isPoke;
          } 
          else if (theme.shape === 'cone') {
            const h = bounds * 2.2;
            isValidCanopy = cy_y < h && Math.sqrt(x*x + z*z) <= (h - cy_y) * 0.45;
          } 
          else if (theme.shape === 'umbrella') {
            const yDome = Math.max(0, cy_y - 1.5);
            isValidCanopy = cy_y >= -1.5 && Math.sqrt((x*x)/3.5 + (yDome * yDome * 4) + (z*z)/3.5) <= radius + 2;
          } 
          else if (theme.shape === 'wide_ellipsoid') {
            isValidCanopy = Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/1 + (z*z)/2.5) <= radius;
          }
          else if (theme.shape === 'swirl') {
            const swirlX = x - Math.sin(cy_y * 0.8) * 3.5;
            const swirlZ = z - Math.cos(cy_y * 0.8) * 3.5;
            isValidCanopy = Math.sqrt(swirlX*swirlX + (cy_y*cy_y) + swirlZ*swirlZ) <= radius;
          }
        }

        // Apply colors and noise
        if (isTrunk) {
          voxels.push({ pos: [x, y, z], color: theme.trunk });
        } else if (isValidCanopy) {
          const clusterX = Math.floor(x / theme.clusterSize);
          const clusterY = Math.floor(y / theme.clusterSize);
          const clusterZ = Math.floor(z / theme.clusterSize);
          const clusterNoise = hash(clusterX, clusterY, clusterZ);
          
          const isCore = Math.sqrt(x*x + cy_y*cy_y + z*z) < radius * 0.4; 

          if (isCore || clusterNoise < theme.density) {
            voxels.push({ pos: [x, y, z], color: getLeafColor() });
          }
        }
      }
    }
  }

  return voxels;
}
