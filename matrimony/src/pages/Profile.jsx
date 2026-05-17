import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

export default function Profile() {
  const [profile, setProfile] = useState({ bio: '', location: '', cast: '', age: '' });
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API}/me/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(`${API}/users/${profile.id}/`, profile, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile(response.data);
      setIsEditing(false);
      alert('Profile updated configuration successfully!');
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-2xl shadow-premium overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-600 px-6 py-4 text-white">
        <h2 className="text-lg font-serif font-semibold">Personal Profile Center</h2>
        <p className="text-xs text-primary-50/70">Manage your presentation fields for prospective connections</p>
      </div>

      <div className="p-6 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Age</label>
                <input name="age" type="number" className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#3a3634] bg-transparent text-sm focus:outline-primary" value={profile.age || ''} onChange={handleChange} placeholder="e.g. 27" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Location</label>
                <input name="location" className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#3a3634] bg-transparent text-sm focus:outline-primary" value={profile.location || ''} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Community / Caste</label>
              <input name="cast" className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#3a3634] bg-transparent text-sm focus:outline-primary" value={profile.cast || ''} onChange={handleChange} placeholder="e.g. Brahmin" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">About Me / Bio</label>
              <textarea name="bio" rows={4} className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#3a3634] bg-transparent text-sm focus:outline-primary" value={profile.bio || ''} onChange={handleChange} placeholder="Describe yourself, your career, and your expectations..." />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
                Save Details
              </button>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 dark:border-[#3a3634] rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2b2725] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border-b border-gray-50 dark:border-[#2b2725] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Current Age</span>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{profile.age ? `${profile.age} Years` : 'Not configured'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Residing City</span>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{profile.location || 'Not set'}</p>
              </div>
            </div>

            <div className="border-b border-gray-50 dark:border-[#2b2725] pb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Community Affiliation</span>
              <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{profile.cast || 'Not configured'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Personal Narrative</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed italic">
                "{profile.bio || 'No personal profile background narrative configured yet.'}"
              </p>
            </div>

            <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-sm font-medium transition-colors">
              Modify Profile Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}