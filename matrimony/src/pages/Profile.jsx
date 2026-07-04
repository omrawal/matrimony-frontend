import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import Select from 'react-select';
import { FILTER_LOCATION_OPTIONS, FILTER_CAST_OPTIONS } from '../utils/constants';

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
      const res = await axios.get(`${API_URL}/me/`, {
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
      await axios.patch(`${API_URL}/me/`, formData, {
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
      const sigRes = await axios.get(`${API_URL}/upload-signature/?folder=matrimony_profiles`, {
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
      await axios.post(`${API_URL}/me/photos/add/`,
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
      await axios.post(`${API_URL}/me/photos/${action}/`,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 dark:bg-[#2b2725] p-4 rounded-xl border border-gray-200 dark:border-[#3a3634]">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Matrimony ID</label>
            <input type="text" value={user.username} disabled className="w-full p-2 bg-transparent text-gray-500 font-mono font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Full Name</label>
            <input type="text" value={`${user.first_name} ${user.last_name}`} disabled className="w-full p-2 bg-transparent text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Phone Number</label>
            <input type="text" value={user.phone_number} disabled className="w-full p-2 bg-transparent text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address</label>
            <input type="text" value={user.email} disabled className="w-full p-2 bg-transparent text-gray-500" />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-red-500 italic">Core identity fields cannot be modified. Contact support for critical changes.</p>
          </div>
        </div>
        <form onSubmit={handleSaveDetails} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Use react-select for editable Dropdowns to ensure Data Consistency */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Community / Cast</label>
              <Select options={FILTER_CAST_OPTIONS} value={FILTER_CAST_OPTIONS.find(o => o.value === formData.cast)} onChange={(o) => setFormData({ ...formData, cast: o.value })} className="text-sm text-black" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Location</label>
              <Select options={FILTER_LOCATION_OPTIONS} value={FILTER_LOCATION_OPTIONS.find(o => o.value === formData.location)} onChange={(o) => setFormData({ ...formData, location: o.value })} className="text-sm text-black" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Highest Education</label>
              <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Current Profession</label>
              <input type="text" name="profession" value={formData.profession} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">About Me (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full p-3 bg-gray-50 dark:bg-[#2b2725] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Expectations from Partner</label>
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