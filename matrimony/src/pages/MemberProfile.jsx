import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for the lightbox popup
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API}/users/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setMember(response.data);
      } catch (err) {
        console.error("Failed fetching member details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberProfile();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!member) return (
    <div className="text-center py-12 bg-white dark:bg-[#1f1b18] rounded-xl border border-gray-100 dark:border-[#2b2725]">
      <p className="text-gray-500 text-sm">Profile details could not be located or are restricted.</p>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-xs font-semibold text-primary underline">Return to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header / Avatar Section */}
      <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-premium flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#2b2725] flex items-center justify-center text-4xl overflow-hidden border-2 border-primary/20">
          {member.profile_picture ? (
            <img 
              src={member.profile_picture} 
              alt={member.full_name} 
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxImg(member.profile_picture)} // Open profile pic in lightbox too
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{member.full_name}</h1>
            <span className="px-2.5 py-0.5 bg-amber-wedding/10 text-amber-wedding border border-amber-wedding/20 text-[10px] font-bold tracking-wider uppercase rounded-full">Premium Match</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {member.age || 'N/A'} Yrs • {member.cast || 'Community Not Disclosed'}
          </p>
          <p className="text-xs text-gray-400">📍 Residing in {member.location || 'Mumbai, India'}</p>
        </div>
        <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:w-40 py-2.5 px-4 bg-primary hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
            Send Connection Request
          </button>
          <button className="flex-1 sm:w-40 py-2.5 px-4 border border-gray-200 dark:border-[#3a3634] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#2b2725] transition-colors">
            Shortlist Profile
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 dark:border-[#2b2725] pb-2 mb-3">Personal Narrative</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
              "{member.bio || 'No public narrative bio uploaded by member yet.'}"
            </p>
          </div>

          <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-[#2b2725] pb-2 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Photo Album</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                {member.album?.length || 0} Photos
              </span>
            </div>
            
            {member.album && member.album.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {member.album.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImg(url)} // Trigger lightbox
                    className="aspect-square bg-gray-100 dark:bg-[#2b2725] rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer shadow-sm relative group"
                  >
                    <img src={url} alt={`Album ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Hover text indicator */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold tracking-wide">
                      🔍 Expand
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6 bg-gray-50 dark:bg-[#2b2725] rounded-xl">
                This member hasn't uploaded any public photos.
              </p>
            )}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 dark:border-[#2b2725] pb-2 mb-3">Partner Preferences</h3>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500"><strong className="text-gray-700 dark:text-gray-300 font-medium">Desired Qualities:</strong></p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{member.preferences || 'Open to all backgrounds.'}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#241B1E] to-[#171412] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 text-white text-center shadow-card relative overflow-hidden">
            <span className="text-xl block">📹</span>
            <h4 className="text-xs font-semibold mt-2 tracking-wide text-amber-wedding uppercase">Video Introduction</h4>
            <p className="text-[11px] text-gray-400 mt-1">Interactive media intro reels are currently in deployment verification steps.</p>
          </div>
        </div>
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setLightboxImg(null)} // Close when clicking the background
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center" 
            onClick={e => e.stopPropagation()} // Prevent clicks on the image from closing the background
          >
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white text-4xl font-light transition-colors"
            >
              &times;
            </button>
            <img 
              src={lightboxImg} 
              alt="Enlarged User Album" 
              className="max-h-[90vh] w-auto object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}

    </div>
  );
}