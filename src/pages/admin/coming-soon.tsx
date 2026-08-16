import React, { useState } from 'react';

export default function ComingSoonModal({ isOpen = true, onClose }) {
  if (!isOpen) return null;

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl transition-all">
        {/* Icon / Illustration optional */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Coming Soon
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Festus is  working hard to bring you this feature. Please check back later! THANK YOU
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}