import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faLink, faQrcode, faTree, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [treeType, setTreeType] = useState('cherryblossom');
  const [loading, setLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [shortLink, setShortLink] = useState('');

  // Protect the route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const treeOptions = [
    { id: 'cherryblossom', name: 'Cherry Blossom (Pink & Fluffy)' },
    { id: 'pine', name: 'Pine (Tall & Sharp)' },
    { id: 'dragon', name: 'Socotra Dragon (Umbrella)' },
    { id: 'maple', name: 'Maple (Dense & Orange)' },
    { id: 'juniper', name: 'Juniper (Twisted & Wild)' }
  ];

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Firebase Database
      const docRef = await addDoc(collection(db, 'qrs'), {
        userId: currentUser.uid,
        destinationUrl: url,
        treeType: treeType,
        createdAt: serverTimestamp(),
        clicks: 0
      });

      // 2. Create the Short Link mapping
      const uniqueScannerLink = `${window.location.origin}/qr/${docRef.id}`;
      setShortLink(uniqueScannerLink);

      // 3. Generate the 2D QR Image
      const qrDataUrl = await QRCode.toDataURL(uniqueScannerLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a1a', 
          light: '#ffffff'
        }
      });
      
      setGeneratedQr(qrDataUrl);
      setUrl(''); 

    } catch (error) {
      console.error("Error generating QR:", error);
      alert("Failed to generate link. Check console for details.");
    }

    setLoading(false);
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#f4f4f5] p-6 lg:p-12">
      <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto border-b-2 border-gray-200 pb-6">
        <h1 className="text-3xl font-display font-black tracking-tight uppercase text-brand-dark">
          <FontAwesomeIcon icon={faTree} className="text-brand-pop mr-3" />
          Vox.ly
        </h1>
        <button 
          onClick={logout} 
          className="text-sm font-bold text-gray-500 hover:text-brand-pop transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          Log Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Creation Form */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-brand-dark">
          <h2 className="text-2xl font-bold mb-6 font-display uppercase tracking-wide">Plant a New Link</h2>
          
          <form onSubmit={handleGenerate} className="space-y-8">
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">
                <FontAwesomeIcon icon={faLink} className="mr-2" />
                Destination URL
              </label>
              <input 
                type="url" 
                required 
                placeholder="https://enzo.fyi"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-4 bg-gray-100 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Select Tree Species</label>
              <div className="grid grid-cols-1 gap-3">
                {treeOptions.map(tree => (
                  <label 
                    key={tree.id} 
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all font-bold flex items-center justify-between
                      ${treeType === tree.id 
                        ? 'border-brand-pop bg-[#fff0f4] text-brand-pop shadow-md scale-[1.02]' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="treeType" 
                        value={tree.id}
                        checked={treeType === tree.id}
                        onChange={(e) => setTreeType(e.target.value)}
                        className="w-4 h-4 text-brand-pop accent-brand-pop"
                      />
                      {tree.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button 
              disabled={loading || !url} 
              className="w-full bg-brand-dark text-white font-black uppercase tracking-widest py-5 rounded-xl hover:bg-brand-pop hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
            >
              <FontAwesomeIcon icon={faQrcode} className="mr-3" />
              {loading ? 'Generating...' : 'Generate 3D QR Code'}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col items-center justify-center bg-[#e4e4e7] p-8 rounded-3xl border-4 border-dashed border-gray-400 min-h-[500px]">
          {generatedQr ? (
            <div className="text-center space-y-6 w-full max-w-sm animate-[fadeIn_0.5s_ease-out]">
              <h3 className="text-2xl font-black font-display text-brand-dark uppercase">Ready to Grow!</h3>
              
              <div className="bg-white p-6 rounded-3xl shadow-2xl inline-block border-4 border-white rotate-1 hover:rotate-0 transition-transform">
                <img src={generatedQr} alt="Your Generated QR Code" className="w-full h-auto" />
              </div>
              
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Scanner Link</p>
                <a href={shortLink} target="_blank" rel="noreferrer" className="text-brand-pop font-bold break-all hover:underline text-sm">
                  {shortLink}
                </a>
              </div>
              
              <a 
                href={generatedQr} 
                download="voxly-qr.png"
                className="flex items-center justify-center gap-2 w-full bg-white border-4 border-brand-dark text-brand-dark font-black uppercase py-4 rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Image
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400 space-y-4">
              <div className="text-8xl opacity-50"><FontAwesomeIcon icon={faTree} /></div>
              <p className="font-bold text-lg">Enter a URL to plant your tree.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
