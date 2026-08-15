import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';

interface LessonItem {
  id: string;
  orderNumber: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course] = useState({
    title: 'Video Editing Masterclass',
    description: 'Learn professional video editing from beginner to advanced.',
    progress: 70,
  });

  const [lessons] = useState<LessonItem[]>([
    { id: '1', orderNumber: '01', title: 'Introduction to Video Editing', isCompleted: true, isLocked: false },
    { id: '2', orderNumber: '02', title: 'Understanding Timeline', isCompleted: true, isLocked: false },
    { id: '3', orderNumber: '03', title: 'Cutting & Transitions', isCompleted: true, isLocked: false },
    { id: '4', orderNumber: '04', title: 'Color Grading', isCompleted: true, isLocked: false },
    { id: '5', orderNumber: '05', title: 'Audio Editing', isCompleted: true, isLocked: false },
    { id: '6', orderNumber: '06', title: 'Advanced Editing', isCompleted: false, isLocked: true },
    { id: '7', orderNumber: '07', title: 'Final Project', isCompleted: false, isLocked: true },
  ]);

  const handleLessonClick = (lesson: LessonItem) => {
    if (!lesson.isLocked) {
      navigate(`/student/courses/${courseId}/lessons/${lesson.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Overall Progress */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500">{course.progress}% Complete</span>
            <span className="text-emerald-600 font-bold">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Content Header & Lesson List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Course Content</h2>

        <div className="space-y-2.5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              className={`bg-white p-4 rounded-xl border transition-all flex items-center justify-between ${
                lesson.isLocked
                  ? 'border-gray-100 opacity-60 cursor-not-allowed'
                  : 'border-gray-100 shadow-sm hover:border-brand/30 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  {lesson.orderNumber}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {lesson.title}
                </span>
              </div>

              <div>
                {lesson.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : lesson.isLocked ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-brand" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}