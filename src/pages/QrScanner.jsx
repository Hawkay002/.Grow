import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import QRCode from 'qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTree, faQrcode } from '@fortawesome/free-solid-svg-icons';

// Import our separated organic trees
import CherryBlossom from '../trees/CherryBlossom';
import Pine from '../trees/Pine';
import Maple from '../trees/Maple';
import Dragon from '../trees/Dragon';
import Juniper from '../trees/Juniper';

export default function QrScanner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qrMatrix, setQrMatrix] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'qr'

  useEffect(() => {
    async function loadData() {
      try {
        const docSnap = await getDoc(doc(db, 'qrs', id));
        if (!docSnap.exists()) {
          setError("Link not found.");
          return;
        }
        
        const dbData = docSnap.data();
        setData(dbData);

        // Get 2D Matrix for the 3D base
        const matrix = QRCode.create(dbData.destinationUrl, { errorCorrectionLevel: 'M' });
        setQrMatrix(matrix);

        // Get actual Image for the 2D toggle view
        const imgUrl = await QRCode.toDataURL(dbData.destinationUrl, {
          width: 400, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' }
        });
        setQrImageUrl(imgUrl);

      } catch (err) {
        console.error(err);
        setError("Error loading scene.");
      }
    }
    loadData();
  }, [id]);

  if (error) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl text-brand-pop bg-[#f4f4f5] border-8 border-brand-dark m-4">{error}</div>;
  if (!data || !qrMatrix) return <div className="min-h-screen flex items-center justify-center font-display font-black text-4xl animate-pulse text-brand-dark bg-[#f4f4f5] raw-texture">Planting...</div>;

  // Dynamically select the right component
  const TreeComponent = {
    cherryblossom: CherryBlossom,
    pine: Pine,
    maple: Maple,
    dragon: Dragon,
    juniper: Juniper
  }[data.treeType] || CherryBlossom;

  return (
    <div className="relative w-screen h-screen bg-[#e5e5e5] overflow-hidden">
      
      {/* Background Texture Element */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {viewMode === 'tree' ? (
        <Canvas className="w-full h-full cursor-grab active:cursor-grabbing" shadows>
          <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={12} />
          <OrbitControls enablePan={false} enableZoom={true} maxZoom={40} minZoom={5} autoRotate autoRotateSpeed={1.0} />
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />

          <motion.group initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 90, damping: 14 }}>
            <TreeComponent qrData={qrMatrix.modules.data} qrSize={qrMatrix.modules.size} />
          </motion.group>
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-8 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white p-6 border-8 border-brand-dark shadow-[12px_12px_0px_rgba(26,26,26,1)] rotate-[-2deg]">
            <img src={qrImageUrl} alt="QR Code" className="w-full max-w-sm h-auto" />
          </div>
        </div>
      )}

      {/* Pop UI Overlay */}
      <div className="absolute bottom-24 left-0 w-full flex flex-col items-center pointer-events-none z-10">
        
        {/* Toggle Switch */}
        <div className="mb-8 pointer-events-auto flex bg-white border-4 border-brand-dark p-1 shadow-[6px_6px_0px_rgba(26,26,26,1)]">
          <button 
            onClick={() => setViewMode('tree')}
            className={`px-6 py-2 font-black uppercase text-sm transition-colors ${viewMode === 'tree' ? 'bg-brand-pop text-white' : 'text-brand-dark hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faTree} className="mr-2" /> 3D View
          </button>
          <button 
            onClick={() => setViewMode('qr')}
            className={`px-6 py-2 font-black uppercase text-sm transition-colors ${viewMode === 'qr' ? 'bg-brand-pop text-white' : 'text-brand-dark hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faQrcode} className="mr-2" /> 2D Code
          </button>
        </div>

        {/* Unlock Modal (Shifted Upwards) */}
        <div className="bg-white px-8 py-6 border-4 border-brand-dark shadow-[8px_8px_0px_rgba(26,26,26,1)] text-center pointer-events-auto mx-4 max-w-sm w-full transform transition-transform hover:-translate-y-1">
          <h2 className="font-display font-black text-2xl uppercase mb-4 text-brand-dark tracking-tight">Destination Unlocked</h2>
          <a 
            href={data.destinationUrl}
            className="block w-full bg-[#1a1a1a] text-white font-black uppercase tracking-widest py-4 border-2 border-transparent hover:border-brand-pop hover:bg-brand-pop active:translate-y-1 active:shadow-none transition-all"
          >
            Enter Link
          </a>
        </div>
      </div>
    </div>
  );
}
