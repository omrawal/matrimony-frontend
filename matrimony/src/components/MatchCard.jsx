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
        {/* SIZING FIX: Changed to a fixed square with flex-shrink-0 and rounded corners */}
        <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-gray-50 dark:bg-[#2b2725] overflow-hidden flex items-center justify-center shadow-inner border border-gray-100 dark:border-[#3a3634]">
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.full_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-4xl opacity-50">👤</span>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-1">
            {profile.religion || 'Verified'}
          </span>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
            {profile.full_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {profile.location || 'Mumbai, IN'}</p>
        </div>

        <div className="text-right pt-1">
          <p className="text-xl font-bold text-primary leading-none">{profile.age}</p>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Yrs</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2 relative z-10 pt-4 border-t border-gray-50 dark:border-[#2b2725]">
        <button className="w-full sm:flex-1 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-sm tracking-wide transition-colors shadow-sm">
          Connect Now
        </button>
        <button className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#3a3634] text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#2b2725] transition-colors">
          Shortlist
        </button>
      </div>
    </article>
  );
}