import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    cast: '',
    location: '',
    preferences: '',
    bio: ''
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API}/me/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUser(res.data);
      setFormData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        age: res.data.age || '',
        cast: res.data.cast || '',
        location: res.data.location || '',
        preferences: res.data.preferences || '',
        bio: res.data.bio || ''
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- TEXT FIELDS LOGIC ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API}/me/`, formData, {
        headers: { Authorization: `Token ${token}` }
      });
      alert("Profile details updated successfully!");
      fetchProfile(); // Refresh to update standard display
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update details.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- PHOTO MANAGEMENT LOGIC ---
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Get Signature
      const sigRes = await axios.get(`${API}/upload-signature/?folder=matrimony_profiles`, {
        headers: { Authorization: `Token ${token}` }
      });
      const { signature, timestamp, api_key, cloud_name, folder } = sigRes.data;

      // 2. Upload to Cloudinary
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', api_key);
      uploadData.append('timestamp', timestamp);
      uploadData.append('signature', signature);
      uploadData.append('folder', folder);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        uploadData
      );

      // 3. Save URL to Backend
      await axios.post(`${API}/me/photos/add/`, 
        { url: cloudinaryRes.data.secure_url },
        { headers: { Authorization: `Token ${token}` } }
      );

      fetchProfile(); // Refresh the album
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoAction = async (url, action) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/me/photos/${action}/`, 
        { url: url },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchProfile(); // Refresh UI
    } catch (err) {
      console.error(`Action ${action} failed`, err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <h1 className="text-3xl font-serif font-bold dark:text-white">Manage My Profile</h1>

      {/* --- PHOTO GALLERY SECTION --- */}
      <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-end border-b border-gray-50 dark:border-[#2b2725] pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Photo Album</h2>
            <p className="text-sm text-gray-500">Manage your public photos. Set your favorite as the profile picture.</p>
          </div>
          <div>
            <input type="file" accept="image/*" id="photo-upload" className="hidden" onChange={handlePhotoUpload} />
            <label htmlFor="photo-upload" className="cursor-pointer px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-bold rounded-lg transition-colors shadow">
              {isUploading ? 'Uploading...' : '+ Add Photo'}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user.album && user.album.map((url, idx) => {
            const isProfilePic = url === user.profile_picture;
            return (
              <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-4 transition-all ${isProfilePic ? 'border-primary' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}>
                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                
                {/* Status Badge */}
                {isProfilePic && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                    Profile Pic
                  </div>
                )}

                {/* Hover Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!isProfilePic && (
                    <button 
                      onClick={() => handlePhotoAction(url, 'set-profile')}
                      className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-200 transition"
                    >
                      Make Profile Pic
                    </button>
                  )}
                  <button 
                    onClick={() => handlePhotoAction(url, 'delete')}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-red-600 transition"
                  >
                    Delete Photo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- TEXT DETAILS SECTION --- */}
      <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl p-6 shadow-card">
        <h2 className="text-xl font-bold dark:text-white border-b border-gray-50 dark:border-[#2b2725] pb-4 mb-6">Personal Details</h2>
        
        <form onSubmit={handleSaveDetails} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Community / Cast</label>
              <input type="text" name="cast" value={formData.cast} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">About Me (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Partner Preferences</label>
              <textarea name="preferences" value={formData.preferences} onChange={handleInputChange} rows="3" className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg transition-colors shadow">
              {isSaving ? 'Saving Changes...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}