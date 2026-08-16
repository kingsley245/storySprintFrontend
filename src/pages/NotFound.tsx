import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        
        {/* Visual Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/10 text-brand rounded-2xl">
          <span className="text-3xl font-black">404</span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate('/student/courses')}
            className="flex-1 py-2.5 px-4 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}