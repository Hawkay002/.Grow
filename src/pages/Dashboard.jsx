import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [treeType, setTreeType] = useState('cherryblossom');
  const [loading, setLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [shortLink, setShortLink] = useState('');

  // Protect the route: Kick them to login if not authenticated
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

      // 2. Create the Short Link that points to OUR 3D scanner page
      // window.location.origin will dynamically be localhost:5173 or your Vercel domain
      const uniqueScannerLink = `${window.location.origin}/qr/${docRef.id}`;
      setShortLink(uniqueScannerLink);

      // 3. Generate the actual 2D QR code image for that short link
      const qrDataUrl = await QRCode.toDataURL(uniqueScannerLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a1a', // brand-dark
          light: '#ffffff'
        }
      });
      
      setGeneratedQr(qrDataUrl);
      setUrl(''); // Reset input

    } catch (error) {
      console.error("Error generating QR:", error);
      alert("Failed to generate link.");
    }

    setLoading(false);
  }

  if (!currentUser) return null; // Prevent flicker while redirecting

  return (
    <div className="min-h-screen bg-[#f4f4f5] p-6 lg:p-12">
      <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-black tracking-tight uppercase">Vox.ly Dashboard</h1>
        <button 
          onClick={logout} 
          className="text-sm font-bold text-gray-500 hover:text-brand-pop transition-colors"
        >
          Log Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Creation Panel */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-brand-dark">
          <h2 className="text-2xl font-bold mb-6">Plant a new link</h2>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Destination URL</label>
              <input 
                type="url" 
                required 
                placeholder="https://your-portfolio.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-4 bg-gray-100 border-2 border-transparent focus:border-brand-pop rounded-xl outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Select Tree Species</label>
              <div className="grid grid-cols-1 gap-2">
                {treeOptions.map(tree => (
                  <label 
                    key={tree.id} 
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all font-bold ${treeType === tree.id ? 'border-brand-pop bg-pink-50 text-brand-pop' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <input 
                      type="radio" 
                      name="treeType" 
                      value={tree.id}
                      checked={treeType === tree.id}
                      onChange={(e) => setTreeType(e.target.value)}
                      className="hidden"
                    />
                    {tree.name}
                  </label>
                ))}
              </div>
            </div>

            <button 
              disabled={loading || !url} 
              className="w-full bg-brand-dark text-white font-bold py-5 rounded-xl hover:bg-brand-pop transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate 3D QR Code'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col items-center justify-center bg-gray-200 p-8 rounded-3xl border-4 border-dashed border-gray-300">
          {generatedQr ? (
            <div className="text-center space-y-6 animate-fade-in-up">
              <h3 className="text-xl font-bold">Your QR Code is Ready!</h3>
              <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
                <img src={generatedQr} alt="Your Generated QR Code" className="w-64 h-64" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-500">Scanner Link:</p>
                <a href={shortLink} target="_blank" rel="noreferrer" className="text-brand-pop font-bold break-all hover:underline">
                  {shortLink}
                </a>
              </div>
              <a 
                href={generatedQr} 
                download="voxly-qr.png"
                className="block w-full bg-white border-2 border-brand-dark text-brand-dark font-bold py-3 rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
              >
                Download PNG
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400 space-y-4">
              <div className="text-6xl">🌱</div>
              <p className="font-bold">Enter a URL to generate your tree.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
