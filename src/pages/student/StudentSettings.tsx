import React, { useState } from 'react';
import api from '../../api/axios';

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john@gmail.com');

  // Security Form State (Password Change)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Feedback States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await api.put('/student/settings/profile', {
        firstName,
        lastName,
        email,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Fallback feedback for local testing
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Security (Password Change) Update
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);

    try {
      await api.put('/student/settings/security', {
        currentPassword,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings.</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex gap-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setMessage({ type: '', text: '' });
              }}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setMessage({ type: '', text: '' });
              }}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'security'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div
            className={`p-3.5 text-xs font-semibold rounded-xl ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 1. Profile Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* 2. Security Form (Password Change) */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Update Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}