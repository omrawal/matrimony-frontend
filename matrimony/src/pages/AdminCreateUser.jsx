import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { LOCATION_OPTIONS, CAST_OPTIONS, generateHeightOptions } from '../utils/constants';

const emptyForm = {
  username: '', password: '', first_name: '', last_name: '', email: '',
  phone_number: '', date_of_birth: '', time_of_birth: '', place_of_birth: '',
  gender: 'male', cast: '', location: '', height: '', weight: '', complexion: 'Fair',
  mother_name: '', father_name: '', mother_contact: '', father_contact: '',
  education: '', profession: '', address: '', diet: 'Vegetarian', drink: 'Never',
};

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.phone_number) {
      return alert('Please fill all required fields (name, email, phone).');
    }
    if (!form.password || form.password.length < 8) {
      return alert('Password must be at least 8 characters.');
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/admin/create-user/`, {
        ...form,
        weight: form.weight ? parseInt(form.weight, 10) : null,
      }, { headers: { Authorization: `Token ${token}` } });
      alert('Profile created successfully!');
      navigate('/admin/users');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to create user.';
      alert(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-2 border rounded bg-gray-50 dark:bg-[#2b2725] dark:border-gray-700 dark:text-white text-sm focus:outline-primary';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users')} className="text-gray-500 hover:text-primary font-bold transition">← Back</button>
        <h1 className="text-3xl font-bold dark:text-white">Create New Profile</h1>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-sm text-green-800 dark:text-green-300">
        Admin-created profiles are auto-verified, skip approval, and get a 1-year visibility window. Add photos from the Manage User page afterwards.
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-[#1f1b18] p-6 rounded-xl shadow-card space-y-6">
        <div>
          <h3 className="text-lg font-bold dark:text-white mb-4">Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Password *</label><input type="password" name="password" value={form.password} onChange={set} className={inputCls} minLength="8" required /></div>
            <div><label className={labelCls}>Email *</label><input type="email" name="email" value={form.email} onChange={set} className={inputCls} required /></div>
            <div><label className={labelCls}>Phone Number * (10 digits)</label><input type="tel" name="phone_number" value={form.phone_number} onChange={set} className={inputCls} maxLength="10" pattern="[0-9]{10}" required /></div>
            <div><label className={labelCls}>Gender *</label>
              <select name="gender" value={form.gender} onChange={set} className={inputCls}><option value="male">Male</option><option value="female">Female</option></select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>First Name *</label><input type="text" name="first_name" value={form.first_name} onChange={set} className={inputCls} required /></div>
            <div><label className={labelCls}>Last Name *</label><input type="text" name="last_name" value={form.last_name} onChange={set} className={inputCls} required /></div>
            <div><label className={labelCls}>Date of Birth</label><input type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Time of Birth</label><input type="time" name="time_of_birth" value={form.time_of_birth} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Place of Birth</label><input type="text" name="place_of_birth" value={form.place_of_birth} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Location</label>
              <select name="location" value={form.location} onChange={set} className={inputCls}><option value="">Select Location</option>{LOCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
            <div><label className={labelCls}>Cast</label>
              <select name="cast" value={form.cast} onChange={set} className={inputCls}><option value="">Select Cast</option>{CAST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold dark:text-white mb-4">Physical Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>Height</label>
              <select name="height" value={form.height} onChange={set} className={inputCls}><option value="">Select Height</option>{generateHeightOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
            <div><label className={labelCls}>Weight (kg)</label><input type="number" name="weight" value={form.weight} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Complexion</label>
              <select name="complexion" value={form.complexion} onChange={set} className={inputCls}><option>Fair</option><option>Wheatish</option><option>Dusky</option><option>Dark</option></select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold dark:text-white mb-4">Family & Professional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Mother's Name</label><input type="text" name="mother_name" value={form.mother_name} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Father's Name</label><input type="text" name="father_name" value={form.father_name} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Mother's Contact</label><input type="tel" name="mother_contact" value={form.mother_contact} onChange={set} className={inputCls} maxLength="15" /></div>
            <div><label className={labelCls}>Father's Contact</label><input type="tel" name="father_contact" value={form.father_contact} onChange={set} className={inputCls} maxLength="15" /></div>
            <div><label className={labelCls}>Education</label><input type="text" name="education" value={form.education} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Profession</label><input type="text" name="profession" value={form.profession} onChange={set} className={inputCls} /></div>
            <div><label className={labelCls}>Diet</label>
              <select name="diet" value={form.diet} onChange={set} className={inputCls}><option>Vegetarian</option><option>Non-Veg</option><option>Eggetarian</option><option>Pure Veg</option></select>
            </div>
            <div><label className={labelCls}>Drink</label>
              <select name="drink" value={form.drink} onChange={set} className={inputCls}><option>Never</option><option>Occasionally</option><option>Socially</option></select>
            </div>
            <div className="md:col-span-2"><label className={labelCls}>Address</label><textarea name="address" value={form.address} onChange={set} rows="2" className={inputCls} /></div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={() => navigate('/admin/users')} className="px-6 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100 transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white font-bold rounded hover:bg-primary-600 disabled:opacity-50 transition">{loading ? 'Creating...' : 'Create Profile'}</button>
        </div>
      </form>
    </div>
  );
}
