import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import {
  Bell,
  Calendar,
  MoreVertical,
  TrendingUp,
  Clock,
  Loader2,
  AlertTriangle,
  Users,
  BarChart3,
} from 'lucide-react';

interface StudentGrowth {
  date: string;
  students: number;
}

interface CourseCompletion {
  courseId: string;
  title: string;
  percentage: number;
}

interface ActiveStudent {
  studentId: string;
  name: string;
  watchTimeSeconds: number;
}

interface ActiveCourse {
  courseId: string;
  title: string;
  percentage: number;
}

interface AnalyticsResponse {
  totalStudents: number;
  completionRate: number;
  engagementRate: number;
  totalWatchTimeSeconds: number;
  studentGrowth: StudentGrowth[];
  courseCompletions: CourseCompletion[];
  activeStudents: ActiveStudent[];
  activeCourses: ActiveCourse[];
}

export default function Analytics() {

  const [analytics, setAnalytics] =
    useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {

    const loadAnalytics = async () => {

      try {

        setLoading(true);
        setError('');

        const response =
          await api.get('/admin/analytics');

        setAnalytics(response.data);

      } catch (err: any) {

        console.error(
          'Failed to load analytics:',
          err
        );

        setError(
          err?.response?.data?.message ||
          'Failed to load analytics.'
        );

      } finally {

        setLoading(false);
      }
    };

    loadAnalytics();

  }, []);


  const formatWatchTime = (
    seconds: number
  ) => {

    const hours =
      Math.floor(seconds / 3600);

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };


  const growthPoints =
    analytics?.studentGrowth ?? [];


  const maxStudents =
    Math.max(
      ...growthPoints.map(
        point => point.students
      ),
      1
    );


  if (loading) {

    return (
      <div className="min-h-[500px] flex items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="w-8 h-8 animate-spin text-brand" />

          <p className="text-sm text-gray-500">
            Loading analytics...
          </p>

        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="space-y-4">

        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertTriangle className="w-5 h-5" />

          <span className="text-sm">
            {error}
          </span>

        </div>

      </div>
    );
  }


  if (!analytics) {
    return null;
  }


  return (

    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Track your platform performance.
          </p>

        </div>


        <div className="flex items-center gap-3">

          <button className="p-2 text-gray-400 bg-white rounded-lg border border-gray-100 shadow-sm">

            <Bell className="w-4 h-4" />

          </button>


          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-medium text-gray-700">

            <Calendar className="w-3.5 h-3.5 text-gray-400" />

            <span>
              Platform Overview
            </span>

          </div>


          <button className="p-2 text-gray-400 bg-white rounded-lg border border-gray-100 shadow-sm">

            <MoreVertical className="w-4 h-4" />

          </button>

        </div>

      </div>


      {/* STAT CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Students"
          value={analytics.totalStudents.toString()}
          icon={<Users className="w-4 h-4" />}
        />

        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <StatCard
          title="Engagement"
          value={`${analytics.engagementRate}%`}
          icon={<BarChart3 className="w-4 h-4" />}
        />

        <StatCard
          title="Watch Time"
          value={formatWatchTime(
            analytics.totalWatchTimeSeconds
          )}
          icon={<Clock className="w-4 h-4" />}
        />

      </div>


      {/* GROWTH + COURSE COMPLETION */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* STUDENT GROWTH */}

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Student Growth
          </h3>

          {growthPoints.length === 0 ? (

            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              No student growth data yet.
            </div>

          ) : (

            <div className="mt-6 h-52">

              <svg
                className="w-full h-full"
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
              >

                {/* GRID */}

                <line
                  x1="20"
                  y1="30"
                  x2="680"
                  y2="30"
                  stroke="#f1f5f9"
                />

                <line
                  x1="20"
                  y1="110"
                  x2="680"
                  y2="110"
                  stroke="#f1f5f9"
                />

                <line
                  x1="20"
                  y1="190"
                  x2="680"
                  y2="190"
                  stroke="#f1f5f9"
                />


                {/* LINE */}

                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={
                    growthPoints
                      .map((point, index) => {

                        const x =
                          growthPoints.length === 1
                            ? 350
                            : 20 +
                              (
                                index /
                                (
                                  growthPoints.length - 1
                                )
                              ) *
                              660;

                        const y =
                          190 -
                          (
                            point.students /
                            maxStudents
                          ) *
                          160;

                        return `${x},${y}`;
                      })
                      .join(' ')
                  }
                />


                {/* POINTS */}

                {growthPoints.map(
                  (point, index) => {

                    const x =
                      growthPoints.length === 1
                        ? 350
                        : 20 +
                          (
                            index /
                            (
                              growthPoints.length - 1
                            )
                          ) *
                          660;

                    const y =
                      190 -
                      (
                        point.students /
                        maxStudents
                      ) *
                      160;

                    return (
                      <circle
                        key={point.date}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#6366f1"
                      />
                    );
                  }
                )}

              </svg>

            </div>
          )}

        </div>


        {/* COURSE COMPLETION */}

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Course Completion
          </h3>


          <div className="space-y-5 mt-5">

            {analytics.courseCompletions.length === 0 ? (

              <p className="text-sm text-gray-400">
                No course progress yet.
              </p>

            ) : (

              analytics.courseCompletions.map(
                course => (

                  <div
                    key={course.courseId}
                    className="space-y-1.5"
                  >

                    <div className="flex justify-between text-xs font-semibold text-gray-700">

                      <span className="truncate pr-2">
                        {course.title}
                      </span>

                      <span>
                        {course.percentage}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">

                      <div
                        className="bg-brand h-full rounded-full transition-all duration-500"
                        style={{
                          width:
                            `${Math.min(
                              course.percentage,
                              100
                            )}%`
                        }}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      {/* ACTIVE STUDENTS + COURSES */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* ACTIVE STUDENTS */}

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Most Active Students
          </h3>


          <div className="space-y-4 mt-5">

            {analytics.activeStudents.length === 0 ? (

              <p className="text-sm text-gray-400">
                No student activity yet.
              </p>

            ) : (

              analytics.activeStudents.map(
                student => (

                  <div
                    key={student.studentId}
                    className="flex items-center justify-between"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">

                        {student.name
                          .split(' ')
                          .map(
                            part =>
                              part[0]
                          )
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}

                      </div>

                      <span className="text-xs font-semibold text-gray-800">
                        {student.name}
                      </span>

                    </div>


                    <span className="text-xs font-medium text-gray-500">
                      {formatWatchTime(
                        student.watchTimeSeconds
                      )}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* ACTIVE COURSES */}

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Most Active Courses
          </h3>


          <div className="space-y-5 mt-5">

            {analytics.activeCourses.length === 0 ? (

              <p className="text-sm text-gray-400">
                No course activity yet.
              </p>

            ) : (

              analytics.activeCourses.map(
                course => (

                  <div
                    key={course.courseId}
                    className="space-y-1.5"
                  >

                    <div className="flex justify-between text-xs font-semibold text-gray-700">

                      <span className="truncate pr-2">
                        {course.title}
                      </span>

                      <span>
                        {course.percentage}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">

                      <div
                        className="bg-brand h-full rounded-full"
                        style={{
                          width:
                            `${Math.min(
                              course.percentage,
                              100
                            )}%`
                        }}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </div>
  );
}


/* ==========================================
   STAT CARD
   ========================================== */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>

        <div className="text-brand">
          {icon}
        </div>

      </div>

      <h2 className="text-2xl font-extrabold text-gray-900">
        {value}
      </h2>

    </div>
  );
}