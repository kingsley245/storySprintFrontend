import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface CreateStudentForm {
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<CreateStudentForm>({
      firstName: '',
      lastName: '',
      email: '',
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post(
        '/admin/students',
        formData
      );

      setSuccess(
        'Student created successfully. An invitation email has been sent.'
      );

      setTimeout(() => {
        navigate('/admin/users');
      }, 1800);

    } catch (err: any) {

      console.error(
        'Failed to create student:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to create student. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>

        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Create Student
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a student account and send them
          an invitation to set their password.
        </p>

      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Student created
              </p>

              <p className="text-xs mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* First Name */}
          <div>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              First Name
            </label>

            <input
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />

          </div>

          {/* Last Name */}
          <div>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Last Name
            </label>

            <input
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />

          </div>

          {/* Email */}
          <div>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>

            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />

            <p className="text-[11px] text-gray-400 mt-2">
              The student will receive an email
              containing a secure link to create
              their password.
            </p>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">

            <button
              type="button"
              onClick={() =>
                navigate('/admin/users')
              }
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading
                ? 'Creating...'
                : 'Create Student'}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}