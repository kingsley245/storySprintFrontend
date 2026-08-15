import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function MyCourses() {
  const navigate = useNavigate();

  // Enrolled courses state matching the layout in UI 10
  const [courses] = useState<EnrolledCourse[]>([
    {
      id: '1',
      title: 'Video Editing Masterclass',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
      progress: 75,
      completedLessons: 9,
      totalLessons: 12,
    },
    {
      id: '2',
      title: 'Storytelling for Beginners',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      progress: 40,
      completedLessons: 4,
      totalLessons: 10,
    },
    {
      id: '3',
      title: 'YouTube Growth Guide',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
      progress: 20,
      completedLessons: 3,
      totalLessons: 15,
    },
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">All courses you're enrolled in.</p>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Thumbnail */}
              <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {course.title}
                </h3>

                {/* Metrics */}
                <div className="space-y-1 text-xs text-gray-500 font-medium">
                  <p>{course.progress}% Complete</p>
                  <p>
                    {course.completedLessons}/{course.totalLessons} Lessons
                  </p>
                </div>
              </div>
            </div>

            {/* Continue Action Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-brand text-xs font-semibold rounded-xl border border-gray-100 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}