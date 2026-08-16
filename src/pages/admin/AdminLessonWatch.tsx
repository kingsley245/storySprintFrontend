import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Video as VideoIcon,
  AlertCircle,
  Maximize,
} from 'lucide-react';
import api from '../../api/axios';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  lessonOrder: number;
  durationMinutes: number;
  preview: boolean;
  published: boolean;
  courseId: string;
  createdAt: string;
}

export default function AdminLessonWatch() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId || !lessonId) {
      setError('Course or lesson ID is missing.');
      setLoading(false);
      return;
    }

    fetchLesson();
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(
        `/admin/courses/${courseId}/lessons/${lessonId}`
      );

      console.log('LESSON RESPONSE:', response.data);

      setLesson(response.data);
    } catch (err: any) {
      console.error('Failed to load lesson:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load this lesson.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Converts a backend relative URL such as:
   *
   * /uploads/lessons/videos/file.mp4
   *
   * into:
   *
   * http://192.168.0.144:8081/uploads/lessons/videos/file.mp4
   */
  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) {
      return '';
    }

    // Already an absolute URL
    if (
      videoUrl.startsWith('http://') ||
      videoUrl.startsWith('https://')
    ) {
      return videoUrl;
    }

    const baseURL = (import.meta as any).env.VITE_API_URL;

    if (!baseURL) {
      return videoUrl;
    }

    return `${baseURL.replace(/\/api\/?$/, '')}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
  };

  const handleFullscreen = () => {
    const video = document.getElementById(
      'lesson-video'
    ) as HTMLVideoElement | null;

    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-32 bg-gray-200 rounded" />

          <div className="h-[450px] bg-gray-200 rounded-2xl" />

          <div className="h-8 w-2/3 bg-gray-200 rounded" />

          <div className="h-20 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900">
            Unable to load lesson
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error || 'Lesson could not be found.'}
          </p>

          <button
            onClick={() =>
              navigate(`/admin/courses/${courseId}`)
            }
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = lesson.videoUrl
    ? getVideoUrl(lesson.videoUrl)
    : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() =>
            navigate(`/admin/courses/${courseId}`)
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

        <div className="flex items-center gap-2">
          {lesson.published ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
              <EyeOff className="w-3.5 h-3.5" />
              Unpublished
            </span>
          )}
        </div>
      </div>

      {/* Lesson title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand mb-2">
          <VideoIcon className="w-4 h-4" />
          LESSON {String(lesson.lessonOrder).padStart(2, '0')}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {lesson.title}
        </h1>

        {lesson.description && (
          <p className="text-sm text-gray-500 mt-2 max-w-3xl">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
        {videoUrl ? (
          <div className="relative group">

            <video
              id="lesson-video"
              key={videoUrl}
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video object-contain bg-black"
              onError={(e) => {
                console.error(
                  'VIDEO PLAYBACK ERROR:',
                  e
                );
              }}
            >
              Your browser does not support the video
              player.
            </video>

            {/* Fullscreen button */}
            <button
              type="button"
              onClick={handleFullscreen}
              className="absolute right-4 bottom-14 p-2.5 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center text-white">
            <Play className="w-12 h-12 text-gray-500 mb-4" />

            <h3 className="font-semibold">
              No video uploaded
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              This lesson does not have a video yet.
            </p>
          </div>
        )}
      </div>

      {/* Video URL - useful for debugging */}
      {videoUrl && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 mb-1">
            VIDEO URL
          </p>

          <p className="text-xs text-gray-600 break-all">
            {videoUrl}
          </p>
        </div>
      )}

      {/* Lesson Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Duration */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">
                Duration
              </p>

              <p className="text-sm font-bold text-gray-900">
                {lesson.durationMinutes} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              {lesson.preview ? (
                <Eye className="w-5 h-5 text-purple-500" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">
                Preview
              </p>

              <p className="text-sm font-bold text-gray-900">
                {lesson.preview
                  ? 'Available as preview'
                  : 'Members only'}
              </p>
            </div>
          </div>
        </div>

        {/* Publication */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">
                Status
              </p>

              <p className="text-sm font-bold text-gray-900">
                {lesson.published
                  ? 'Published'
                  : 'Draft'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {lesson.description && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">
            About this lesson
          </h2>

          <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
            {lesson.description}
          </p>
        </div>
      )}

    </div>
  );
}