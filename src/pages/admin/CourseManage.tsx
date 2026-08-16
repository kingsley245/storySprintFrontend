import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  MoreHorizontal,
  ArrowLeft,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';
import api from '../../api/axios';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  lessonOrder: number;
  durationMinutes: number;
  preview: boolean;
  createdAt?: string;
}

export default function CourseManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);

  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // LOAD COURSE
  // =====================================================

  const fetchCourse = async () => {
    if (!courseId) {
      setError('Course ID is missing from the URL.');
      setLoadingCourse(false);
      return;
    }

    try {
      setLoadingCourse(true);
      setError('');

      const response = await api.get(`/admin/courses/${courseId}`);

      setCourse(response.data);
    } catch (err: any) {
      console.error('Failed to load course:', err);

      if (err.response?.status === 404) {
        setError('Course not found.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this course.');
      } else {
        setError('Failed to load course.');
      }
    } finally {
      setLoadingCourse(false);
    }
  };

  // =====================================================
  // LOAD LESSONS
  // =====================================================

  const fetchLessons = async () => {
    if (!courseId) {
      setLoadingLessons(false);
      return;
    }

    try {
      setLoadingLessons(true);

      const response = await api.get(
        `/courses/${courseId}/lessons`
      );

      setLessons(response.data);
    } catch (err: any) {
      console.error('Failed to load lessons:', err);

      // Don't destroy the course page if lessons fail.
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCourse();
    fetchLessons();
  }, [courseId]);

  // =====================================================
  // PUBLISH / UNPUBLISH
  // =====================================================

  const handleTogglePublish = async () => {
    if (!course) return;

    try {
      setPublishing(true);

      const newStatus =
        course.status === 'PUBLISHED'
          ? 'DRAFT'
          : 'PUBLISHED';

      const response = await api.patch(
        `/admin/courses/${course.id}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      setCourse(response.data);
    } catch (err) {
      console.error('Failed to update course status:', err);
      alert('Failed to update course status.');
    } finally {
      setPublishing(false);
    }
  };

  // =====================================================
  // DELETE COURSE
  // =====================================================

  const handleDeleteCourse = async () => {
    if (!course) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await api.delete(`/admin/courses/${course.id}`);

      navigate('/admin/courses');
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course.');
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCategory = (value?: string) => {
    if (!value) return 'Unknown';

    return value
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  };

  const formatDifficulty = (value?: string) => {
    if (!value) return 'Not specified';

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1).toLowerCase()
    );
  };

  // =====================================================
  // INVALID COURSE ID
  // =====================================================

  if (!courseId) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Invalid Course
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            No course ID was provided.
          </p>

          <button
            onClick={() => navigate('/admin/courses')}
            className="mt-5 px-4 py-2 bg-brand text-white rounded-lg text-sm"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOADING COURSE
  // =====================================================

  if (loadingCourse) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-xl p-12 flex flex-col items-center justify-center">
          <RefreshCw className="w-7 h-7 text-brand animate-spin" />

          <p className="text-sm text-gray-500 mt-3">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // COURSE NOT FOUND / ERROR
  // =====================================================

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Course unavailable
          </h2>

          <p className="text-sm text-red-500 mt-2">
            {error || 'The course could not be loaded.'}
          </p>

          <button
            onClick={() => navigate('/admin/courses')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        onClick={() => navigate('/admin/courses')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* =================================================
          COURSE HEADER
      ================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

        <div className="flex gap-4">

          {/* Thumbnail */}

          <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                TM
              </div>
            )}

          </div>

          {/* Information */}

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {course.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">

              <span className="px-2.5 py-1 rounded-md bg-brand/10 text-brand text-[10px] font-semibold">
                {formatCategory(course.category)}
              </span>

              {course.difficulty && (
                <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                  {formatDifficulty(course.difficulty)}
                </span>
              )}

              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                  course.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : course.status === 'ARCHIVED'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {course.status}
              </span>

            </div>

          </div>

        </div>

        {/* Actions */}

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate(
                `/admin/courses/${course.id}/edit`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Course
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 ${
              course.status === 'PUBLISHED'
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {publishing
              ? 'Updating...'
              : course.status === 'PUBLISHED'
              ? 'Unpublish'
              : 'Publish'}
          </button>

        </div>

      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* =================================================
          COURSE DESCRIPTION
      ================================================= */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

        <h2 className="text-base font-bold text-gray-900">
          Course Description
        </h2>

        <p className="text-sm text-gray-600 leading-7 mt-3">
          {course.description || 'No description provided.'}
        </p>

      </div>

      {/* =================================================
          COURSE CONTENT
      ================================================= */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Course Content
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {lessons.length}{' '}
              {lessons.length === 1
                ? 'lesson'
                : 'lessons'}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/admin/courses/${course.id}/lessons/add`
              )
            }
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lesson
          </button>

        </div>

        {/* =================================================
            LESSON LOADING
        ================================================= */}

        {loadingLessons && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center">

            <RefreshCw className="w-5 h-5 text-brand animate-spin" />

            <span className="ml-2 text-sm text-gray-500">
              Loading lessons...
            </span>

          </div>
        )}

        {/* =================================================
            NO LESSONS
        ================================================= */}

        {!loadingLessons && lessons.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">

            <h3 className="text-sm font-semibold text-gray-900">
              No lessons yet
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Start building this course by adding your first lesson.
            </p>

            <button
              onClick={() =>
                navigate(
                  `/admin/courses/${course.id}/lessons/add`
                )
              }
              className="mt-4 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-medium px-4 py-2.5 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add First Lesson
            </button>

          </div>
        )}

        {/* =================================================
            LESSONS
        ================================================= */}

        {!loadingLessons && lessons.length > 0 && (
          <div className="space-y-2.5">

            {lessons
              .sort(
                (a, b) =>
                  a.lessonOrder - b.lessonOrder
              )
              .map((lesson) => (

                <div
                  key={lesson.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors"
                >

                  <div className="flex items-center gap-4">

                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      {String(
                        lesson.lessonOrder
                      ).padStart(2, '0')}
                    </span>

                    <div>

                      <span className="text-sm font-semibold text-gray-800">
                        {lesson.title}
                      </span>

                      <div className="flex items-center gap-3 mt-1">

                        <span className="text-[10px] text-gray-400">
                          {lesson.durationMinutes} min
                        </span>

                        {lesson.preview && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Preview
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Lesson menu */}

                  <div className="flex items-center gap-1">

                    <button
                      onClick={() =>
                        navigate(
                          `/admin/courses/${course.id}/lessons/${lesson.id}/edit`
                        )
                      }
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                      title="Edit lesson"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              ))}

          </div>
        )}

      </div>

      {/* =================================================
          DANGER ZONE
      ================================================= */}

      <div className="border border-red-100 bg-red-50/50 rounded-xl p-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <h3 className="text-sm font-bold text-red-700">
              Delete Course
            </h3>

            <p className="text-xs text-red-500 mt-1">
              Permanently delete this course and its associated content.
            </p>

          </div>

          <button
            onClick={handleDeleteCourse}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 bg-white hover:bg-red-100 border border-red-200 rounded-lg disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />

            {deleting
              ? 'Deleting...'
              : 'Delete Course'}
          </button>

        </div>

      </div>

    </div>
  );
}