import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import api from '../../api/axios';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  category: string;
  status: string;
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

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  status: string;
  thumbnail: string;
}

const categories = [
  {
    value: 'YOUTUBE_AUTOMATION',
    label: 'YouTube Automation',
  },
  {
    value: 'YOUTUBE_SEO',
    label: 'YouTube SEO',
  },
  {
    value: 'VIDEO_EDITING',
    label: 'Video Editing',
  },
  {
    value: 'THUMBNAIL_DESIGN',
    label: 'Thumbnail Design',
  },
  {
    value: 'SCRIPT_WRITING',
    label: 'Script Writing',
  },
  {
    value: 'MONETIZATION',
    label: 'Monetization',
  },
  {
    value: 'AI_TOOLS',
    label: 'AI Tools',
  },
];

const statuses = [
  {
    value: 'DRAFT',
    label: 'Draft',
  },
  {
    value: 'PUBLISHED',
    label: 'Published',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
];

export default function CourseEdit() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'curriculum'>(
    'details'
  );

  const [course, setCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    subtitle: '',
    description: '',
    category: 'YOUTUBE_AUTOMATION',
    status: 'DRAFT',
    thumbnail: '',
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: 'success' | 'error' | '';
    text: string;
  }>({
    type: '',
    text: '',
  });

  /*
   * ============================================================
   * LOAD COURSE
   * GET /api/courses/{courseId}
   * ============================================================
   */

  const loadCourse = async () => {
    if (!courseId) {
      setMessage({
        type: 'error',
        text: 'Course ID is missing.',
      });

      setLoadingCourse(false);
      return;
    }

    try {
      setLoadingCourse(true);
      setMessage({ type: '', text: '' });

      const response = await api.get(`/courses/${courseId}`);

      const data: Course = response.data;

      setCourse(data);

      setFormData({
        title: data.title ?? '',
        subtitle: data.subtitle ?? '',
        description: data.description ?? '',
        category: data.category ?? 'YOUTUBE_AUTOMATION',
        status: data.status ?? 'DRAFT',
        thumbnail: data.thumbnail ?? '',
      });
    } catch (error: any) {
      console.error('Failed to load course:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to load course.';

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoadingCourse(false);
    }
  };

  /*
   * ============================================================
   * LOAD LESSONS
   * GET /api/courses/{courseId}/lessons
   * ============================================================
   */

  const loadLessons = async () => {
    if (!courseId) return;

    try {
      setLoadingLessons(true);

      const response = await api.get(`/courses/${courseId}/lessons`);

      setLessons(response.data ?? []);
    } catch (error: any) {
      console.error('Failed to load lessons:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to load lessons.';

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoadingLessons(false);
    }
  };

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadCourse();
    loadLessons();
  }, [courseId]);

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * SAVE COURSE
   *
   * PUT /api/courses/{courseId}
   * ============================================================
   */

  const handleSaveCourse = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!courseId) {
      setMessage({
        type: 'error',
        text: 'Course ID is missing.',
      });

      return;
    }

    if (!formData.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Course title is required.',
      });

      return;
    }

    if (!formData.category) {
      setMessage({
        type: 'error',
        text: 'Please select a category.',
      });

      return;
    }

    if (!formData.status) {
      setMessage({
        type: 'error',
        text: 'Please select a status.',
      });

      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await api.put(
        `admin/courses/${courseId}`,
        {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          description: formData.description.trim(),
          thumbnail: formData.thumbnail.trim(),
          category: formData.category,
          status: formData.status,
        }
      );

    

      const updatedCourse: Course = response.data;

      setCourse(updatedCourse);

      setFormData({
        title: updatedCourse.title ?? '',
        subtitle: updatedCourse.subtitle ?? '',
        description: updatedCourse.description ?? '',
        category:
          updatedCourse.category ?? 'YOUTUBE_AUTOMATION',
        status: updatedCourse.status ?? 'DRAFT',
        thumbnail: updatedCourse.thumbnail ?? '',
      });

    

      await loadCourse();

      setMessage({
        type: 'success',
        text: 'Course updated successfully.',
      });
    } catch (error: any) {
      console.error('Failed to update course:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to update course. Please try again.';

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE LESSON
   *
   * DELETE /api/lessons/{lessonId}
   * ============================================================
   */

  const handleDeleteLesson = async (lessonId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this lesson?'
    );

    if (!confirmed) return;

    try {
      setDeletingLesson(lessonId);
      setMessage({ type: '', text: '' });

      await api.delete(`/lessons/${lessonId}`);

      /*
       * Remove it from the UI immediately.
       */

      setLessons((previous) =>
        previous.filter((lesson) => lesson.id !== lessonId)
      );

      /*
       * Reload from backend to make sure UI and database
       * are synchronized.
       */

      await loadLessons();

      setMessage({
        type: 'success',
        text: 'Lesson deleted successfully.',
      });
    } catch (error: any) {
      console.error('Failed to delete lesson:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to delete lesson.';

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setDeletingLesson(null);
    }
  };

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loadingCourse) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-brand" />
          <p className="text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* ======================================================
          TOP NAVIGATION
      ======================================================= */}

      <div className="flex items-center justify-between gap-4">

        <button
          type="button"
          onClick={() => navigate('/admin/courses')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        {activeTab === 'details' && (
          <button
            type="button"
            onClick={() => handleSaveCourse()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {saving ? 'Saving...' : 'Save Course'}
          </button>
        )}
      </div>

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Course
        </h1>

        <p className="text-sm text-gray-500 mt-0.5">
          Update course details and manage lesson modules.
        </p>
      </div>

      {/* ======================================================
          MESSAGE
      ======================================================= */}

      {message.text && (
        <div
          className={`p-3.5 text-sm font-medium rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ======================================================
          MAIN CARD
      ======================================================= */}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">

        {/* ====================================================
            TABS
        ===================================================== */}

        <div className="border-b border-gray-100">
          <nav className="flex gap-8">

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Course Details
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('curriculum');
                loadLessons();
              }}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'curriculum'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Curriculum ({lessons.length} Lessons)
            </button>

          </nav>
        </div>

        {/* ====================================================
            DETAILS TAB
        ===================================================== */}

        {activeTab === 'details' && (
          <form
            onSubmit={handleSaveCourse}
            className="space-y-5"
          >

            {/* Title */}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Course Title
              </label>

              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Subtitle */}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Subtitle
              </label>

              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Short description of the course"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Category + Status */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800 bg-white"
                >
                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800 bg-white"
                >
                  {statuses.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Description */}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />
            </div>

            {/* Thumbnail */}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Thumbnail
              </label>

              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Thumbnail URL"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
              />

              {formData.thumbnail && (
                <div className="mt-3">
                  <img
                    src={formData.thumbnail}
                    alt={formData.title}
                    className="w-full max-h-64 object-cover rounded-xl border border-gray-100"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Save */}

            <div className="flex justify-end pt-5 border-t border-gray-100">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}

                {saving ? 'Saving...' : 'Save Changes'}
              </button>

            </div>

          </form>
        )}

        {/* ====================================================
            CURRICULUM TAB
        ===================================================== */}

        {activeTab === 'curriculum' && (
          <div className="space-y-6">

            {/* Add Lesson */}

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  Course Lessons
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Manage the lessons belonging to this course.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/courses/${courseId}/lessons/add`
                  )
                }
                className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </button>

            </div>

            {/* Lessons */}

            {loadingLessons ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                <p className="text-sm font-semibold text-gray-700">
                  No lessons yet
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Add your first lesson to this course.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">

                {lessons
                  .sort(
                    (a, b) =>
                      a.lessonOrder - b.lessonOrder
                  )
                  .map((lesson, index) => (

                    <div
                      key={lesson.id}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
                    >

                      <div className="flex items-center gap-3 flex-1 min-w-0">

                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                        <span className="text-xs font-bold text-gray-400 min-w-[24px]">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {lesson.title}
                          </p>

                          <p className="text-[11px] text-gray-400 mt-1">
                            {lesson.durationMinutes} minutes
                            {lesson.preview && ' • Preview'}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">

                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/courses/${courseId}/lessons/${lesson.id}/edit`
                            )
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-brand bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deletingLesson === lesson.id}
                          onClick={() =>
                            handleDeleteLesson(lesson.id)
                          }
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          {deletingLesson === lesson.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>

                      </div>

                    </div>

                  ))}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}