import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';

const API = 'http://127.0.0.1:8000/api';

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
        const userRes = await axios.get(`${API}/me/`, { headers: { Authorization: `Token ${token}` } });
        setUser(userRes.data);

        const matchesRes = await axios.get(`${API}/users/`, { headers: { Authorization: `Token ${token}` } });
        setMatches(matchesRes.data);

        const visitorsRes = await axios.get(`${API}/visitors/`, { headers: { Authorization: `Token ${token}` } });
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
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
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
          {/* Changed user.username -> user.full_name */}
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

          <div className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-xl p-3 max-h-[400px] overflow-y-auto space-y-2 shadow-card">
            {visitors.length > 0 ? (
              visitors.map(log => (
                <div 
                  key={log.id} 
                  onClick={() => navigate(`/member/${log.visitor_details.id}`)}
                  className="flex items-center gap-3 border-b border-gray-50/50 dark:border-[#2b2725]/50 pb-2 last:border-none last:pb-0 cursor-pointer group p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-[#2b2725] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/5 text-xs flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Changed log.visitor_details.username -> log.visitor_details.full_name */}
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {log.visitor_details.full_name}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
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