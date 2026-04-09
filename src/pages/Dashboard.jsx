import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faLink, faQrcode, faTree, faTrash, faCopy, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import TreePreview from '../components/TreePreview';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'links'
  const [loading, setLoading] = useState(false);
  
  // Create Tab State
  const [url, setUrl] = useState('');
  const [treeType, setTreeType] = useState('cherryblossom');
  const [recentlyCreatedLink, setRecentlyCreatedLink] = useState(null);

  // My Links Tab State
  const [myLinks, setMyLinks] = useState([]);
  const [fetchingLinks, setFetchingLinks] = useState(false);

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Fetch Links when switching to the 'links' tab
  useEffect(() => {
    if (activeTab === 'links' && currentUser) {
      fetchMyLinks();
    }
  }, [activeTab, currentUser]);

  async function fetchMyLinks() {
    setFetchingLinks(true);
    try {
      const q = query(collection(db, 'qrs'), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const links = [];
      querySnapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first (handling potential missing timestamps initially)
      links.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMyLinks(links);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    }
    setFetchingLinks(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to chop down this tree?")) return;
    try {
      await deleteDoc(doc(db, 'qrs', id));
      setMyLinks(myLinks.filter(link => link.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  }

  const treeOptions = [
    { id: 'cherryblossom', name: 'Cherry', color: 'bg-pink-500' },
    { id: 'pine', name: 'Pine', color: 'bg-green-700' },
    { id: 'dragon', name: 'Dragon', color: 'bg-lime-500' },
    { id: 'maple', name: 'Maple', color: 'bg-orange-500' },
    { id: 'juniper', name: 'Juniper', color: 'bg-teal-800' }
  ];

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'qrs'), {
        userId: currentUser.uid,
        destinationUrl: url,
        treeType: treeType,
        createdAt: serverTimestamp(),
        clicks: 0
      });

      const shortLink = `${window.location.origin}/qr/${docRef.id}`;
      setRecentlyCreatedLink(shortLink);
      setUrl(''); 
      
      // Optionally auto-switch to links tab
      // setActiveTab('links');

    } catch (error) {
      alert("Failed to generate link.");
    }
    setLoading(false);
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans text-brand-dark pb-20 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Header */}
      <header className="bg-white border-b-8 border-brand-dark px-6 py-4 flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-display font-black tracking-tight uppercase flex items-center gap-3">
          <div className="bg-brand-pop text-white w-10 h-10 flex items-center justify-center border-4 border-brand-dark shadow-[4px_4px_0px_rgba(26,26,26,1)]">
            <FontAwesomeIcon icon={faTree} />
          </div>
          Vox.ly
        </h1>
        <button onClick={logout} className="font-black uppercase text-sm border-b-4 border-transparent hover:border-brand-pop transition-all flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} /> Log Out
        </button>
      </header>

      <main className="max-w-4xl mx-auto mt-12 px-6 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 font-black uppercase tracking-widest text-lg border-4 border-brand-dark transition-all ${activeTab === 'create' ? 'bg-brand-pop text-white shadow-[8px_8px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-white text-brand-dark hover:bg-gray-100'}`}
          >
            Plant a Tree
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-4 font-black uppercase tracking-widest text-lg border-4 border-brand-dark transition-all ${activeTab === 'links' ? 'bg-brand-pop text-white shadow-[8px_8px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-white text-brand-dark hover:bg-gray-100'}`}
          >
            My Forest
          </button>
        </div>

        {/* Tab 1: Create */}
        {activeTab === 'create' && (
          <div className="bg-white p-8 border-8 border-brand-dark shadow-[16px_16px_0px_rgba(26,26,26,1)] animate-[fadeIn_0.3s_ease-out]">
            
            {/* 3D Visualization Header */}
            <div className="mb-8">
              <TreePreview url={url} treeType={treeType} />
            </div>

            <form onSubmit={handleGenerate} className="space-y-8">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-black uppercase mb-3 tracking-widest text-gray-500">
                  <FontAwesomeIcon icon={faLink} className="mr-2" />
                  Destination URL
                </label>
                <input 
                  type="url" required placeholder="https://your-website.com" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-5 bg-[#f4f4f5] border-4 border-brand-dark font-mono outline-none focus:bg-white focus:border-brand-pop transition-colors text-lg"
                />
              </div>

              {/* Side-by-Side Tree Selectors */}
              <div>
                <label className="block text-sm font-black uppercase mb-3 tracking-widest text-gray-500">Select Species</label>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {treeOptions.map(tree => (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() => setTreeType(tree.id)}
                      className={`flex-1 min-w-[100px] py-4 border-4 transition-all font-black uppercase text-sm flex flex-col items-center gap-2
                        ${treeType === tree.id 
                          ? 'border-brand-dark bg-white shadow-[4px_4px_0px_rgba(26,26,26,1)] -translate-y-1' 
                          : 'border-transparent bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-brand-dark ${tree.color}`}></div>
                      {tree.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                disabled={loading || !url} 
                className="w-full bg-brand-dark text-white font-black uppercase tracking-widest py-6 text-xl border-4 border-brand-dark hover:bg-brand-pop hover:shadow-[8px_8px_0px_rgba(26,26,26,1)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? 'Planting...' : 'Generate Interactive Link'}
              </button>
            </form>

            {/* Success Feedback */}
            {recentlyCreatedLink && (
              <div className="mt-8 p-6 bg-[#f0fdf4] border-4 border-[#166534] text-center">
                <h3 className="font-black uppercase text-xl text-[#166534] mb-2">Success! Tree Planted.</h3>
                <p className="font-mono text-sm mb-4 break-all">{recentlyCreatedLink}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(recentlyCreatedLink)}
                  className="bg-[#166534] text-white px-6 py-2 font-black uppercase text-sm hover:bg-[#14532d]"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Links */}
        {activeTab === 'links' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {fetchingLinks ? (
              <div className="text-center font-black uppercase text-2xl py-20 text-gray-400">Loading Forest...</div>
            ) : myLinks.length === 0 ? (
              <div className="bg-white p-12 border-8 border-brand-dark shadow-[16px_16px_0px_rgba(26,26,26,1)] text-center">
                <FontAwesomeIcon icon={faTree} className="text-6xl text-gray-200 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-widest text-brand-dark mb-4">Your forest is empty</h2>
                <button onClick={() => setActiveTab('create')} className="text-brand-pop font-black uppercase border-b-4 border-brand-pop">Go plant a tree</button>
              </div>
            ) : (
              myLinks.map((link) => (
                <div key={link.id} className="bg-white p-6 border-4 border-brand-dark shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:-translate-y-1 transition-transform">
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-brand-dark text-white px-3 py-1 font-black uppercase text-xs">{link.treeType}</span>
                      <span className="text-gray-400 font-bold text-sm">{new Date(link.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                    <a href={link.destinationUrl} target="_blank" rel="noreferrer" className="text-xl font-bold truncate block hover:text-brand-pop transition-colors">
                      {link.destinationUrl}
                    </a>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <a 
                      href={`${window.location.origin}/qr/${link.id}`} target="_blank" rel="noreferrer"
                      className="flex-1 md:flex-none text-center bg-gray-100 border-2 border-brand-dark px-4 py-3 font-black uppercase text-sm hover:bg-brand-pop hover:text-white hover:border-brand-pop transition-colors"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} /> View
                    </a>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/qr/${link.id}`)}
                      className="flex-1 md:flex-none text-center bg-gray-100 border-2 border-brand-dark px-4 py-3 font-black uppercase text-sm hover:bg-brand-dark hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faCopy} /> Copy
                    </button>
                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="text-center bg-red-100 text-red-600 border-2 border-red-600 px-4 py-3 font-black hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
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
