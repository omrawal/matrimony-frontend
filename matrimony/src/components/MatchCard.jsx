import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchCard({ profile }) {
  const navigate = useNavigate();

  return (
    <article className="bg-white dark:bg-[#1f1b18] border border-gray-100 dark:border-[#2b2725] rounded-xl p-5 shadow-card hover:shadow-premium transition-all relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-wedding opacity-0 group-hover:opacity-100 transition-opacity" />
      
      
      <div 
        onClick={() => navigate(`/member/${profile.id}`)}
        className="flex items-start gap-4 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-soft to-gray-100 dark:from-[#2b2725] dark:to-[#171412] flex items-center justify-center flex-shrink-0 border border-primary/10">
          <span className="text-2xl opacity-70">👤</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-1">
            {profile.religion || 'Verified'}
          </span>
          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
            {profile.username}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {profile.location || 'Mumbai, IN'}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{profile.age} <span className="text-xs font-normal text-gray-400">Yrs</span></p>
          <p className="text-xs text-gray-400 mt-1 italic">{profile.cast || 'Community'}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 relative z-10">
        <button className="flex-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-xs tracking-wide transition-colors shadow-sm">
          Connect Now
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3a3634] text-gray-600 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-[#2b2725] transition-colors">
          Shortlist
        </button>
      </div>
    </article>
  );
}