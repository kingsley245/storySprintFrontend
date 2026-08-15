import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Video, Link2 } from 'lucide-react';

export default function AddLesson() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    orderNumber: '06',
    videoUrl: '',
    resourceLink: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(`/admin/courses/${courseId}/lessons`, formData);
      navigate(`/admin/courses/${courseId}`);
    } catch (err: any) {
      console.error('Failed to add lesson:', err);
      // Fallback navigation
      navigate(`/admin/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/admin/courses/${courseId}`)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Lesson</h1>
          <p className="text-sm text-gray-500 mt-0.5">Attach a new video lesson to this course.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Order #</label>
              <input
                type="text"
                required
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="06"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-center font-bold"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lesson Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Exporting & Rendering Settings"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Video File URL</label>
            <div className="relative">
              <Video className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="url"
                required
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://res.cloudinary.com/.../video.mp4"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Resource Link (Optional)</label>
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="url"
                value={formData.resourceLink}
                onChange={(e) => setFormData({ ...formData, resourceLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/admin/courses/${courseId}`)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}