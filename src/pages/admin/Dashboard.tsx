import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Video,
  Activity,
  LucideIcon,
  RefreshCw,
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import api from '../../api/axios';




interface ActivityData {
  name: string;
  value: number;
}

interface CoursePerformance {
  courseId: string;
  name: string;
  percentage: number;
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalCourses: number;
  totalLessons: number;
  totalVideos: number;
  totalResources: number;
  totalEnrollments: number;

  activeStudents: number;
  activePercentage: number;

  studentActivity: ActivityData[];
  coursePerformance: CoursePerformance[];
}

interface StatCardProps {
  title: string;
  count: string | number;
  description: string;
  icon: LucideIcon;
}

interface ProgressBarProps {
  label: string;
  percentage: number;
}




export default function AdminDashboard() {

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);




  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError(null);

      const response = await api.get<DashboardStats>(
        '/admin/dashboard'
      );

      setStats(response.data);

    } catch (error) {

      console.error(
        'Failed to fetch admin dashboard:',
        error
      );

      setError(
        'Unable to load dashboard data. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchDashboard();
  }, []);



  if (loading) {

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="flex items-center justify-center min-h-[400px]">

          <div className="flex flex-col items-center gap-3">

            <RefreshCw className="w-7 h-7 text-brand animate-spin" />

            <p className="text-sm text-gray-500">
              Loading dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }



  // ERROR STATE
  

  if (error || !stats) {

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">

          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">

            <Activity className="w-6 h-6 text-red-500" />

          </div>

          <h2 className="text-sm font-semibold text-gray-900">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

        </div>

      </div>
    );
  }


  // ====================================================
  // DASHBOARD
  // ====================================================

  return (

    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Good morning, Admin 👋
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with your platform today.
          </p>

        </div>


        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >

          <RefreshCw className="w-4 h-4" />

          Refresh

        </button>

      </div>


      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">

        <StatCard
          title="Students"
          count={stats.totalStudents}
          description="Registered students"
          icon={Users}
        />

        <StatCard
          title="Courses"
          count={stats.totalCourses}
          description="Available courses"
          icon={BookOpen}
        />

        <StatCard
          title="Lessons"
          count={stats.totalLessons}
          description="Total lessons"
          icon={Video}
        />

        <StatCard
          title="Active Students"
          count={stats.activeStudents}
          description={`${stats.activePercentage}% of students`}
          icon={Activity}
        />

      </div>


      {/* ==================================================
          ANALYTICS
      ================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">


        {/* ==================================================
            STUDENT ACTIVITY
        ================================================== */}

        <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">

          <div className="mb-5">

            <h2 className="text-sm font-semibold text-gray-800">
              Student Activity
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Learning activity over the last 7 days
            </p>

          </div>


          <div className="h-56 sm:h-64 w-full">

            {stats.studentActivity.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={stats.studentActivity}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#5b46e0"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center">

                <p className="text-sm text-gray-400">
                  No activity data available.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            COURSE PERFORMANCE
        ================================================== */}

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">

          <div className="mb-5">

            <h2 className="text-sm font-semibold text-gray-800">
              Course Performance
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Average student completion
            </p>

          </div>


          {stats.coursePerformance.length > 0 ? (

            <div className="space-y-5">

              {stats.coursePerformance
                .slice(0, 5)
                .map((course) => (

                  <ProgressBar
                    key={course.courseId}
                    label={course.name}
                    percentage={course.percentage}
                  />

                ))}

            </div>

          ) : (

            <div className="min-h-[180px] flex items-center justify-center text-center">

              <div>

                <div className="w-10 h-10 mx-auto rounded-full bg-gray-50 flex items-center justify-center">

                  <BookOpen className="w-5 h-5 text-gray-400" />

                </div>

                <p className="text-sm font-medium text-gray-600 mt-3">
                  No course performance yet
                </p>

                <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                  Performance data will appear when students start making progress.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          PLATFORM OVERVIEW
      ================================================== */}

      <div>

        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          Platform Overview
        </h2>


        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

{/* 
          <OverviewItem
            label="Users"
            value={stats.totalUsers}
          /> */}

          {/* <OverviewItem
            label="Videos"
            value={stats.totalVideos}
          /> */}

          <OverviewItem
            label="Resources"
            value={stats.totalResources}
          />

          <OverviewItem
            label="Enrollments"
            value={stats.totalEnrollments}
          />

        </div>

      </div>

    </div>
  );
}



// STAT CARD


function StatCard({
  title,
  count,
  description,
  icon: Icon,
}: StatCardProps) {

  return (

    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between gap-4">

      <div className="min-w-0">

        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>

        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {count}
        </p>

        <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
          {description}
        </p>

      </div>


      <div className="shrink-0 p-2.5 bg-gray-50 rounded-lg text-brand">

        <Icon className="w-5 h-5" />

      </div>

    </div>
  );
}



// PROGRESS BAR


function ProgressBar({
  label,
  percentage,
}: ProgressBarProps) {

  const safePercentage = Math.min(
    100,
    Math.max(0, percentage)
  );

  return (

    <div>

      <div className="flex items-start justify-between gap-3 text-xs mb-2">

        <span className="font-medium text-gray-700 truncate">
          {label}
        </span>

        <span className="font-bold text-gray-900 shrink-0">
          {safePercentage.toFixed(0)}%
        </span>

      </div>


      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">

        <div
          className="bg-brand h-full rounded-full transition-all duration-500"
          style={{
            width: `${safePercentage}%`,
          }}
        />

      </div>

    </div>
  );
}



// OVERVIEW ITEM


function OverviewItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="text-xl font-bold text-gray-900 mt-1">
        {value}
      </p>

    </div>
  );
}