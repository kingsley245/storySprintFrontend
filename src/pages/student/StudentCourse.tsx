import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  orderIndex?: number;
  position?: number;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export default function StudentCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * Load course
         */
        const courseResponse = await api.get(
          `/courses/${courseId}`
        );

        setCourse(courseResponse.data);

        /*
         * Load lessons belonging to this course
         */
        const lessonsResponse = await api.get(
          `/courses/${courseId}/lessons`
        );

        setLessons(
          Array.isArray(lessonsResponse.data)
            ? lessonsResponse.data
            : []
        );

      } catch (err: any) {
        console.error(
          'Failed to load course:',
          err
        );

        setError(
          err?.response?.data?.message ||
            'Unable to load this course.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-brand" />

          <p className="text-sm">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

          <div>
            <h3 className="font-semibold text-red-800">
              Unable to load course
            </h3>

            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>

            <button
              onClick={() => navigate('/student/dashboard')}
              className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Back */}
      <button
        onClick={() => navigate('/student/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />

        Back to Dashboard
      </button>

      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="h-56 bg-gray-100 overflow-hidden">

          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
          )}

        </div>

        <div className="p-6">

          <h1 className="text-2xl font-bold text-gray-900">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-3xl">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500">
            <BookOpen className="w-4 h-4" />

            {lessons.length} lessons
          </div>

        </div>

      </div>

      {/* Lessons */}
      <div className="space-y-4">

        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Course Lessons
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Select a lesson to start learning.
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-gray-300" />

            <p className="font-semibold text-gray-800 mt-4">
              No lessons available
            </p>

            <p className="text-sm text-gray-500 mt-1">
              This course does not have any lessons yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() =>
                  navigate(
                    `/student/courses/${courseId}/learn/${lesson.id}`
                  )
                }
                className="w-full flex items-center gap-4 p-5 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors text-left"
              >

                {/* Number */}
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-brand" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">

                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Lesson {index + 1}
                  </p>

                </div>

                {/* Right */}
                <div className="flex items-center gap-3">

                  <CheckCircle2 className="w-4 h-4 text-gray-300" />

                  <ChevronRight className="w-4 h-4 text-gray-400" />

                </div>

              </button>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}