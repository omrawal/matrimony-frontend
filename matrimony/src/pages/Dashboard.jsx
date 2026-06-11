import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import { API_URL } from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardContent = async () => {
      const token = localStorage.getItem('token');
      try {
        const userRes = await axios.get(`${API_URL}/me/`, { headers: { Authorization: `Token ${token}` } });
        setUser(userRes.data);

        const matchesRes = await axios.get(`${API_URL}/users/`, { headers: { Authorization: `Token ${token}` } });
        setMatches(matchesRes.data);

        const visitorsRes = await axios.get(`${API_URL}/visitors/`, { headers: { Authorization: `Token ${token}` } });
        setVisitors(visitorsRes.data);
      } catch (err) {
        console.error("Dashboard synchronization error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardContent();
  }, []);

  if (!user) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#4A1525] to-primary rounded-2xl p-6 md:p-8 text-white shadow-premium relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <span className="text-[180px]">💍</span>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="text-amber-wedding text-xs uppercase tracking-widest font-bold">Welcome Back</span>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">Namaste, {user.full_name}!</h1>
          <p className="text-primary-50/80 text-sm font-light leading-relaxed">
            "{user.bio || 'Your journey toward a lifetime connection begins here. Complete your discovery fields to view premium listings.'}"
          </p>
        </div>
      </div>

      {/* Content Layout Split Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Matches Feed */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#2b2725] pb-2">
            Premium Recommendations For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map(match => (
              <MatchCard key={match.id} profile={match} />
            ))}
          </div>
        </div>

        {/* Dynamic Visitor Tracker Sidebar Panel */}
        <div className="space-y-4">
          <h2 className="text-base font-serif font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#2b2725] pb-2 flex items-center justify-between">
            <span>Profile Visitors</span>
            <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-sans font-bold">{visitors.length}</span>
          </h2>

          <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-xl p-2 max-h-[400px] overflow-y-auto space-y-1 shadow-card">
            {visitors.length > 0 ? (
              visitors.map(log => (
                <div 
                  key={log.id} 
                  /* FIX APPLIED HERE: Added onClick navigation and hover styles */
                  onClick={() => navigate(`/member/${log.visitor_details.id}`)}
                  className="flex items-center gap-4 p-3 border-b border-gray-50 dark:border-[#2b2725] last:border-0 hover:bg-gray-50 dark:hover:bg-black/20 cursor-pointer transition-colors rounded-lg group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-[#2b2725] flex items-center justify-center border border-gray-200 dark:border-[#3a3634] flex-shrink-0">
                    {log.visitor_details.profile_picture ? (
                      <img
                        src={log.visitor_details.profile_picture}
                        alt={log.visitor_details.full_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xl opacity-50">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {log.visitor_details.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6 italic">No recent views logged against your profile.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}