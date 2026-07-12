import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import Select from 'react-select';
import { API_URL } from '../utils/api';
import { FILTER_LOCATION_OPTIONS, FILTER_CAST_OPTIONS } from '../utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Preference Modal State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ pref_age_min: 18, pref_age_max: 40, pref_location: 'Any', pref_cast: 'Any' });

  const fetchDashboardContent = async () => {
    const token = localStorage.getItem('token');
    try {
      const userRes = await axios.get(`${API_URL}/me/`, { headers: { Authorization: `Token ${token}` } });
      setUser(userRes.data);
      setFilters({
        pref_age_min: userRes.data.pref_age_min || 18,
        pref_age_max: userRes.data.pref_age_max || 40,
        pref_location: userRes.data.pref_location || 'Any',
        pref_cast: userRes.data.pref_cast || 'Any'
      });

      const matchesRes = await axios.get(`${API_URL}/users/`, { headers: { Authorization: `Token ${token}` } });
      setMatches(matchesRes.data);

      const visitorsRes = await axios.get(`${API_URL}/visitors/`, { headers: { Authorization: `Token ${token}` } });
      setVisitors(visitorsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardContent(); }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_URL}/me/`, filters, { headers: { Authorization: `Token ${token}` } });
      setShowFilters(false);
      setLoading(true);
      fetchDashboardContent(); // Re-fetch to apply new filters!
    } catch (err) {
      alert("Failed to save preferences.");
    }
  };

  if (!user) return <div className="text-center py-24">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#4A1525] to-primary rounded-2xl p-6 md:p-8 text-white shadow-premium flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-amber-wedding text-xs uppercase tracking-widest font-bold">Welcome Back</span>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">Namaste, {user.full_name}!</h1>
        </div>
        <button onClick={() => setShowFilters(true)} className="relative z-10 bg-white/20 hover:bg-white/30 border border-white/40 px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-sm transition">
          ⚙️ Adjust Partner Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-serif font-semibold dark:text-white border-b border-gray-100 dark:border-[#2b2725] pb-2">
            Recommendations For You ({matches.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.length > 0 ? matches.map(match => <MatchCard key={match.id} profile={match} />) : <p className="text-gray-500 py-10">No matches found with current filters.</p>}
          </div>
        </div>

        {/* ... Sidebar code (Visitors) stays the same ... */}
      </div>

      {/* FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-[#1f1b18] w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b dark:border-gray-700 pb-2">Expectations from Partner</h2>
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Min Age</label>
                  <input type="number" min="18" value={filters.pref_age_min} onChange={(e) => setFilters({...filters, pref_age_min: e.target.value})} className="w-full p-2 border rounded dark:bg-[#2b2725] dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Max Age</label>
                  <input type="number" value={filters.pref_age_max} onChange={(e) => setFilters({...filters, pref_age_max: e.target.value})} className="w-full p-2 border rounded dark:bg-[#2b2725] dark:text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Location Preference</label>
                <Select 
                  options={FILTER_LOCATION_OPTIONS}
                  value={FILTER_LOCATION_OPTIONS.find(opt => opt.value === filters.pref_location)}
                  onChange={(opt) => setFilters({...filters, pref_location: opt.value})}
                  className="text-sm text-black"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Community Preference</label>
                <Select 
                  options={FILTER_CAST_OPTIONS}
                  value={FILTER_CAST_OPTIONS.find(opt => opt.value === filters.pref_cast)}
                  onChange={(opt) => setFilters({...filters, pref_cast: opt.value})}
                  className="text-sm text-black"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowFilters(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded font-bold">Apply Filters</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}