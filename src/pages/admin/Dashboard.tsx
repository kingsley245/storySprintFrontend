import { useEffect, useState } from 'react';
// import api from '../../../api/axios';
import { Users, BookOpen, Video, Activity, LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Type Definitions ---
interface DashboardStats {
  students: number;
  courses: number;
  lessons: number;
  activeStudents: number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface StatCardProps {
  title: string;
  count: string | number;
  change: string;
  icon: LucideIcon;
}

interface ProgressBarProps {
  label: string;
  percentage: number;
}

// --- Main Component ---
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    students: 245,
    courses: 18,
    lessons: 126,
    activeStudents: 218,
  });

  const chartData: ChartDataItem[] = [
    { name: 'May 10', value: 150 },
    { name: 'May 11', value: 90 },
    { name: 'May 12', value: 120 },
    { name: 'May 13', value: 160 },
    { name: 'May 14', value: 140 },
    { name: 'May 15', value: 180 },
    { name: 'May 16', value: 150 },
  ];

  useEffect(() => {
    // Connect to your backend port 8081:
    // api.get('/admin/dashboard-stats').then(res => setStats(res.data));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Admin 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Students" count={stats.students} change="+12 this week" icon={Users} />
        <StatCard title="Courses" count={stats.courses} change="+2 this week" icon={BookOpen} />
        <StatCard title="Lessons" count={stats.lessons} change="+15 this week" icon={Video} />
        <StatCard title="Active Students" count={stats.activeStudents} change="88.2% of total" icon={Activity} />
      </div>

      {/* Analytics Chart & Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Student Activity (Last 7 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#5b46e0" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Course Performance</h2>
          <div className="space-y-4">
            <ProgressBar label="Video Editing Masterclass" percentage={82} />
            <ProgressBar label="Storytelling for Beginners" percentage={71} />
            <ProgressBar label="YouTube Growth Guide" percentage={63} />
          </div>
          <button className="mt-4 text-xs font-semibold text-brand hover:underline">View detailed analytics →</button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function StatCard({ title, count, change, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
          {change}
        </span>
      </div>
      <div className="p-2.5 bg-gray-50 rounded-lg text-brand">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function ProgressBar({ label, percentage }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className="bg-brand h-full rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}