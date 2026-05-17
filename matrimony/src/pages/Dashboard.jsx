import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';

const API = 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]); // Dynamic match state hooks
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');

      try {
        // 1. Fetch current profile configuration data
        const userResponse = await axios.get(`${API}/me/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setUser(userResponse.data);

        // 2. Fetch curated opposite-gender recommendations directly via backend queries
        const matchesResponse = await axios.get(`${API}/users/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setMatches(matchesResponse.data);
      } catch (error) {
        console.error('Error compiling dashboard components:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"/>
        <p className="text-sm text-gray-500 font-medium">Finding your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Premium Matrimonial Hero Banner */}
      <div className="bg-gradient-to-r from-[#4A1525] to-primary rounded-2xl p-6 md:p-8 text-white shadow-premium relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <span className="text-[180px]">💍</span>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="text-amber-wedding text-xs uppercase tracking-widest font-bold">Welcome Back</span>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">Namaste, {user.username}!</h1>
          <p className="text-primary-50/80 text-sm font-light leading-relaxed">
            "{user.bio || 'Your journey toward a lifetime connection begins here. Complete your discovery fields to view premium listings.'}"
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-primary-50/90">
            <span>📍 <strong>Location:</strong> {user.location || 'Not set'}</span>
            <span>👤 <strong>My Gender:</strong> <span className="capitalize">{user.gender || 'Not specified'}</span></span>
          </div>
        </div>
      </div>

      {/* Suggested Connection Columns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2b2725] pb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Premium Recommendations For You
            </h2>
            <p className="text-xs text-gray-500">
              Showing profiles matching your opposite gender parameters
            </p>
          </div>
          <span className="text-xs text-primary font-medium">Total Found: {matches.length}</span>
        </div>

        {loadingMatches ? (
          <p className="text-sm text-gray-400">Loading recommended partners...</p>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(match => (
              <MatchCard key={match.id} profile={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#2b2725] rounded-xl">
            <span className="text-3xl">✨</span>
            <p className="text-sm text-gray-500 mt-2">No matching profiles found at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}