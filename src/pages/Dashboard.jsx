import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import { generateTree, TREE_THEMES } from '../trees/VoxelEngine';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [treeType, setTreeType] = useState('cherryblossom');
  const [recentlyCreated, setRecentlyCreated] = useState(null);
  const [myLinks, setMyLinks] = useState([]);
  
  const [linkToDelete, setLinkToDelete] = useState(null);

  useEffect(() => {
    if (!currentUser) navigate('/login');
    if (currentUser) fetchMyLinks();
  }, [currentUser, navigate]);

  async function fetchMyLinks() {
    const q = query(collection(db, 'qrs'), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const links = [];
    querySnapshot.forEach((doc) => links.push({ id: doc.id, ...doc.data() }));
    setMyLinks(links.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
  }

  async function confirmDelete() {
    if (!linkToDelete) return;
    await deleteDoc(doc(db, 'qrs', linkToDelete));
    setMyLinks(myLinks.filter(link => link.id !== linkToDelete));
    setLinkToDelete(null);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'qrs'), {
        userId: currentUser.uid, destinationUrl: url, treeType, createdAt: serverTimestamp(), clicks: 0
      });
      const shortLink = `${window.location.origin}/qr/${docRef.id}`;
      
      const theme = TREE_THEMES[treeType];
      const qrDataUrl = await QRCode.toDataURL(shortLink, {
        width: 300, margin: 2, color: { dark: theme.qrDark, light: theme.qrLight }
      });

      setRecentlyCreated({ link: shortLink, img: qrDataUrl });
      setUrl(''); 
    } catch (error) {
      alert("Failed to grow link.");
    }
    setLoading(false);
  }

  const previewVoxels = useMemo(() => {
    const matrix = QRCode.create(url || "https://vox.ly", { errorCorrectionLevel: 'M' });
    return generateTree(treeType, matrix.modules.data, matrix.modules.size);
  }, [url, treeType]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200">
      
      {linkToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl ring-1 ring-slate-900/5 text-center animate-[fadeInUp_0.2s_ease-out]">
            <h3 className="font-serif text-2xl text-slate-800 mb-2">Uproot this tree?</h3>
            <p className="text-slate-500 mb-8 text-sm">This action cannot be undone. The link will immediately stop working.</p>
            <div className="flex gap-4">
              <button onClick={() => setLinkToDelete(null)} className="flex-1 py-3 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="max-w-6xl mx-auto pt-8 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-emerald-900 tracking-wide">Vox.ly</h1>
        <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Sign Out
        </button>
      </header>

      <main className="max-w-4xl mx-auto mt-16 px-6 pb-24">
        
        <div className="flex gap-12 mb-12 border-b border-slate-200 px-4">
          <button onClick={() => setActiveTab('create')} className={`pb-4 text-lg font-medium transition-all ${activeTab === 'create' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
            Cultivate
          </button>
          <button onClick={() => setActiveTab('links')} className={`pb-4 text-lg font-medium transition-all ${activeTab === 'links' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
            My Forest
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-full h-96 bg-white/50 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 overflow-hidden">
              <Canvas shadows camera={{ position: [50, 60, 50], zoom: 8 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
                <Environment preset="city" />
                <group rotation={[0, Date.now() * 0.0005, 0]}>
                  <group>
                    {previewVoxels.base.map((v, i) => (
                      <mesh key={`base-${i}`} position={v.pos} receiveShadow>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={v.color} roughness={1} />
                      </mesh>
                    ))}
                  </group>
                  <group>
                    {previewVoxels.tree.map((v, i) => (
                      <mesh key={`tree-${i}`} position={v.pos} castShadow receiveShadow>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={v.color} roughness={0.9} />
                      </mesh>
                    ))}
                  </group>
                </group>
                <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={1.5} minZoom={4} maxZoom={20} />
              </Canvas>
            </div>

            <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-10">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Destination Link</label>
                <input 
                  type="url" required placeholder="Where should this tree lead?" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 ml-2">Botanical Species</label>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-4 px-2 -mt-4 custom-scrollbar">
                  {Object.entries(TREE_THEMES).map(([id, theme]) => (
                    <button
                      key={id} type="button" onClick={() => setTreeType(id)}
                      className={`flex-1 min-w-[120px] py-4 rounded-2xl transition-all flex flex-col items-center gap-3
                        ${treeType === id ? 'bg-emerald-50 ring-2 ring-emerald-500 text-emerald-900 shadow-md -translate-y-1' : 'bg-white ring-1 ring-slate-900/5 text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'}`}
                    >
                      <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: theme.leaf[0] }}></div>
                      <span className="font-medium text-sm">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={loading || !url} className="w-full bg-slate-900 text-white font-medium py-5 rounded-2xl hover:bg-slate-800 hover:shadow-xl transition-all disabled:opacity-50">
                {loading ? 'Cultivating...' : 'Grow Interactive Code'}
              </button>
            </form>

            {recentlyCreated && (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 text-center animate-[fadeIn_0.5s_ease-out]">
                <h3 className="font-serif text-2xl text-emerald-900 mb-6">It is ready.</h3>
                <img src={recentlyCreated.img} alt="Colored QR" className="w-48 h-48 mx-auto mb-6 rounded-xl shadow-sm" />
                <a href={recentlyCreated.link} target="_blank" rel="noreferrer" className="block text-emerald-600 font-medium mb-6 hover:underline truncate px-4">
                  {recentlyCreated.link}
                </a>
                <a href={recentlyCreated.img} download="voxly-tree.png" className="block w-full bg-emerald-50 text-emerald-700 font-medium py-3 rounded-xl hover:bg-emerald-100 transition-colors">
                  Download Image
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            {myLinks.length === 0 ? (
               <div className="text-center py-20 text-slate-400 font-medium">Your forest is currently empty.</div>
            ) : (
              myLinks.map((link) => (
                <div key={link.id} className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-900/5 flex items-center justify-between transition-all hover:shadow-md">
                  <div className="overflow-hidden pr-4">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wide">{TREE_THE.MES[link.treeType]?.name || 'Tree'}</span>
                    <a href={link.destinationUrl} target="_blank" rel="noreferrer" className="text-lg font-medium text-slate-800 block hover:text-emerald-600 transition-colors truncate">
                      {link.destinationUrl}
                    </a>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <a href={`${window.location.origin}/qr/${link.id}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800 font-medium text-sm bg-emerald-50 px-4 py-2 rounded-lg transition-colors">View</a>
                    <button onClick={() => setLinkToDelete(link.id)} className="text-red-500 hover:text-red-700 font-medium text-sm bg-red-50 px-4 py-2 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
