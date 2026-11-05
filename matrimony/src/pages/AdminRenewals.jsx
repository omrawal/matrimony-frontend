import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function AdminRenewals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingUser, setRenewingUser] = useState(null);
  const [renewDays, setRenewDays] = useState(365);

  const fetchRenewalPending = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/admin/renewal-pending/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch renewal pending users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewalPending();
  }, []);

  const handleRenew = async (userId, username) => {
    if (!window.confirm(`Renew visibility for ${username} by ${renewDays} days?`)) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/admin/renew-user/${userId}/`,
        { days: renewDays },
        { headers: { Authorization: `Token ${token}` } }
      );
      alert(`Visibility renewed for ${username}!`);
      setRenewingUser(null);
      fetchRenewalPending();
    } catch (err) {
      alert('Failed to renew visibility.');
      console.error(err);
    }
  };

  const getExpiryStatus = (user) => {
    if (!user.visibility_expires_at) return { label: 'No Expiry', color: 'bg-gray-100 text-gray-700' };
    const now = new Date();
    const expiry = new Date(user.visibility_expires_at);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { label: `Expired ${Math.abs(daysLeft)}d`, color: 'bg-red-100 text-red-700' };
    if (daysLeft < 30) return { label: `${daysLeft}d left`, color: 'bg-orange-100 text-orange-700' };
    return { label: `${daysLeft}d left`, color: 'bg-green-100 text-green-700' };
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Renewal Pending</h1>
        <div className="text-sm text-gray-500">
          {users.length} user(s) need attention
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-[#1f1b18] p-8 rounded-xl shadow text-center text-gray-500">
          No profiles pending renewal. All profiles are up to date!
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1f1b18] rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#2b2725] text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Profile</th>
                  <th className="p-4">BSS ID</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Visibility Status</th>
                  <th className="p-4">Expires At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2b2725]">
                {users.map(user => {
                  const status = getExpiryStatus(user);
                  const expiryDate = user.visibility_expires_at 
                    ? new Date(user.visibility_expires_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-black/10 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img 
                          src={user.profile_picture || 'https://via.placeholder.com/50'} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                        <div>
                          <p className="font-bold dark:text-white">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-primary">{user.username}</td>
                      <td className="p-4 capitalize">{user.gender}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.location || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${status.color}`}>
                          {status.label}
                        </span>
                        {user.renewal_pending && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                            ⚠ Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{expiryDate}</td>
                      <td className="p-4 text-right">
                        {renewingUser === user.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <select
                              value={renewDays}
                              onChange={(e) => setRenewDays(Number(e.target.value))}
                              className="border rounded px-2 py-1 text-sm dark:bg-[#2b2725] dark:border-gray-700"
                            >
                              <option value="180">6 months</option>
                              <option value="365">1 year</option>
                              <option value="730">2 years</option>
                            </select>
                            <button
                              onClick={() => handleRenew(user.id, user.username)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRenewingUser(null)}
                              className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-100 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRenewingUser(user.id)}
                            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-bold rounded-lg transition"
                          >
                            Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
