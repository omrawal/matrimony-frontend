import React, { useState } from 'react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gender) {
      alert('Please select your gender to continue.');
      return;
    }

    try {
      // Connect to your backend creation route with validation payload
      await axios.post('http://127.0.0.1:8000/api/users/', { 
        username, 
        password, 
        gender 
      });
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-neutral-50 dark:bg-[#171412]">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-sm text-primary font-medium tracking-wide">Join our community</p>
          <h1 className="text-3xl font-serif font-semibold text-gray-900 dark:text-white">Create your profile in minutes.</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
            Add a few details and we’ll help find compatible matches.
          </p>
        </div>

        <div className="bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-xl p-6 shadow-premium">
          <h2 className="text-lg font-serif font-semibold mb-4 text-gray-950 dark:text-white">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm focus:outline-primary dark:text-white" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              required 
            />
            <input 
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm focus:outline-primary dark:text-white" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
            />
            
            {/* Mandatory Matrimonial Custom Dropdown */}
            <select
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm focus:outline-primary text-gray-700 dark:text-gray-200"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled className="dark:bg-[#211d1a]">Select Your Gender *</option>
              <option value="male" className="dark:bg-[#211d1a]">Male</option>
              <option value="female" className="dark:bg-[#211d1a]">Female</option>
            </select>

            <div className="flex items-center justify-between pt-2">
              <Button type="submit">Create account</Button>
              <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}