import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown, 
  Clock 
} from 'lucide-react';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('May 10 - May 16, 2024');

  // Stats Card Data
  const stats = [
    {
      title: 'Total Students',
      value: '245',
      change: '+12 this week',
      isPositive: true,
    },
    {
      title: 'Completion Rate',
      value: '68%',
      change: '+8% this week',
      isPositive: true,
    },
    {
      title: 'Engagement',
      value: '82%',
      change: '+4% this week',
      isPositive: true,
    },
    {
      title: 'Watch Time',
      value: '1,280h',
      change: '+100h this week',
      isPositive: true,
      isNeutral: true,
    },
  ];

  // Course Completion Progress
  const courseCompletions = [
    { title: 'Video Editing Masterclass', percentage: 82 },
    { title: 'Storytelling for Beginners', percentage: 71 },
    { title: 'YouTube Growth Guide', percentage: 63 },
  ];

  // Most Active Students
  const activeStudents = [
    { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', time: '12h 45m' },
    { name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', time: '10h 30m' },
    { name: 'Michael Lee', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', time: '8h 15m' },
  ];

  // Most Active Courses
  const activeCourses = [
    { title: 'Video Editing Masterclass', percentage: 85 },
    { title: 'YouTube Growth Guide', percentage: 75 },
    { title: 'Storytelling for Beginners', percentage: 60 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Top Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your platform performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-100 shadow-sm">
            <Bell className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-medium text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{dateRange}</span>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-100 shadow-sm">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <p className="text-xs font-medium text-gray-500">{stat.title}</p>
            <h2 className="text-2xl font-extrabold text-gray-900">{stat.value}</h2>
            
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <span className={stat.isNeutral ? "text-emerald-600" : "text-emerald-600 flex items-center gap-0.5"}>
                {!stat.isNeutral && <TrendingUp className="w-3 h-3" />}
                {stat.isNeutral && <Clock className="w-3 h-3 inline mr-0.5" />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Student Growth Chart & Course Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Growth Line Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Student Growth</h3>
          
          <div className="h-48 w-full pt-4">
            {/* SVG Line Chart */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              {/* Background Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#f3f4f6" strokeWidth="1" />

              {/* Smooth Trend Path */}
              <path
                d="M 20 120 L 100 100 L 170 130 L 250 80 L 330 30 L 400 70 L 480 20"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              <circle cx="20" cy="120" r="3.5" fill="#6366f1" />
              <circle cx="100" cy="100" r="3.5" fill="#6366f1" />
              <circle cx="170" cy="130" r="3.5" fill="#6366f1" />
              <circle cx="250" cy="80" r="3.5" fill="#6366f1" />
              <circle cx="330" cy="30" r="3.5" fill="#6366f1" />
              <circle cx="400" cy="70" r="3.5" fill="#6366f1" />
              <circle cx="480" cy="20" r="3.5" fill="#6366f1" />
            </svg>
          </div>

          {/* X-Axis Dates */}
          <div className="flex justify-between text-[11px] font-medium text-gray-400 pt-2 px-1">
            <span>May 10</span>
            <span>May 11</span>
            <span>May 12</span>
            <span>May 14</span>
            <span>May 15</span>
            <span>May 16</span>
          </div>
        </div>

        {/* Course Completion Progress Bars (1/3 width) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Course Completion</h3>
          
          <div className="space-y-4 pt-1">
            {courseCompletions.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span className="truncate pr-2">{item.title}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Most Active Students & Most Active Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Active Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Most Active Students</h3>
          
          <div className="space-y-3.5">
            {activeStudents.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-1">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-gray-800">{student.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-500">{student.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Courses */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Most Active Courses</h3>
          
          <div className="space-y-4 pt-1">
            {activeCourses.map((course, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span className="truncate pr-2">{course.title}</span>
                  <span>{course.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}