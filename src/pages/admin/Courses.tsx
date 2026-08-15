import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  lessonsCount: number;
  studentsCount: number;
  category: string;
}

export default function Courses() {
  const navigate = useNavigate();

  // Mock initial state matching design layout
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Video Editing Masterclass',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
      lessonsCount: 12,
      studentsCount: 85,
      category: 'Editing',
    },
    {
      id: '2',
      title: 'Storytelling for Beginners',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      lessonsCount: 18,
      studentsCount: 64,
      category: 'Storytelling',
    },
    {
      id: '3',
      title: 'YouTube Growth Guide',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
      lessonsCount: 15,
      studentsCount: 100,
      category: 'Marketing',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your courses.</p>
        </div>
        <button
          onClick={() => navigate('/admin/courses/create')}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-600"
          >
            <option value="ALL">Category</option>
            <option value="Editing">Editing</option>
            <option value="Storytelling">Storytelling</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Thumbnail */}
              <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {course.title}
                </h3>
                <div className="space-y-1 text-xs text-gray-500 font-medium">
                  <p>{course.lessonsCount} Lessons</p>
                  <p>{course.studentsCount} Students</p>
                </div>
              </div>
            </div>

            {/* Manage Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => navigate(`/admin/courses/${course.id}`)}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-brand text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}