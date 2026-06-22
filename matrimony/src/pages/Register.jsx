import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    age: '',
    gender: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.gender) {
      return setErrorMessage('Please select your gender.');
    }
    if (formData.phone_number.length !== 10) {
      return setErrorMessage('Phone number must be exactly 10 digits.');
    }
    if (formData.password.length < 8) {
      return setErrorMessage('Password must be at least 8 characters long.');
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/users/`, formData);
      setGeneratedId(response.data.username);
      // navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const statusCode = err.response.status;

        // Ensure it's a 400 validation error (JSON) and NOT a 500 crash (HTML string)
        if (statusCode === 400 && typeof errorData === 'object') {
          const formattedErrors = Object.keys(errorData).map(field => {
            const fieldName = field.replace('_', ' ').toUpperCase();
            const message = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
            return `${fieldName}: ${message}`;
          });

          setErrorMessage(formattedErrors.join(' | '));
        } else {
          // Fallback if the server actually crashes or sends HTML
          setErrorMessage('Server Error: Registration could not be processed right now. Please try again later.');
        }
      } else {
        setErrorMessage('A network error occurred. Please check your connection and try again.');
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };
  if (generatedId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#171412] p-4">
        <div className="bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-2xl p-8 max-w-md w-full text-center shadow-premium space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Profile Created!</h2>
            <p className="text-gray-500 text-sm mt-2">Your official Matrimony ID is:</p>
            <div className="bg-primary/10 text-primary font-mono text-2xl py-3 px-6 rounded-lg inline-block mt-3 font-bold tracking-widest border border-primary/20">
              {generatedId}
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 dark:bg-[#1f1b18] p-4 rounded-lg border border-gray-100 dark:border-[#2b2725]">
            <p><strong>Note:</strong> To ensure community trust, additional details (like Government ID proof) will be required to unlock full features.</p>
          </div>
          <Button onClick={() => navigate('/login')} className="w-full py-3">Proceed to Login</Button>
        </div>
      </div>
    );
  }

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
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Phone Number with +91 visual prefix */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Primary Phone Number (WhatsApp Recommended) *</label>
              <div className="flex items-stretch rounded-lg border border-gray-200 dark:border-[#2b2725] bg-transparent overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <span className="flex items-center px-4 bg-gray-50 dark:bg-[#1f1b18] text-gray-500 text-sm border-r border-gray-200 dark:border-[#2b2725] font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  className="w-full p-3 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  pattern="\d{10}"
                  required
                />
              </div>
            </div>

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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Create account'}
              </Button>
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