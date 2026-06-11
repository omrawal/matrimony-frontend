import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lightbox State
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchPendingUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/admin/pending-verifications/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // Inject 'selectedPhotos' into the data so all photos are ticked by default
      const usersWithSelections = res.data.map(u => ({
        ...u,
        selectedPhotos: [...u.profile_photos]
      }));
      
      setPendingUsers(usersWithSelections);
    } catch (err) {
      console.error("Failed to fetch verifications.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Toggle Checkbox Logic
  const togglePhotoSelection = (userId, photoUrl) => {
    setPendingUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const isSelected = user.selectedPhotos.includes(photoUrl);
        return {
          ...user,
          selectedPhotos: isSelected 
            ? user.selectedPhotos.filter(url => url !== photoUrl) // Remove if ticked
            : [...user.selectedPhotos, photoUrl]                  // Add if unticked
        };
      }
      return user;
    }));
  };

  const handleAction = async (user, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    // Ensure they didn't un-tick absolutely everything on approval
    if (action === 'approve' && user.selectedPhotos.length === 0) {
      alert("You must approve at least one photo.");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/admin/verify-user/${user.id}/`, { 
        action: action,
        approved_photos: action === 'approve' ? user.selectedPhotos : [] 
      }, { 
        headers: { Authorization: `Token ${token}` } 
      });
      
      setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
    } catch (err) {
      alert("Action failed.");
    }
  };

  // Helper to force image download directly to the admin's computer
  const forceDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Verification_Doc_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to download image.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold dark:text-white mb-8">Admin Verification Dashboard</h1>
      
      {pendingUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#1f1b18] p-8 rounded-xl shadow text-center text-gray-500">
          No pending verifications at the moment.
        </div>
      ) : (
        <div className="grid gap-8">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-white dark:bg-[#1f1b18] p-6 rounded-xl shadow-card flex flex-col md:flex-row gap-6">
              
              <div className="md:w-1/3 space-y-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{user.full_name}</h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <p className="text-gray-500 text-sm capitalize">Gender: {user.gender}</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => handleAction(user, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition"
                  >
                    Approve Selected
                  </button>
                  <button 
                    onClick={() => handleAction(user, 'reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="md:w-2/3 grid grid-cols-2 gap-4">
                {/* Profile Photos Column (With Checkboxes) */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-400 uppercase">
                    Select Profile Photos
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {user.profile_photos.map((url, idx) => {
                      const isSelected = user.selectedPhotos.includes(url);
                      return (
                        <div key={idx} className="relative group rounded overflow-hidden cursor-pointer">
                          <img 
                            src={url} 
                            alt="Profile" 
                            onClick={() => setLightboxImg(url)}
                            className={`w-full h-32 object-cover transition ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`} 
                          />
                          
                          {/* Checkbox Overlay */}
                          <div 
                            onClick={() => togglePhotoSelection(user.id, url)}
                            className="absolute top-2 left-2 w-6 h-6 bg-white rounded flex items-center justify-center border-2 shadow hover:scale-110 transition"
                          >
                            {isSelected && <span className="text-green-600 font-bold">✓</span>}
                          </div>

                          {/* Hover Enlarge Hint */}
                          <div 
                            onClick={() => setLightboxImg(url)}
                            className="absolute bottom-2 right-2 p-1 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            🔍 Expand
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ID Proofs Column (Read/Download Only) */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-400 uppercase">Secure ID Proofs</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {user.id_proofs.map((url, idx) => (
                      <div key={idx} className="relative group rounded overflow-hidden cursor-pointer border-2 border-red-500/50">
                        <img 
                          src={url} 
                          alt="ID Proof" 
                          onClick={() => setLightboxImg(url)}
                          className="w-full h-32 object-cover" 
                        />
                         <div 
                            onClick={() => setLightboxImg(url)}
                            className="absolute bottom-2 right-2 p-1 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            🔍 Expand
                          </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            
            {/* Close Button */}
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-3xl font-bold"
            >
              ×
            </button>
            
            {/* Download Button */}
            <button 
              onClick={() => forceDownload(lightboxImg)}
              className="absolute -top-10 left-0 bg-primary hover:bg-primary-600 text-white px-4 py-1 rounded shadow"
            >
              ⬇ Download Image
            </button>

            {/* The Image */}
            <img 
              src={lightboxImg} 
              alt="Enlarged Document" 
              className="max-h-[85vh] w-auto object-contain rounded" 
            />
          </div>
        </div>
      )}
    </div>
  );
}