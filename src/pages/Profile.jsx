import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth'; 
import { ArrowLeft, LogOut, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
// IMPORT the new Avatar Picker and the avatars array
import { AvatarPicker, avatars } from '../components/avatar-picker';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Look up the user's saved avatar ID (defaults to 1: Emerald Oak if they haven't picked one)
  const currentAvatarId = currentUser.photoURL ? parseInt(currentUser.photoURL) : 1;
  const currentAvatar = avatars.find(a => a.id === currentAvatarId) || avatars[0];

  async function handleSignOut() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  // Saves the selected Avatar ID directly to the user's Firebase Auth profile
  async function handleSaveAvatar(newId) {
    setIsSavingAvatar(true);
    setError('');
    try {
      await updateProfile(currentUser, {
        photoURL: newId.toString()
      });
      setShowAvatarPicker(false);
    } catch (err) {
      setError('Failed to update avatar: ' + err.message);
    }
    setIsSavingAvatar(false);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setError('');
    
    try {
      // 1. Wipe out all user data (trees) from Firestore
      const q = query(collection(db, 'qrs'), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();

      // 2. Delete the user's Authentication record
      await deleteUser(currentUser);
      
      navigate('/signup');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log out and log back in to verify your identity before deleting your account.');
      } else {
        setError('Failed to delete account. ' + err.message);
      }
    }
    
    setIsDeleting(false);
    setShowDeleteModal(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative">
      
      {/* AVATAR PICKER OVERLAY */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <AvatarPicker 
            currentAvatarId={currentAvatarId}
            onSave={handleSaveAvatar}
            onCancel={() => setShowAvatarPicker(false)}
            isSaving={isSavingAvatar}
          />
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-900/5 text-center animate-[fadeInUp_0.2s_ease-out]">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-serif text-2xl text-slate-800 mb-2">Burn the Forest?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              This action is permanent. Your account, custom slugs, and all interactive trees will be uprooted and deleted forever.
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-3 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDeleteAccount} 
                className="flex-1 py-3 font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-6xl mx-auto w-full pt-8 px-6 flex justify-between items-center">
        <Link to="/dashboard" className="text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-full shadow-sm ring-1 ring-slate-900/5 hover:shadow-md">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button onClick={handleSignOut} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-2xl mx-auto w-full mt-12 px-6 flex-grow animate-[fadeIn_0.5s_ease-out]">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-medium text-emerald-900 tracking-wide mb-2">Profile</h1>
          <p className="text-slate-500">Manage your botanical identity.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center ring-1 ring-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 mb-8">
          <div className="flex flex-col items-center">
            
            {/* DYNAMIC AVATAR DISPLAY */}
            <div className="relative mb-4 group">
              <div className="w-28 h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center ring-1 ring-slate-900/5 shadow-inner overflow-hidden transition-transform duration-300 group-hover:scale-105">
                 <div className="w-full h-full p-3 flex items-center justify-center">
                    {currentAvatar.svg}
                 </div>
              </div>
              <button 
                onClick={() => setShowAvatarPicker(true)}
                className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2.5 rounded-full shadow-md hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all ring-4 ring-white"
                title="Change Avatar"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mt-2">{currentUser.email}</h2>
            <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">{currentAvatar.alt} Cultivator</p>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-red-100 border border-red-50">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-6">
            Deleting your account will permanently erase all your generated trees, custom slugs, and analytics. This cannot be undone.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="w-full flex items-center justify-center gap-2 py-4 font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors ring-1 ring-red-200"
          >
            <Trash2 size={18} /> Delete Account
          </button>
        </div>

      </main>

      <footer className="w-full pb-8 text-center mt-12">
        <p className="text-sm text-slate-400 font-medium">
          Crafted by <a href="https://wa.me/918777845713" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition-colors">Shovith</a>
        </p>
      </footer>
    </div>
  );
}
