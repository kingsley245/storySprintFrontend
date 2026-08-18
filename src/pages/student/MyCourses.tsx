import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  RefreshCw,
  Play,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  active: boolean;
  enrolledAt?: string;
}

interface Lesson {
  id: string;
  title: string;
  lessonOrder?: number;
  orderIndex?: number;
  position?: number;
}

interface Progress {
  lessonId: string;
  lastPositionSeconds: number;
  completionPercentage: number;
  completed: boolean;
}

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail?: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState<EnrolledCourse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /*
   * =====================================================
   * GET USER ID
   * =====================================================
   */

  const getUserId = () => {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      return user?.id || null;
    } catch (err) {
      console.error(
        'Failed to parse stored user:',
        err
      );

      return null;
    }
  };

  /*
   * =====================================================
   * LOAD COURSES
   * =====================================================
   */

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const userId = getUserId();

      if (!userId) {
        setError(
          'Unable to identify your account. Please login again.'
        );

        return;
      }

      /*
       * Get enrolled courses
       */

      const enrollmentResponse =
        await api.get<Enrollment[]>(
          `/enrollments/user/${userId}`
        );

      const enrollments =
        Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

      const activeEnrollments =
        enrollments.filter(
          (enrollment) =>
            enrollment.active
        );

      /*
       * Load lessons and progress
       * for every enrolled course.
       */

      const courseResults =
        await Promise.all(
          activeEnrollments.map(
            async (enrollment) => {
              try {
                /*
                 * Get course lessons
                 */

                const lessonsResponse =
                  await api.get<Lesson[]>(
                    `/courses/${enrollment.courseId}/lessons`
                  );

                const lessons =
                  Array.isArray(
                    lessonsResponse.data
                  )
                    ? lessonsResponse.data
                    : [];

                /*
                 * Get progress for every lesson
                 */

                const progressResults =
                  await Promise.all(
                    lessons.map(
                      async (lesson) => {
                        try {
                          const response =
                            await api.get<Progress>(
                              `/progress/${userId}/${lesson.id}`
                            );

                          return response.data;
                        } catch {
                          /*
                           * Lesson has no progress yet.
                           */
                          return null;
                        }
                      }
                    )
                  );

                const validProgress =
                  progressResults.filter(
                    (
                      item
                    ): item is Progress =>
                      item !== null
                  );

                /*
                 * Completed lessons
                 */

                const completedLessons =
                  validProgress.filter(
                    (progress) =>
                      progress.completed
                  ).length;

                /*
                 * Course progress
                 *
                 * Average lesson completion.
                 */

                let progress = 0;

                if (lessons.length > 0) {
                  const totalPercentage =
                    progressResults.reduce(
                      (
                        total,
                        item
                      ) => {
                        return (
                          total +
                          (
                            item?.completionPercentage ||
                            0
                          )
                        );
                      },
                      0
                    );

                  progress =
                    Math.round(
                      totalPercentage /
                        lessons.length
                    );
                }

                return {
                  id: enrollment.courseId,

                  title:
                    enrollment.courseTitle,

                  thumbnail:
                    enrollment.courseThumbnail,

                  progress,

                  completedLessons,

                  totalLessons:
                    lessons.length,
                };
              } catch (err) {
                console.error(
                  `Failed to load course ${enrollment.courseId}`,
                  err
                );

                /*
                 * Still show the course
                 * even if lessons fail.
                 */

                return {
                  id: enrollment.courseId,

                  title:
                    enrollment.courseTitle,

                  thumbnail:
                    enrollment.courseThumbnail,

                  progress: 0,

                  completedLessons: 0,

                  totalLessons: 0,
                };
              }
            }
          )
        );

      setCourses(courseResults);
    } catch (err: any) {
      console.error(
        'Failed to load courses:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to load your courses.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    fetchCourses();
  }, []);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
          <RefreshCw className="w-7 h-7 text-brand animate-spin" />

          <p className="text-sm text-gray-500 mt-4">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />

          <h2 className="text-base font-semibold text-red-700 mt-3">
            Unable to load courses
          </h2>

          <p className="text-sm text-red-500 mt-1">
            {error}
          </p>

          <button
            onClick={fetchCourses}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand-dark"
          >
            <RefreshCw className="w-4 h-4" />

            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * MAIN PAGE
   * =====================================================
   */

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Courses
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            All courses you're enrolled in.
          </p>
        </div>

        <button
          onClick={fetchCourses}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          title="Refresh courses"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* EMPTY */}

      {courses.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>

          <h2 className="text-base font-semibold text-gray-900 mt-4">
            No courses yet
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            You haven't been enrolled in any courses yet.
          </p>
        </div>
      )}

      {/* COURSES */}

      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() =>
                navigate(
                  `/student/courses/${course.id}`
                )
              }
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-brand/20 transition-all cursor-pointer"
            >

              {/* THUMBNAIL */}

              <div className="h-44 w-full bg-gray-100 overflow-hidden">
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

              {/* BODY */}

              <div className="p-5 space-y-4 flex-1">

                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {course.title}
                </h3>

                {/* PROGRESS */}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Progress
                    </span>

                    <span className="text-xs font-semibold text-brand">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* LESSON COUNT */}

                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>
                    {course.completedLessons}/
                    {course.totalLessons} Lessons
                  </span>

                  {course.progress === 100 && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  )}
                </div>

              </div>

              {/* ACTION */}

              <div className="p-5 pt-0">

                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    navigate(
                      `/student/courses/${course.id}`
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />

                  {course.progress > 0
                    ? 'Continue Learning'
                    : 'Start Learning'}
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}