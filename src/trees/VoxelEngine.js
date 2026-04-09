export const TREE_THEMES = {
  cherryblossom: { 
    name: 'Cherry', shape: 'squashed_sphere', density: 0.45, clusterSize: 2.5,
    qrDark: '#1A050D', qrLight: '#FFFFFF', trunk: '#3A2318', 
    leaf: ['#FFB7C5', '#FF9EB5', '#FF85A1', '#FF7096', '#FFE4E9']
  },
  pine: { 
    name: 'Pine', shape: 'cone', density: 0.5, clusterSize: 1.5,
    qrDark: '#01120A', qrLight: '#FFFFFF', trunk: '#2D241E', 
    leaf: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#081C15']
  },
  dragon: { 
    name: 'Dragon', shape: 'umbrella', density: 0.7, clusterSize: 3.0,
    qrDark: '#1A0800', qrLight: '#FFFFFF', trunk: '#5C1A06', 
    leaf: ['#274C2B', '#386641', '#4C956C', '#2D6A4F', '#132A13']
  },
  maple: { 
    name: 'Maple', shape: 'wide_ellipsoid', density: 0.4, clusterSize: 2.0,
    qrDark: '#1F0B04', qrLight: '#FFFFFF', trunk: '#3A2618', 
    leaf: ['#9D0208', '#D00000', '#DC2F02', '#E85D04', '#F48C06']
  },
  juniper: { 
    name: 'Juniper', shape: 'swirl', density: 0.35, clusterSize: 2.5,
    qrDark: '#051917', qrLight: '#FFFFFF', trunk: '#1A1A1A', 
    leaf: ['#2D4A22', '#3A5A40', '#588157', '#A3B18A', '#344E41']
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
  
  // 1. Draw Ground Base Layer (Flagged as isBase: true)
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qrData[row * qrSize + col]) {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark, isBase: true });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight, isBase: true });
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
        
        const col = Math.floor(x) + center;
        const row = Math.floor(z) + center;

        if (col < 0 || col >= qrSize || row < 0 || row >= qrSize) continue;
        if (!qrData[row * qrSize + col]) continue; 

        let isTrunk = y <= trunkHeight && Math.sqrt(x*x + z*z) <= 1.5;
        let isValidCanopy = false;
        const cy_y = y - trunkHeight; 

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
