import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // NEW STATE: Track photo upload
  const [isUploading, setIsUploading] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API}/admin/manage-users/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditor = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      age: user.age,
      cast: user.cast,
      location: user.location,
      bio: user.bio,
      is_hidden: user.is_hidden
    });
  };

  const closeEditor = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.patch(`${API}/admin/manage-users/${editingUser.id}/`, formData, {
        headers: { Authorization: `Token ${token}` }
      });
      alert("User updated successfully.");
      setEditingUser(res.data);
    } catch (err) {
      alert("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- NEW: ADMIN PHOTO UPLOAD HANDLER ---
  const handleAdminPhotoUpload = async (event) => {
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

      // 3. Save URL to User's Profile via Admin API
      await axios.post(`${API}/admin/manage-users/${editingUser.id}/photos/add/`,
        { url: cloudinaryRes.data.secure_url },
        { headers: { Authorization: `Token ${token}` } }
      );

      // 4. Refresh specific user data
      const res = await axios.get(`${API}/admin/manage-users/`, { headers: { Authorization: `Token ${token}` } });
      const updatedUser = res.data.find(u => u.id === editingUser.id);
      setEditingUser(updatedUser);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handlePhotoAction = async (url, action) => {
    if (action === 'delete' && !window.confirm("Delete this photo permanently?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/admin/manage-users/${editingUser.id}/photos/${action}/`, { url }, {
        headers: { Authorization: `Token ${token}` }
      });
      const res = await axios.get(`${API}/admin/manage-users/`, { headers: { Authorization: `Token ${token}` } });
      const updatedUser = res.data.find(u => u.id === editingUser.id);
      setEditingUser(updatedUser);
    } catch (err) {
      alert("Action failed.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // ==========================================
  // VIEW 1: THE EDITOR
  // ==========================================
  if (editingUser) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <button
          onClick={closeEditor}
          className="text-gray-500 hover:text-primary mb-2 flex items-center gap-2 font-bold transition-colors"
        >
          ← Back to User List
        </button>

        {/* Core Profile Data Card */}
        <div className="bg-white dark:bg-[#1f1b18] p-4 sm:p-6 rounded-xl shadow-card">
          {/* Header Row: Column on mobile, row on desktop */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-6 border-gray-100 dark:border-[#2b2725]">
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white truncate">
              Editing: {editingUser.full_name}
            </h2>

            {/* Toggle Switch Panel */}
            <label className="flex items-center justify-between md:justify-start gap-3 cursor-pointer bg-red-50 dark:bg-red-900/10 text-red-600 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30 w-full md:w-auto select-none">
              <span className="font-bold text-sm">Hide Profile from Public Feed</span>
              <input
                type="checkbox"
                name="is_hidden"
                checked={formData.is_hidden}
                onChange={handleInputChange}
                className="w-5 h-5 accent-red-600 flex-shrink-0"
              />
            </label>
          </div>

          {/* Form Structure - Multi-column fallback layouts */}
          <form onSubmit={handleSaveUser} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">First Name</label>
                <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} className="w-full p-3 border rounded-lg dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} className="w-full p-3 border rounded-lg dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Age</label>
                <input type="number" name="age" value={formData.age || ''} onChange={handleInputChange} className="w-full p-3 border rounded-lg dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full p-3 border rounded-lg dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} rows="3" className="w-full p-3 border rounded-lg dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 transition-colors shadow">
                {isSaving ? 'Saving...' : 'Save Text Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Photo Management Section Card */}
        <div className="bg-white dark:bg-[#1f1b18] p-4 sm:p-6 rounded-xl shadow-card mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6 border-gray-100 dark:border-[#2b2725]">
            <h3 className="text-lg font-bold dark:text-white">Manage Photos</h3>
            <div>
              <input type="file" accept="image/*" id="admin-photo-upload" className="hidden" onChange={handleAdminPhotoUpload} />
              <label htmlFor="admin-photo-upload" className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow">
                {isUploading ? 'Uploading...' : '+ Add Photo for User'}
              </label>
            </div>
          </div>

          {/* Grid changes from 2 columns on mobile to 4 on desktop dynamically */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {editingUser.album && editingUser.album.map((url, idx) => {
              const isProfilePic = url === editingUser.profile_picture;
              return (
                <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-4 transition-all ${isProfilePic ? 'border-primary' : 'border-transparent'}`}>
                  <img src={url} alt="User Album" className="w-full h-full object-cover" />
                  {isProfilePic && <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Main Pic</span>}

                  {/* Overlay Interaction Layer */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity duration-200">
                    {!isProfilePic && (
                      <button onClick={() => handlePhotoAction(url, 'set-profile')} className="text-xs bg-white text-black font-bold px-3 py-1.5 rounded shadow hover:bg-gray-100 transition">Set Main</button>
                    )}
                    <button onClick={() => handlePhotoAction(url, 'delete')} className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded shadow hover:bg-red-700 transition">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE USER LIST (DEFAULT)
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold dark:text-white mb-8">Verified User Management</h1>

      <div className="bg-white dark:bg-[#1f1b18] rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#2b2725] text-gray-500 text-sm uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2b2725]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-black/10 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={user.profile_picture || 'https://via.placeholder.com/50'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold dark:text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.location || 'N/A'}</td>
                  <td className="p-4">
                    {user.is_hidden ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Hidden</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditor(user)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Manage User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}