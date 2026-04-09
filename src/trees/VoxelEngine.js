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
  
  // 1. Draw Ground Base Layer
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qrData[row * qrSize + col]) {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark, qrColor: theme.qrDark, isBase: true });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight, qrColor: theme.qrLight, isBase: true });
      }
    }
  }

  // DYNAMIC TRUNK HEIGHT: Willow gets a taller trunk to let vines drop
  let trunkHeight = Math.floor(7 * scale);
  if (theme.shape === 'willow') {
    trunkHeight += Math.floor(3 * scale);
  }

  const radius = Math.floor(5 * scale);
  
  // DYNAMIC BOUNDS: Willow needs taller bounds so the canopy isn't chopped off at the top
  const bounds = theme.shape === 'willow' ? Math.floor(10 * scale) : Math.floor(8 * scale);
  
  const getLeafColor = () => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];

  // 2. Extrude the Tree
  for (let y = 1; y <= bounds * 2.5; y++) {
    for (let x = -bounds * 2; x <= bounds * 2; x++) {
      for (let z = -bounds * 2; z <= bounds * 2; z++) {
        
        const col = Math.floor(x) + center;
        const row = Math.floor(z) + center;

        if (col < 0 || col >= qrSize || row < 0 || row >= qrSize) continue;
        if (!qrData[row * qrSize + col]) continue; 

        // TRUNK SHAPING LOGIC
        let isTrunk = false;
        if (y <= trunkHeight) {
           let trunkRadius = 1.5;
           let tx = x, tz = z;
           
           if (theme.name === 'baobab') {
              const midY = trunkHeight / 2;
              const distFromMid = Math.abs(y - midY);
              const normalizedDist = distFromMid / midY; 
              trunkRadius = 3.5 - (normalizedDist * 1.8); 
           } else if (theme.name === 'juniper') {
              tx = x - Math.sin(y * 0.5) * 1.5; 
              tz = z - Math.cos(y * 0.5) * 1.5; 
           } else if (theme.shape === 'willow') {
              trunkRadius = 1.8; // Slightly thicker trunk to support the massive canopy
           }
           
           isTrunk = Math.sqrt(tx*tx + tz*tz) <= trunkRadius;
        }

        // CANOPY SHAPING LOGIC
        let isValidCanopy = false;
        const cy_y = y - trunkHeight;

        if (y >= trunkHeight * 0.4 || theme.shape === 'willow') {
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
            const swirlX = x - Math.sin(cy_y * 0.8) * (radius * 0.5);
            const swirlZ = z - Math.cos(cy_y * 0.8) * (radius * 0.5);
            isValidCanopy = Math.sqrt(swirlX*swirlX + (cy_y*cy_y) + swirlZ*swirlZ) <= radius * 1.25;
          }
          else if (theme.shape === 'baobab') {
            isValidCanopy = cy_y >= 0 && cy_y <= radius * 0.8 && Math.sqrt((x*x)/1.5 + (cy_y*cy_y)*2 + (z*z)/1.5) <= radius * 1.2;
          }
          else if (theme.shape === 'willow') {
            // 1. Much wider canopy dome (divisors increased to 2.5)
            const dome = cy_y >= -2 && Math.sqrt((x*x)/2.5 + (cy_y*cy_y)/1.2 + (z*z)/2.5) <= radius * 1.35;
            
            // 2. More frequent, drastically longer vines dropping from the canopy
            const vineHash = hash(x, 0, z);
            // Vine drop length dynamically varies from 1.5x radius to 3.5x radius!
            const vineDrop = vineHash > 0.2 ? (radius * 1.5 + (vineHash * radius * 2.0)) : 0; 
            
            // 3. Match the vine spread to the wider canopy
            const isVine = cy_y < 0 && cy_y > -vineDrop && Math.sqrt((x*x)/2.5 + (z*z)/2.5) <= radius * 1.3;
            
            isValidCanopy = dome || isVine;
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

          if (theme.name === 'baobab') {
             const branchNoise = hash(x, y, z);
             const isBranch = isCore || (Math.sqrt(x*x + z*z) < radius * 0.9 && branchNoise > 0.55);
             
             if (isBranch) {
                voxels.push({ pos: [x, y, z], color: theme.trunk, qrColor: theme.qrDark });
             } else if (clusterNoise < 0.15) { 
                voxels.push({ pos: [x, y, z], color: getLeafColor(), qrColor: theme.qrDark });
             }
          } else {
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
