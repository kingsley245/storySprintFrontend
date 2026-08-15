import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SetupPassword() {

  const [searchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const token =
    searchParams.get('token') || '';

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError('');

    if (!token) {
      setError(
        'This password setup link is invalid.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    try {

      setLoading(true);

      await api.post(
        '/auth/setup-password',
        {
          token,
          password,
        }
      );

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err: any) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Unable to create your password. The link may have expired.'
      );

    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">

            <CheckCircle2 className="w-7 h-7" />

          </div>

          <h1 className="text-xl font-bold text-gray-900 mt-5">
            Password Created
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Your AI STORYSPRINT Editing account
            is ready.
          </p>

          <p className="text-xs text-gray-400 mt-4">
            Redirecting you to login...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-8">

          <h1 className="text-2xl font-bold text-gray-900">
            Create Your Password
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Set a secure password for your
            AI STORYSPRINT Editing account.
          </p>

        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              New Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 pr-11 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          <div>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2.5 pr-11 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Creating password...'
              : 'Create Password'}
          </button>

        </form>

      </div>

    </div>
  );
}