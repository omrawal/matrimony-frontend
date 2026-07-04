import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  // --- NEW: CONTACT MODAL STATE ---
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState(null);
  const [contactError, setContactError] = useState('');
  const [loadingContact, setLoadingContact] = useState(false);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/users/${id}/`, {
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

  // --- NEW: FETCH SECURE CONTACT DETAILS ---
  const fetchContactDetails = async () => {
    setLoadingContact(true);
    setContactError('');
    setShowContactModal(true); // Open modal immediately so user sees loading state
    
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/users/${id}/contact/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setContactDetails(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setContactError(err.response.data.error || 'Daily limit reached.');
      } else {
        setContactError('Failed to load contact details securely.');
      }
    } finally {
      setLoadingContact(false);
    }
  };

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
              onClick={() => setLightboxImg(member.profile_picture)} 
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
          <p className="text-xs text-gray-400">📍 Residing in {member.location || 'N/A'}</p>
        </div>
        
        {/* NEW: Replaced connection button with "View Contact Details" */}
        <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchContactDetails}
            className="flex-1 sm:w-48 py-3 px-4 bg-primary hover:bg-primary-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            📞 View Contact Details
          </button>
          <button className="flex-1 sm:w-48 py-2.5 px-4 border border-gray-200 dark:border-[#3a3634] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#2b2725] transition-colors">
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
                    onClick={() => setLightboxImg(url)} 
                    className="aspect-square bg-gray-100 dark:bg-[#2b2725] rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer shadow-sm relative group"
                  >
                    <img src={url} alt={`Album ${idx + 1}`} className="w-full h-full object-cover" />
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
        </div>
      </div>

      {/* --- CONTACT DETAILS MODAL --- */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity" onClick={() => setShowContactModal(false)}>
          <div 
            className="relative max-w-lg w-full bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
            >
              &times;
            </button>
            
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#2b2725] pb-3 mb-6">
              Family & Contact Details
            </h2>

            {loadingContact ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : contactError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-center">
                <span className="text-2xl block mb-2">🛑</span>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>
                <button onClick={() => setShowContactModal(false)} className="mt-4 px-4 py-2 bg-white dark:bg-black rounded text-xs font-bold border dark:border-gray-700">Close</button>
              </div>
            ) : contactDetails ? (
              <div className="space-y-6">
                
                {/* Contact Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-[#1f1b18] p-3 rounded-lg border border-gray-100 dark:border-[#2b2725]">
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Primary Phone</span>
                    <span className="font-semibold dark:text-white">{contactDetails.phone_number || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1f1b18] p-3 rounded-lg border border-gray-100 dark:border-[#2b2725] truncate">
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</span>
                    <span className="font-semibold dark:text-white">{contactDetails.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Family Details List */}
                <ul className="space-y-3 text-sm border-t border-gray-100 dark:border-[#2b2725] pt-4">
                  <li className="flex justify-between">
                    <span className="text-gray-500 font-medium">Time & Place of Birth:</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-right">{contactDetails.time_of_birth || 'N/A'} <br/> {contactDetails.place_of_birth || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500 font-medium">Astrology:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{contactDetails.astrology || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500 font-medium">Diet & Drink:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{contactDetails.diet || 'N/A'} • {contactDetails.drink || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between border-t border-dashed border-gray-200 dark:border-[#3a3634] pt-3 mt-3">
                    <span className="text-gray-500 font-medium">Mother's Details:</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-right">{contactDetails.mother_name || 'N/A'} <br/> <span className="text-xs font-normal text-primary">{contactDetails.mother_contact || 'No contact provided'}</span></span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500 font-medium">Father's Details:</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-right">{contactDetails.father_name || 'N/A'} <br/> <span className="text-xs font-normal text-primary">{contactDetails.father_contact || 'No contact provided'}</span></span>
                  </li>
                </ul>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-opacity" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxImg(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white text-4xl font-light transition-colors">&times;</button>
            <img src={lightboxImg} alt="Enlarged User Album" className="max-h-[90vh] w-auto object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}