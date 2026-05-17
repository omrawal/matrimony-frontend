import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'http://127.0.0.1:8000/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginRes = await axios.post(`${API}/login/`, { username, password });
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user_id', loginRes.data.user_id);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#171412] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-2xl shadow-premium overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary to-primary-600 text-center text-white space-y-1">
          <h1 className="text-2xl font-serif font-bold">Suhāg Matrimony</h1>
          <p className="text-xs text-primary-50/80">Sign in to resume your partnership discovery</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Username</label>
            <input 
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm focus:outline-primary" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username" 
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Password</label>
            <input 
              type="password"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm focus:outline-primary" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>

          <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-medium text-sm rounded-lg transition-colors shadow-sm mt-2">
            Secure Log In
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            New to our community?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Create profile instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
}