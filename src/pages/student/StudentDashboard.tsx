import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ChevronRight } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  currentLesson?: string;
  totalLessons?: number;
  currentLessonNumber?: number;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userName = 'John';

  // Active course in progress
  const activeCourse: EnrolledCourse = {
    id: '1',
    title: 'Video Editing Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
    progress: 75,
    currentLesson: 'Color Grading',
    currentLessonNumber: 8,
    totalLessons: 12,
  };

  // Enrolled courses list
  const [courses] = useState<EnrolledCourse[]>([
    {
      id: '1',
      title: 'Video Editing Masterclass',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
      progress: 75,
    },
    {
      id: '2',
      title: 'Storytelling for Beginners',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      progress: 40,
    },
    {
      id: '3',
      title: 'YouTube Growth Guide',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
      progress: 20,
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Welcome back, {userName} <span className="text-xl">👋</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Let's continue your learning journey.</p>
      </div>

      {/* Continue Learning Featured Card */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-800">Continue Learning</h2>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Details & Action */}
          <div className="space-y-4 flex-1 w-full">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{activeCourse.title}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Lesson {activeCourse.currentLessonNumber} of {activeCourse.totalLessons} - {activeCourse.currentLesson}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-end text-xs font-bold text-gray-700">
                {activeCourse.progress}%
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeCourse.progress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate(`/student/courses/${activeCourse.id}/learn`)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <PlayCircle className="w-4 h-4 fill-white/20" />
              Continue Learning
            </button>
          </div>

          {/* Media Thumbnail */}
          <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
            <img
              src={activeCourse.thumbnail}
              alt={activeCourse.title}
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>

      {/* My Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">My Courses</h2>
          <button
            onClick={() => navigate('/student/courses')}
            className="text-xs font-semibold text-brand hover:text-brand-dark inline-flex items-center gap-0.5 transition-colors"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/student/courses/${course.id}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-36 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500">
                      {course.progress}% Complete
                    </p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand h-full rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}