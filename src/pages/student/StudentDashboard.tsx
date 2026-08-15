// src/pages/student/Dashboard.tsx
export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName || 'Student'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Let's continue your learning journey.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">Continue Learning</h2>
        <p className="text-xs text-gray-500">Select a course from your dashboard to pick up where you left off.</p>
      </div>
    </div>
  );
}