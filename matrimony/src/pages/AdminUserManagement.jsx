import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // NEW STATE: Track photo upload
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/admin/manage-users/`, {
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
      first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number,
      cast: user.cast, location: user.location, bio: user.bio, is_hidden: user.is_hidden,
      education: user.education, profession: user.profession,
      height: user.height, weight: user.weight, complexion: user.complexion,
      time_of_birth: user.time_of_birth, place_of_birth: user.place_of_birth, astrology: user.astrology,
      diet: user.diet, drink: user.drink, mother_name: user.mother_name, father_name: user.father_name
    });
  };

    const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/export-pdf/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `matrimony_users_summary_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF. Check console.');
      console.error('PDF download failed:', err);
    } finally {
      setIsDownloading(false);
    }
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
      const res = await axios.patch(`${API_URL}/admin/manage-users/${editingUser.id}/`, formData, {
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

      // 3. Save URL to User's Profile via Admin API
      await axios.post(`${API_URL}/admin/manage-users/${editingUser.id}/photos/add/`,
        { url: cloudinaryRes.data.secure_url },
        { headers: { Authorization: `Token ${token}` } }
      );

      // 4. Refresh specific user data
      const res = await axios.get(`${API_URL}/admin/manage-users/`, { headers: { Authorization: `Token ${token}` } });
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
      await axios.post(`${API_URL}/admin/manage-users/${editingUser.id}/photos/${action}/`, { url }, {
        headers: { Authorization: `Token ${token}` }
      });
      const res = await axios.get(`${API_URL}/admin/manage-users/`, { headers: { Authorization: `Token ${token}` } });
      const updatedUser = res.data.find(u => u.id === editingUser.id);
      setEditingUser(updatedUser);
    } catch (err) {
      alert("Action failed.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (!q) return true;
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q) ||
      (u.phone_number || '').toLowerCase().includes(q)
    );
  });

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['first_name', 'last_name', 'phone_number', 'email', 'location', 'cast', 'education', 'profession', 'height', 'weight', 'complexion', 'time_of_birth', 'place_of_birth', 'astrology', 'diet', 'drink', 'mother_name', 'father_name'].map(field => (
                <div key={field}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{field.replace(/_/g, ' ')}</label>
                  <input
                    type="text" name={field}
                    value={formData[field] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-[#2b2725] dark:border-gray-700 dark:text-white focus:outline-primary text-sm"
                  />
                </div>
              ))}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} rows="2" className="w-full p-2 border rounded bg-gray-50 dark:bg-[#2b2725] dark:border-gray-700 dark:text-white text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded hover:bg-primary-600">Save Master Record</button>
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
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6">
      <div className="mb-5 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight dark:text-white">Verified User Management</h1>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <Link to="/admin/create-user" className="inline-flex min-h-11 items-center justify-center px-3 sm:px-4 py-2 text-center text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow">
          + Create Profile
        </Link>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="inline-flex min-h-11 items-center justify-center px-3 sm:px-4 py-2 text-center text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition shadow disabled:opacity-50"
        >
          {isDownloading ? 'Generating...' : '⬇ Download PDF'}
        </button>
      </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, username, location..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm dark:border-gray-700 dark:bg-[#2b2725] dark:text-white focus:outline-primary"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-card dark:bg-[#1f1b18]">
            No users match your search.
          </div>
        ) : (
          filteredUsers.map(user => (
            <article key={user.id} className="rounded-xl bg-white p-4 shadow-card dark:bg-[#1f1b18]">
              <div className="flex min-w-0 items-center gap-3">
                <img src={user.profile_picture || 'https://via.placeholder.com/50'} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold dark:text-white">{user.full_name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                {user.is_hidden ? (
                  <span className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Hidden</span>
                ) : (
                  <span className="shrink-0 rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">Active</span>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3 text-sm dark:border-[#2b2725]">
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">BSS ID</dt>
                  <dd className="mt-1 truncate font-mono font-bold text-primary">{user.username}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</dt>
                  <dd className="mt-1 truncate text-gray-700 dark:text-gray-300">{user.location || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Visibility</dt>
                  <dd className="mt-1">
                    {(() => {
                      if (!user.visibility_expires_at) return <span className="text-gray-500">No expiry</span>;
                      const days = Math.floor((new Date(user.visibility_expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                      if (days < 0) return <span className="font-bold text-red-600">Expired</span>;
                      if (days < 30) return <span className="font-bold text-orange-600">{days}d left</span>;
                      return <span className="text-green-600">{days}d</span>;
                    })()}
                  </dd>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => openEditor(user)}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Manage User
                  </button>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

    <div className="hidden overflow-hidden rounded-xl bg-white shadow-card dark:bg-[#1f1b18] md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-[#2b2725] text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">BSS ID</th>
              <th className="p-4">Location</th>
              <th className="p-4">Visibility</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#2b2725]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-black/10 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={user.profile_picture || 'https://via.placeholder.com/50'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold dark:text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm font-bold text-primary">{user.username}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.location || 'N/A'}</td>
                  <td className="p-4 text-sm">
                    {(() => {
                      if (!user.visibility_expires_at) return <span className="text-gray-500">No expiry</span>;
                      const now = new Date();
                      const exp = new Date(user.visibility_expires_at);
                      const days = Math.floor((exp - now) / (1000*60*60*24));
                      if (days < 0) return <span className="text-red-600 font-bold">Expired</span>;
                      if (days < 30) return <span className="text-orange-600 font-bold">{days}d left</span>;
                      return <span className="text-green-600">{days}d</span>;
                    })()}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}