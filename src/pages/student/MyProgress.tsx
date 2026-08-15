import React, { useState } from 'react';

interface CourseProgress {
  id: string;
  title: string;
  percentage: number;
}

export default function MyProgress() {

  const [overallProgress] = useState(68);


  const [courses] = useState<CourseProgress[]>([
    { id: '1', title: 'Video Editing Masterclass', percentage: 75 },
    { id: '2', title: 'Storytelling for Beginners', percentage: 40 },
    { id: '3', title: 'YouTube Growth Guide', percentage: 20 },
  ]);

  // Bottom stats row values
  const stats = {
    completedLessons: '24 / 36',
    studyTime: '45h 30m',
    certificates: '0',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your learning progress.</p>
      </div>

      {/* 1. Overall Progress Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">Overall Progress</span>
          <span className="text-2xl font-extrabold text-gray-900">{overallProgress}%</span>
        </div>

        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Courses Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-gray-800">Courses</h3>

        <div className="space-y-5">
          {courses.map((course) => (
            <div key={course.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                <span className="truncate pr-2">{course.title}</span>
                <span>{course.percentage}%</span>
              </div>

              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        
        {/* Lessons Completed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
          <p className="text-[11px] font-semibold text-gray-400">Lessons Completed</p>
          <p className="text-xl font-bold text-gray-900">{stats.completedLessons}</p>
        </div>

        {/* Study Time */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
          <p className="text-[11px] font-semibold text-gray-400">Study Time</p>
          <p className="text-xl font-bold text-gray-900">{stats.studyTime}</p>
        </div>

        {/* Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
          <p className="text-[11px] font-semibold text-gray-400">Certificates</p>
          <p className="text-xl font-bold text-gray-900">{stats.certificates}</p>
        </div>

      </div>

    </div>
  );
}