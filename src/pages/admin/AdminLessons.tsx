import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import {
  Search,
  Play,
  Video,
  Clock,
  BookOpen,
  CheckCircle2,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  status?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  lessonOrder: number;
  durationMinutes: number;
  preview: boolean;
  published?: boolean;
  courseId: string;
  createdAt?: string;
}

interface CourseLessons {
  course: Course;
  lessons: Lesson[];
}

export default function AdminLessons() {
  const [courseLessons, setCourseLessons] = useState<CourseLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [expandedCourses, setExpandedCourses] = useState<
    Record<string, boolean>
  >({});

  const getVideoUrl = (videoUrl?: string) => {
    if (!videoUrl) return '';

    if (
      videoUrl.startsWith('http://') ||
      videoUrl.startsWith('https://')
    ) {
      return videoUrl;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      return videoUrl;
    }

    const backendUrl = apiUrl.replace(/\/api\/?$/, '');

    return `${backendUrl}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
  };

  /*
   * Load courses and then their lessons.
   */
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/courses');

      const courses: Course[] = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      const results = await Promise.all(
        courses.map(async (course) => {
          try {
            const lessonResponse = await api.get(
              `/admin/courses/${course.id}/lessons`
            );

            return {
              course,
              lessons: Array.isArray(lessonResponse.data)
                ? lessonResponse.data
                : [],
            };
          } catch (lessonError) {
            console.error(
              `Failed to load lessons for course ${course.id}`,
              lessonError
            );

            return {
              course,
              lessons: [],
            };
          }
        })
      );

      setCourseLessons(results);

      // Expand courses that contain lessons by default
      const expanded: Record<string, boolean> = {};

      results.forEach((item) => {
        if (item.lessons.length > 0) {
          expanded[item.course.id] = true;
        }
      });

      setExpandedCourses(expanded);
    } catch (err: any) {
      console.error('Failed to load courses:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load lessons. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Flatten lessons so searching is easier.
   */
  const filteredCourseLessons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courseLessons;
    }

    return courseLessons
      .map((item) => {
        const courseMatches = item.course.title
          ?.toLowerCase()
          .includes(query);

        const filteredLessons = item.lessons.filter((lesson) => {
          return (
            lesson.title?.toLowerCase().includes(query) ||
            lesson.description?.toLowerCase().includes(query) ||
            item.course.title?.toLowerCase().includes(query)
          );
        });

        if (courseMatches) {
          return item;
        }

        return {
          ...item,
          lessons: filteredLessons,
        };
      })
      .filter((item) => item.lessons.length > 0);
  }, [courseLessons, search]);

  const totalLessons = courseLessons.reduce(
    (total, item) => total + item.lessons.length,
    0
  );

  const publishedLessons = courseLessons.reduce(
    (total, item) =>
      total +
      item.lessons.filter((lesson) => lesson.published === true).length,
    0
  );

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const openLesson = (lesson: Lesson, course: Course) => {
    setSelectedLesson(lesson);
    setSelectedCourse(course);
  };

  const closeLesson = () => {
    setSelectedLesson(null);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />

          <p className="text-sm text-gray-500">
            Loading lessons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-12">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand/10 rounded-xl">
                <Video className="w-5 h-5 text-brand" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Lessons
              </h1>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Manage, preview and watch all course lessons.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search lessons or courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Total Lessons
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalLessons}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl">
                <Video className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Published
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {publishedLessons}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Courses
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courseLessons.length}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* LESSONS */}
        <div className="space-y-4">

          {filteredCourseLessons.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <Video className="w-10 h-10 mx-auto text-gray-300" />

              <h3 className="mt-4 text-sm font-bold text-gray-800">
                No lessons found
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                {search
                  ? 'Try another search.'
                  : 'Create a lesson inside a course to see it here.'}
              </p>
            </div>
          ) : (
            filteredCourseLessons.map((item) => {
              const isExpanded =
                expandedCourses[item.course.id] ?? true;

              return (
                <div
                  key={item.course.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >

                  {/* COURSE HEADER */}
                  <button
                    type="button"
                    onClick={() => toggleCourse(item.course.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">

                      {item.course.thumbnail ? (
                        <img
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          className="w-14 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 truncate">
                          {item.course.title}
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.lessons.length}{' '}
                          {item.lessons.length === 1
                            ? 'lesson'
                            : 'lessons'}
                        </p>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {/* LESSON LIST */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">

                      {item.lessons.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400">
                          No lessons in this course.
                        </div>
                      ) : (
                        item.lessons
                          .sort(
                            (a, b) =>
                              a.lessonOrder - b.lessonOrder
                          )
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              className="group flex flex-col md:flex-row md:items-center gap-4 p-4 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors"
                            >

                              {/* ORDER */}
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-gray-500">
                                  {String(
                                    lesson.lessonOrder
                                  ).padStart(2, '0')}
                                </span>
                              </div>

                              {/* LESSON INFO */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">

                                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                                    {lesson.title}
                                  </h3>

                                  {lesson.published ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Published
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                                      Draft
                                    </span>
                                  )}

                                  {lesson.preview && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                                      <Eye className="w-3 h-3" />
                                      Preview
                                    </span>
                                  )}

                                </div>

                                <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">

                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {lesson.durationMinutes || 0} min
                                  </span>

                                  {lesson.videoUrl && (
                                    <span className="inline-flex items-center gap-1">
                                      <Video className="w-3.5 h-3.5" />
                                      Video available
                                    </span>
                                  )}

                                </div>
                              </div>

                              {/* ACTION */}
                              <div className="flex items-center gap-2">

                                {lesson.videoUrl ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openLesson(
                                        lesson,
                                        item.course
                                      )
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    Watch
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 px-3">
                                    No video
                                  </span>
                                )}

                              </div>

                            </div>
                          ))
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      </div>

      {/* VIDEO PLAYER MODAL */}
      {selectedLesson && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLesson}
        >
          <div
            className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  {selectedCourse?.title}
                </p>

                <h2 className="text-base font-bold text-gray-900 truncate mt-0.5">
                  {selectedLesson.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeLesson}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* VIDEO */}
            <div className="bg-black aspect-video">

              <video
                key={selectedLesson.id}
                className="w-full h-full"
                controls
                autoPlay
                playsInline
              >
                <source
                  src={getVideoUrl(selectedLesson.videoUrl)}
                  type="video/mp4"
                />

                Your browser does not support HTML5 video.
              </video>

            </div>

            {/* VIDEO INFO */}
            <div className="p-5">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedLesson.title}
                  </h3>

                  {selectedLesson.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedLesson.description}
                    </p>
                  )}
                </div>

                <a
                  href={getVideoUrl(selectedLesson.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Video
                </a>

              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}