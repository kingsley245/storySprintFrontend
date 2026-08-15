import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal } from 'lucide-react';

interface Lesson {
  id: string;
  orderNumber: string;
  title: string;
}

export default function CourseManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isPublished, setIsPublished] = useState(false);
  const [lessons] = useState<Lesson[]>([
    { id: '1', orderNumber: '01', title: 'Introduction to Video Editing' },
    { id: '2', orderNumber: '02', title: 'Understanding Timeline' },
    { id: '3', orderNumber: '03', title: 'Cutting & Transitions' },
    { id: '4', orderNumber: '04', title: 'Color Grading' },
    { id: '5', orderNumber: '05', title: 'Audio Editing' },
  ]);

  const handleTogglePublish = () => {
    setIsPublished((prev) => !prev);
    // API call: api.patch(`/admin/courses/${id}/status`, { published: !isPublished })
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Editing Masterclass</h1>
          <p className="text-sm text-gray-500 mt-1">
            Learn professional video editing from beginner to advanced.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/courses/${id}/edit`)}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            Edit Course
          </button>
          <button
            onClick={handleTogglePublish}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
              isPublished
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isPublished ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Course Content Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
          <button
            onClick={() => navigate(`/admin/courses/${id}/lessons/add`)}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lesson
          </button>
        </div>

        {/* Lessons List Stack */}
        <div className="space-y-2.5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  {lesson.orderNumber}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {lesson.title}
                </span>
              </div>

              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}