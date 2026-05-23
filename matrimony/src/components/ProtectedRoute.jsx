import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// 1. ADD { children } to the props
export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/me/', {
          headers: { Authorization: `Token ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;

  // Trap unverified users on the verification page
  if (!user.is_verified && location.pathname !== '/verify-account') {
    return <Navigate to="/verify-account" />;
  }

  // Prevent verified users from going back to the verification page
  if (user.is_verified && location.pathname === '/verify-account') {
    return <Navigate to="/dashboard" />;
  }

  // 2. RETURN children INSTEAD OF <Outlet />
  return children;
}