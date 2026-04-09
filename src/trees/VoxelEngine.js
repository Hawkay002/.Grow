// --- Simple Pseudo-Random Noise Function ---
// Real Perlin noise is heavy; this math hack creates fast, organic-looking noise for voxels
function hashNoise(x, y, z) {
  const dot = x * 12.9898 + y * 78.233 + z * 37.719;
  const sin = Math.sin(dot) * 43758.5453;
  return sin - Math.floor(sin);
}

// --- 3D Bresenham Algorithm ---
// Maps a continuous 3D line to discrete voxel coordinates
function drawLine3D(voxels, x0, y0, z0, x1, y1, z1, thickness, colorStr) {
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  const dz = Math.abs(z1 - z0), sz = z0 < z1 ? 1 : -1;
  let errX = dx / 2, errY = dy / 2, errZ = dz / 2;

  let cx = x0, cy = y0, cz = z0;
  
  // Track unique coordinates to avoid rendering duplicate voxels
  const addVoxel = (vx, vy, vz) => {
    voxels.push({ pos: [vx, vy, vz], color: colorStr });
  };

  while (true) {
    // Add thickness around the core line
    for (let tx = -thickness; tx <= thickness; tx++) {
      for (let tz = -thickness; tz <= thickness; tz++) {
        if (Math.abs(tx) + Math.abs(tz) <= thickness) { // Diamond shape thickness
          addVoxel(cx + tx, cy, cz + tz);
        }
      }
    }

    if (cx === x1 && cy === y1 && cz === z1) break;
    
    // Step forward in 3D space
    if (dx >= dy && dx >= dz) { errY -= dy; errZ -= dz; cx += sx; if (errY < 0) { cy += sy; errY += dx; } if (errZ < 0) { cz += sz; errZ += dx; } }
    else if (dy >= dx && dy >= dz) { errX -= dx; errZ -= dz; cy += sy; if (errX < 0) { cx += sx; errX += dy; } if (errZ < 0) { cz += sz; errZ += dy; } }
    else { errX -= dx; errY -= dy; cz += sz; if (errX < 0) { cx += sx; errX += dz; } if (errY < 0) { cy += sy; errY += dz; } }
  }
}

// --- The L-System / Recursive Branching Engine ---
export function generateOrganicTree({ 
  qrSize, 
  qrData, 
  colors, 
  branchAngles, 
  leafDensity, 
  maxDepth 
}) {
  const voxels = [];
  const center = Math.floor(qrSize / 2);
  const scale = Math.max(1, qrSize / 21);
  
  // 1. Generate the Base (The QR Ground)
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      const isDark = qrData[row * qrSize + col];
      voxels.push({ 
        pos: [col - center, 0, row - center], 
        color: isDark ? colors.baseDark : colors.baseLight 
      });
    }
  }

  // Helper to pick random shades for organic leaves
  const getLeafColor = () => colors.leaf[Math.floor(Math.random() * colors.leaf.length)];

  // 2. The Recursive Branching Function
  function growBranch(startX, startY, startZ, angleX, angleY, length, thickness, depth) {
    // Calculate end points based on angles
    const endX = Math.round(startX + length * Math.sin(angleY) * Math.cos(angleX));
    const endY = Math.round(startY + length * Math.cos(angleY));
    const endZ = Math.round(startZ + length * Math.sin(angleY) * Math.sin(angleX));

    // Draw the actual branch
    drawLine3D(voxels, startX, startY, startZ, endX, endY, endZ, thickness, colors.trunk);

    // If we haven't reached the tips, split into smaller branches
    if (depth > 0) {
      const numSplits = Math.floor(Math.random() * 2) + 2; // 2 or 3 branches
      for (let i = 0; i < numSplits; i++) {
        // Perturb the angles to spread them out organically
        const newAngleX = angleX + (Math.random() * branchAngles.spread - branchAngles.spread/2);
        const newAngleY = angleY + (Math.random() * branchAngles.lift - branchAngles.lift/2) + 0.2; // Keep them pointing mostly up
        const newLength = Math.max(2, length * 0.7); // Branches get shorter
        const newThickness = Math.max(0, thickness - 1); // Branches get thinner
        
        growBranch(endX, endY, endZ, newAngleX, newAngleY, newLength, newThickness, depth - 1);
      }
    } 
    // 3. Leaf Generation (If we are at the very tips of the branches)
    else {
      const clusterRadius = Math.floor(4 * scale);
      for (let lx = -clusterRadius; lx <= clusterRadius; lx++) {
        for (let ly = -clusterRadius; ly <= clusterRadius; ly++) {
          for (let lz = -clusterRadius; lz <= clusterRadius; lz++) {
            const distance = Math.sqrt(lx*lx + ly*ly + lz*lz);
            if (distance <= clusterRadius) {
              // Apply Noise to break up the cluster and make gaps
              const noiseVal = hashNoise(endX + lx, endY + ly, endZ + lz);
              if (noiseVal < leafDensity) { 
                voxels.push({ 
                  pos: [endX + lx, endY + ly, endZ + lz], 
                  color: getLeafColor() 
                });
              }
            }
          }
        }
      }
    }
  }

  // Start the L-System (The Root/Trunk)
  const initialThickness = Math.floor(1.5 * scale);
  const initialLength = Math.floor(6 * scale);
  
  // growBranch(startX, startY, startZ, angleX, angleY, length, thickness, depth)
  // angleY = 0 means pointing straight up.
  growBranch(0, 1, 0, 0, 0, initialLength, initialThickness, maxDepth);

  return voxels;
}
