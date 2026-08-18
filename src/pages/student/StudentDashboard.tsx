import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  ChevronRight,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';

interface StudentCourse {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  currentLessonId?: string;
  currentLessonNumber?: number;
  currentLessonTitle?: string;
}

interface StudentDashboardData {
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  continueLearning: StudentCourse | null;
  courses: StudentCourse[];
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<StudentDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get<StudentDashboardData>(
          '/student/dashboard'
        );

        setDashboard(response.data);
      } catch (err: any) {
        console.error('Failed to load student dashboard:', err);

        setError(
          err?.response?.data?.message ||
            'Unable to load your dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-brand" />

          <p className="text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

          <div>
            <h3 className="font-semibold text-red-800">
              Unable to load dashboard
            </h3>

            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Safety check
   */
  if (!dashboard) {
    return null;
  }

  const activeCourse = dashboard.continueLearning;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* ================================
          WELCOME
      ================================= */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Welcome back, {dashboard.firstName}
          <span className="text-xl">👋</span>
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Let's continue your learning journey.
        </p>
      </div>

      {/* ================================
          CONTINUE LEARNING
      ================================= */}

      {activeCourse && (
        <div className="space-y-3">

          <h2 className="text-sm font-bold text-gray-800">
            Continue Learning
          </h2>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Details */}
            <div className="space-y-4 flex-1 w-full">

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  {activeCourse.title}
                </h3>

                {activeCourse.currentLessonTitle && (
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Lesson {activeCourse.currentLessonNumber}{' '}
                    of {activeCourse.totalLessons}
                    {' - '}
                    {activeCourse.currentLessonTitle}
                  </p>
                )}

              </div>

              {/* Progress */}
              <div className="space-y-1.5 max-w-md">

                <div className="flex justify-between text-xs font-bold text-gray-700">

                  <span>
                    {activeCourse.completedLessons} of{' '}
                    {activeCourse.totalLessons} lessons
                  </span>

                  <span>
                    {activeCourse.progress}%
                  </span>

                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">

                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeCourse.progress}%`,
                    }}
                  />

                </div>

              </div>

              {/* Continue */}
              <button
                onClick={() => {
                  if (
                    activeCourse.currentLessonId
                  ) {
                    navigate(
                      `/student/courses/${activeCourse.id}/learn/${activeCourse.currentLessonId}`
                    );
                  } else {
                    navigate(
                      `/student/courses/${activeCourse.id}/learn`
                    );
                  }
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <PlayCircle className="w-4 h-4 fill-white/20" />

                {activeCourse.progress > 0
                  ? 'Continue Learning'
                  : 'Start Learning'}
              </button>

            </div>

            {/* Thumbnail */}
            <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">

              {activeCourse.thumbnail ? (
                <img
                  src={activeCourse.thumbnail}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ================================
          NO COURSES
      ================================= */}

      {dashboard.courses.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">

          <BookOpen className="w-10 h-10 mx-auto text-gray-300" />

          <h3 className="mt-4 text-base font-bold text-gray-900">
            No courses yet
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            You haven't been enrolled in any courses yet.
          </p>

        </div>
      )}

      {/* ================================
          MY COURSES
      ================================= */}

      {dashboard.courses.length > 0 && (
        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <h2 className="text-sm font-bold text-gray-800">
              My Courses
            </h2>

            <button
              onClick={() =>
                navigate('/student/courses')
              }
              className="text-xs font-semibold text-brand hover:text-brand-dark inline-flex items-center gap-0.5 transition-colors"
            >
              View all

              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {dashboard.courses
              .slice(0, 3)
              .map((course) => (

              <div
                key={course.id}
                onClick={() =>
                  navigate(
                    `/student/courses/${course.id}`
                  )
                }
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              >

                {/* Thumbnail */}
                <div className="h-36 w-full bg-gray-100 overflow-hidden">

                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-gray-300" />
                    </div>
                  )}

                </div>

                {/* Course Info */}
                <div className="p-4 space-y-3">

                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">

                    <span>
                      {course.completedLessons}/
                      {course.totalLessons} lessons
                    </span>

                    <span>
                      {course.progress}%
                    </span>

                  </div>

                  {/* Progress */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">

                    <div
                      className="bg-brand h-full rounded-full transition-all"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            ))}

          </div>
        </div>
      )}

    </div>
  );
}