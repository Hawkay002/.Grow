export const hash = (x, y, z) => {
  let h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return h - Math.floor(h);
};

export const getLeafColor = (theme) => theme.leaf[Math.floor(Math.random() * theme.leaf.length)];
export const getFlowerColor = (theme) => theme.flower[Math.floor(Math.random() * theme.flower.length)];

export const generateTreeBase = (qrData, qrSize, theme, logicConfig) => {
  const voxels = [];
  const center = Math.floor(qrSize / 2);
  const scale = Math.max(1, qrSize / 21);
  const radius = Math.floor(5 * scale);
  
  // Base QR Generation
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qrData[row * qrSize + col]) {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrDark, qrColor: theme.qrDark, isBase: true });
      } else {
        voxels.push({ pos: [col - center, 0, row - center], color: theme.qrLight, qrColor: theme.qrLight, isBase: true });
      }
    }
  }

  const trunkHeight = logicConfig.getTrunkHeight ? logicConfig.getTrunkHeight(scale) : Math.floor(7 * scale);
  const bounds = logicConfig.getBounds ? logicConfig.getBounds(scale) : Math.floor(8 * scale);
  const context = logicConfig.setup ? logicConfig.setup(scale, radius) : {};

  // Core 3D Loop
  for (let y = 1; y <= bounds * 2.5; y++) {
    for (let x = -bounds * 2; x <= bounds * 2; x++) {
      for (let z = -bounds * 2; z <= bounds * 2; z++) {
        const col = Math.floor(x) + center;
        const row = Math.floor(z) + center;

        if (col < 0 || col >= qrSize || row < 0 || row >= qrSize) continue;
        if (!qrData[row * qrSize + col]) continue; 

        const cy_y = y - trunkHeight;
        const clusterNoise = hash(Math.floor(x / theme.clusterSize), Math.floor(y / theme.clusterSize), Math.floor(z / theme.clusterSize));
        const isCore = Math.sqrt(x*x + cy_y*cy_y + z*z) < radius * 0.4;

        logicConfig.processVoxel({
          x, y, z, cy_y, scale, radius, trunkHeight, bounds, clusterNoise, isCore, voxels, theme, context
        });
      }
    }
  }

  return voxels;
};
