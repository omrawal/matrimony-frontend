import React, { useState } from 'react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    age: '',
    gender: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender) {
      alert('Please select your gender.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/users/', formData);
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please make sure you are 18 or older and filling all required fields.');
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-neutral-50 dark:bg-[#171412] py-12">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-sm text-primary font-medium tracking-wide">Join our community</p>
          <h1 className="text-3xl font-serif font-semibold text-gray-900 dark:text-white">Create your profile in minutes.</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
            Provide your details below and we’ll match you with compatible prospects.
          </p>
        </div>

        <div className="bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-xl p-6 shadow-premium">
          <h2 className="text-lg font-serif font-semibold mb-4 text-gray-950 dark:text-white">Register Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Split row layout for first name and last name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
                name="first_name"
                value={formData.first_name} 
                onChange={handleChange} 
                placeholder="First Name *" 
                required 
              />
              <input 
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
                name="last_name"
                value={formData.last_name} 
                onChange={handleChange} 
                placeholder="Last Name *" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input 
                type="number"
                className="col-span-1 w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
                name="age"
                value={formData.age} 
                onChange={handleChange} 
                placeholder="Age *" 
                min="18"
                required 
              />
              <select
                className="col-span-2 w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-primary"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled className="dark:bg-[#211d1a]">Select Gender *</option>
                <option value="male" className="dark:bg-[#211d1a]">Male</option>
                <option value="female" className="dark:bg-[#211d1a]">Female</option>
              </select>
            </div>

            <input 
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Username Login Key *" 
              required 
            />
            <input 
              type="password"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Secure Password *" 
              required 
            />
            <input 
              type="email"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent text-sm text-gray-900 dark:text-white focus:outline-primary" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email Address *" 
              required 
            />

            <div className="flex items-center justify-between pt-2">
              <Button type="submit">Create account</Button>
              <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                Already registered?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}