import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ProgressResponse {
  id: string;
  lessonId: string;
  lessonTitle: string;

  courseId?: string;
  courseTitle?: string;

  lastPositionSeconds: number;
  completionPercentage: number;
  completed: boolean;

  updatedAt: string;
}

interface CourseProgress {
  id: string;
  title: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export default function MyProgress() {

  const [progress, setProgress] =
    useState<ProgressResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const getCurrentUser = (): User | null => {

    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const fetchProgress = async () => {

    try {

      setLoading(true);
      setError('');

      const user = getCurrentUser();

      if (!user?.id) {
        setError('User session not found.');
        return;
      }

      const response = await api.get(
        `/progress/user/${user.id}`
      );

      setProgress(response.data);

    } catch (err: any) {

      console.error(
        'Failed to fetch progress:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to load your progress.'
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  /*
   * Group lesson progress by course.
   */
  const courses = useMemo<CourseProgress[]>(() => {

    const grouped = new Map<
      string,
      {
        title: string;
        lessons: ProgressResponse[];
      }
    >();

    progress.forEach((item) => {

      if (!item.courseId) {
        return;
      }

      if (!grouped.has(item.courseId)) {

        grouped.set(item.courseId, {
          title:
            item.courseTitle ||
            'Untitled Course',

          lessons: [],
        });
      }

      grouped
        .get(item.courseId)!
        .lessons
        .push(item);
    });

    return Array.from(grouped.entries()).map(
      ([courseId, course]) => {

        const lessons =
          course.lessons;

        const totalLessons =
          lessons.length;

        const completedLessons =
          lessons.filter(
            (lesson) =>
              lesson.completed
          ).length;

        const percentage =
          totalLessons === 0
            ? 0
            : lessons.reduce(
                (
                  total,
                  lesson
                ) =>
                  total +
                  (lesson.completionPercentage || 0),
                0
              ) / totalLessons;

        return {
          id: courseId,
          title: course.title,
          percentage: Math.round(percentage),
          completedLessons,
          totalLessons,
        };
      }
    );

  }, [progress]);

  /*
   * Overall progress.
   */
  const overallProgress = useMemo(() => {

    if (progress.length === 0) {
      return 0;
    }

    const total =
      progress.reduce(
        (sum, item) =>
          sum +
          (item.completionPercentage || 0),
        0
      );

    return Math.round(
      total / progress.length
    );

  }, [progress]);

  /*
   * Lessons completed.
   */
  const completedLessons =
    progress.filter(
      (item) => item.completed
    ).length;

  /*
   * Total lessons tracked.
   */
  const totalLessons =
    progress.length;

  /*
   * Watch time.
   *
   * Currently this uses lastPositionSeconds
   * because your ProgressResponse does not
   * expose watchTimeSeconds yet.
   */
  const studyTime = useMemo(() => {

    const totalSeconds =
      progress.reduce(
        (sum, item) =>
          sum +
          (item.lastPositionSeconds || 0),
        0
      );

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    return `${hours}h ${minutes}m`;

  }, [progress]);

  if (loading) {

    return (
      <div className="min-h-[400px] flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            className="w-7 h-7 animate-spin mx-auto text-brand"
          />

          <p className="text-sm text-gray-500 mt-3">
            Loading your progress...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            My Progress
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Track your learning progress.
          </p>

        </div>

        <button
          onClick={fetchProgress}
          disabled={loading}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          title="Refresh progress"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

      </div>

      {/* Error */}

      {error && (

        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 flex items-start gap-3">

          <AlertCircle className="w-5 h-5 shrink-0" />

          <div>

            <p className="text-sm font-medium">
              {error}
            </p>

            <button
              onClick={fetchProgress}
              className="text-xs underline mt-1"
            >
              Try again
            </button>

          </div>

        </div>

      )}

      {/* Overall Progress */}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">

        <div className="flex items-center justify-between">

          <span className="text-xs font-bold text-gray-800">
            Overall Progress
          </span>

          <span className="text-2xl font-extrabold text-gray-900">
            {overallProgress}%
          </span>

        </div>

        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">

          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
            }}
          />

        </div>

      </div>

      {/* Courses */}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

        <h3 className="text-xs font-bold text-gray-800">
          Courses
        </h3>

        {courses.length === 0 ? (

          <div className="text-center py-8">

            <p className="text-sm font-medium text-gray-700">
              No course progress yet
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Start a lesson to begin tracking your progress.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {courses.map((course) => (

              <div
                key={course.id}
                className="space-y-2"
              >

                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">

                  <span className="truncate pr-2">
                    {course.title}
                  </span>

                  <span>
                    {course.percentage}%
                  </span>

                </div>

                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">

                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width:
                        `${course.percentage}%`,
                    }}
                  />

                </div>

                <p className="text-[11px] text-gray-400">
                  {course.completedLessons}/
                  {course.totalLessons}
                  {' '}lessons completed
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">

          <p className="text-[11px] font-semibold text-gray-400">
            Lessons Completed
          </p>

          <p className="text-xl font-bold text-gray-900">
            {completedLessons} / {totalLessons}
          </p>

        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">

          <p className="text-[11px] font-semibold text-gray-400">
            Study Time
          </p>

          <p className="text-xl font-bold text-gray-900">
            {studyTime}
          </p>

        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">

        

        </div>

      </div>

    </div>
  );
}