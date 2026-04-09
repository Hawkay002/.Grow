import React, { useEffect, useState, useMemo } from 'react'; 
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import QRCode from 'qrcode';
import { generateTree, TREE_THEMES } from '../trees/VoxelEngine';

export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'qr'

  useEffect(() => {
    async function loadData() {
      const docSnap = await getDoc(doc(db, 'qrs', id));
      if (!docSnap.exists()) return;
      const dbData = docSnap.data();
      setData(dbData);

      // Generate the perfectly straight, elegantly colored 2D QR
      const theme = TREE_THEMES[dbData.treeType];
      const imgUrl = await QRCode.toDataURL(dbData.destinationUrl, {
        width: 400, margin: 2, color: { dark: theme.qrDark, light: theme.qrLight }
      });
      setQrImageUrl(imgUrl);
    }
    loadData();
  }, [id]);

  const voxels = useMemo(() => {
    if (!data) return [];
    const matrix = QRCode.create(data.destinationUrl, { errorCorrectionLevel: 'M' });
    return generateTree(data.treeType, matrix.modules.data, matrix.modules.size);
  }, [data]);

  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-serif text-2xl text-slate-400">Growing...</div>;

  return (
    <div className="relative w-screen h-screen bg-slate-50 overflow-hidden font-sans">
      
      {viewMode === 'tree' ? (
        <Canvas shadows camera={{ position: [50, 60, 50], zoom: 12 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
          <Environment preset="city" />
          <group>
            {voxels.map((v, i) => (
              <mesh key={i} position={v.pos} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={v.color} roughness={0.9} />
              </mesh>
            ))}
          </group>
          <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1.0} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-8 bg-slate-50">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <img src={qrImageUrl} alt="Colored QR Code" className="w-full max-w-sm h-auto rounded-xl" />
          </div>
        </div>
      )}

      {/* Elegant Floating UI Overlay */}
      <div className="absolute bottom-16 left-0 w-full flex flex-col items-center pointer-events-none z-10 px-6">
        
        {/* Soft Pill Toggle */}
        <div className="mb-8 pointer-events-auto flex bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm ring-1 ring-slate-900/5">
          <button onClick={() => setViewMode('tree')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'tree' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            3D Canvas
          </button>
          <button onClick={() => setViewMode('qr')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'qr' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            2D Code
          </button>
        </div>

        {/* Floating Unlock Card */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 text-center pointer-events-auto max-w-sm w-full">
          <h2 className="font-serif text-2xl text-slate-800 mb-6">Link Discovered</h2>
          <a href={data.destinationUrl} className="block w-full bg-emerald-600 text-white font-medium py-4 rounded-2xl hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Continue to Destination
          </a>
        </div>
      </div>
    </div>
  );
}
