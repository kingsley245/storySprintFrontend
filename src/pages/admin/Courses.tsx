import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty?: string;
  status: string;
  createdAt?: string;
}

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // FETCH COURSES FROM BACKEND
  // ==========================================

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/courses');

      setCourses(response.data);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);

      if (err.response?.status === 401) {
        setError('You are not authenticated. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view courses.');
      } else {
        setError('Failed to load courses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ==========================================
  // FORMAT CATEGORY
  // ==========================================

  const formatCategory = (category: string) => {
    if (!category) return 'Uncategorized';

    return category
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  // ==========================================
  // FILTER COURSES
  // ==========================================

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      course.title.toLowerCase().includes(search) ||
      course.description?.toLowerCase().includes(search) ||
      course.category?.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === 'ALL' ||
      course.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Courses
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Create and manage your courses.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand animate-spin mb-3" />

          <p className="text-sm text-gray-500">
            Loading courses...
          </p>
        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Courses
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create and manage your courses.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/courses/create')}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />

          Create Course
        </button>

      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 flex items-center justify-between">

          <p className="text-sm font-medium">
            {error}
          </p>

          <button
            onClick={fetchCourses}
            className="text-xs font-semibold text-red-700 hover:text-red-900"
          >
            Try Again
          </button>

        </div>
      )}

      {/* ========================================
          CONTROLS
      ======================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* SEARCH */}

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

        {/* CATEGORY FILTER */}

        <div className="flex items-center gap-2 w-full sm:w-auto">

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-600"
          >

            <option value="ALL">
              All Categories
            </option>

            <option value="YOUTUBE_AUTOMATION">
              YouTube Automation
            </option>

            <option value="YOUTUBE_SEO">
              YouTube SEO
            </option>

            <option value="VIDEO_EDITING">
              Video Editing
            </option>

            <option value="THUMBNAIL_DESIGN">
              Thumbnail Design
            </option>

            <option value="SCRIPT_WRITING">
              Script Writing
            </option>

            <option value="MONETIZATION">
              Monetization
            </option>

            <option value="AI_TOOLS">
              AI Tools
            </option>

          </select>

        </div>

      </div>

      {/* ========================================
          COURSE COUNT
      ======================================== */}

      <div className="flex items-center justify-between">

        <p className="text-sm text-gray-500">
          {filteredCourses.length}{' '}
          {filteredCourses.length === 1
            ? 'course'
            : 'courses'}
        </p>

        <button
          onClick={fetchCourses}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>

      </div>

      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">

          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">

            <Search className="w-5 h-5 text-gray-400" />

          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            No courses found
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {courses.length === 0
              ? 'You have not created any courses yet.'
              : 'Try changing your search or category filter.'}
          </p>

          {courses.length === 0 && (
            <button
              onClick={() => navigate('/admin/courses/create')}
              className="mt-5 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Course
            </button>
          )}

        </div>
      )}

      {/* ========================================
          COURSE CARDS
      ======================================== */}

      {filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredCourses.map((course) => (

            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >

              {/* COURSE CONTENT */}

              <div>

                {/* THUMBNAIL */}

                <div className="h-44 w-full bg-gray-100 overflow-hidden relative">

                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">

                      <div className="text-center">

                        <div className="text-3xl font-bold text-gray-300">
                          TM
                        </div>

                        <p className="text-xs text-gray-400 mt-1">
                          No thumbnail
                        </p>

                      </div>

                    </div>
                  )}

                  {/* STATUS */}

                  <div className="absolute top-3 right-3">

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm ${
                        course.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : course.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {formatStatus(course.status)}
                    </span>

                  </div>

                </div>

                {/* CARD BODY */}

                <div className="p-5 space-y-4">

                  {/* CATEGORY */}

                  <div className="flex items-center justify-between">

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                      {formatCategory(course.category)}
                    </span>

                    {course.difficulty && (
                      <span className="text-[10px] font-medium text-gray-400">
                        {formatStatus(course.difficulty)}
                      </span>
                    )}

                  </div>

                  {/* TITLE */}

                  <div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {course.title}
                    </h3>

                    {course.subtitle && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.subtitle}
                      </p>
                    )}

                  </div>

                  {/* DESCRIPTION */}

                  {course.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* COURSE INFORMATION */}

                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">

                    <span>
                      Course
                    </span>

                    <span className="text-gray-300">
                      •
                    </span>

                    <span>
                      {formatStatus(course.status)}
                    </span>

                  </div>

                </div>

              </div>

              {/* MANAGE */}

              <div className="p-5 pt-0">

                <button
                  onClick={() =>
                    navigate(`/admin/courses/${course.id}`)
                  }
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-brand text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                >
                  Manage Course
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}