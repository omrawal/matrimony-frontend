import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';
import { API_URL } from '../utils/api';

export default function Shortlist() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlists = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/me/shortlists/`, { headers: { Authorization: `Token ${token}` } });
        setMatches(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlists();
  }, []);

  if (loading) return <div className="text-center py-24">Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif font-bold dark:text-white border-b dark:border-[#2b2725] pb-4">
        Your Shortlisted Profiles ({matches.length})
      </h1>
      
      {matches.length === 0 ? (
        <div className="bg-white dark:bg-[#1f1b18] rounded-xl p-10 text-center border border-gray-100 dark:border-[#2b2725]">
          <span className="text-4xl block mb-2">⭐</span>
          <p className="text-gray-500">You haven't shortlisted any profiles yet. Browse the dashboard to find matches!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(match => <MatchCard key={match.id} profile={match} />)}
        </div>
      )}
    </div>
  );
}