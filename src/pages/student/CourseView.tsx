import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Lock,
  PlayCircle,
  Video,
} from 'lucide-react';

import api from '../../api/axios';

/* =========================================================
   TYPES
========================================================= */

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  status?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  videoUrl?: string;
  lessonOrder?: number;
  orderIndex?: number;
  position?: number;
  durationMinutes?: number;
  preview?: boolean;
  published?: boolean;
}

interface LessonProgress {
  lessonId: string;
  lastPositionSeconds: number;
  completionPercentage: number;
  completed: boolean;
}

interface Resource {
  id: string;
  title: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  filePath: string;
  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CourseView() {
  const { courseId } = useParams<{
    courseId: string;
  }>();

  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [progress, setProgress] =
    useState<Record<string, LessonProgress>>({});

  /*
   * Resources are stored by lesson ID.
   *
   * Example:
   *
   * resources = {
   *   "lesson-id-1": [...],
   *   "lesson-id-2": [...]
   * }
   */
  const [resources, setResources] =
    useState<Record<string, Resource[]>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* =======================================================
     GET LOGGED-IN USER
  ======================================================= */

  const getUserId = () => {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      return user?.id || null;
    } catch {
      return null;
    }
  };

  /* =======================================================
     LOAD COURSE
  ======================================================= */

  useEffect(() => {
    if (!courseId) {
      setError('Course ID is missing.');
      setLoading(false);
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError('');

        /* ================================================
           LOAD COURSE
        ================================================= */

        const courseResponse =
          await api.get(
            `/courses/${courseId}`
          );

        setCourse(courseResponse.data);

        /* ================================================
           LOAD LESSONS
        ================================================= */

        const lessonsResponse =
          await api.get(
            `/courses/${courseId}/lessons`
          );

        const loadedLessons: Lesson[] =
          Array.isArray(
            lessonsResponse.data
          )
            ? lessonsResponse.data
            : [];

        /* ================================================
           SORT LESSONS
        ================================================= */

        loadedLessons.sort((a, b) => {
          const orderA =
            a.lessonOrder ??
            a.orderIndex ??
            a.position ??
            0;

          const orderB =
            b.lessonOrder ??
            b.orderIndex ??
            b.position ??
            0;

          return orderA - orderB;
        });

        setLessons(loadedLessons);

        /* ================================================
           LOAD PROGRESS
        ================================================= */

        const userId = getUserId();

        if (
          userId &&
          loadedLessons.length > 0
        ) {
          const progressResults =
            await Promise.all(
              loadedLessons.map(
                async (lesson) => {
                  try {
                    const response =
                      await api.get(
                        `/progress/${userId}/${lesson.id}`
                      );

                    return response.data as LessonProgress;
                  } catch {
                    return null;
                  }
                }
              )
            );

          const progressMap: Record<
            string,
            LessonProgress
          > = {};

          progressResults.forEach(
            (item) => {
              if (item?.lessonId) {
                progressMap[
                  item.lessonId
                ] = item;
              }
            }
          );

          setProgress(progressMap);
        }

        /* ================================================
           LOAD RESOURCES
        ================================================= */

        if (loadedLessons.length > 0) {
          const resourceResults =
            await Promise.all(
              loadedLessons.map(
                async (lesson) => {
                  try {
                    const response =
                      await api.get(
                        `/lessons/${lesson.id}/resources`
                      );

                    return {
                      lessonId: lesson.id,
                      resources:
                        Array.isArray(
                          response.data
                        )
                          ? response.data
                          : [],
                    };
                  } catch (resourceError) {
                    console.warn(
                      `Could not load resources for lesson ${lesson.id}`,
                      resourceError
                    );

                    return {
                      lessonId: lesson.id,
                      resources: [],
                    };
                  }
                }
              )
            );

          const resourceMap: Record<
            string,
            Resource[]
          > = {};

          resourceResults.forEach(
            (item) => {
              resourceMap[
                item.lessonId
              ] = item.resources;
            }
          );

          setResources(resourceMap);
        }
      } catch (err: any) {
        console.error(
          'Failed to load course:',
          err
        );

        setError(
          err?.response?.data?.message ||
            'Unable to load course.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  /* =======================================================
     COMPLETED LESSONS
  ======================================================= */

  const completedLessons =
    lessons.filter(
      (lesson) =>
        progress[lesson.id]?.completed ===
        true
    ).length;

  /* =======================================================
     COURSE PROGRESS
  ======================================================= */

  const courseProgress =
    lessons.length > 0
      ? Math.round(
          (completedLessons /
            lessons.length) *
            100
        )
      : 0;

  /* =======================================================
     CHECK IF LESSON IS LOCKED
  ======================================================= */

  const isLessonLocked = (
    index: number
  ) => {
    /*
     * First lesson is always unlocked.
     */

    if (index === 0) {
      return false;
    }

    const previousLesson =
      lessons[index - 1];

    /*
     * Previous lesson must be completed.
     */

    return !progress[
      previousLesson.id
    ]?.completed;
  };

  /* =======================================================
     OPEN LESSON
  ======================================================= */

  const handleLessonClick = (
    lesson: Lesson,
    index: number
  ) => {
    if (!courseId) {
      return;
    }

    const locked =
      isLessonLocked(index);

    if (locked) {
      return;
    }

    navigate(
      `/student/courses/${courseId}/learn/${lesson.id}`
    );
  };

  /* =======================================================
     OPEN RESOURCE
  ======================================================= */

  const handleResourceClick = (
    resource: Resource,
    lesson: Lesson,
    index: number
  ) => {
    /*
     * Do not allow resources from locked lessons.
     */

    if (isLessonLocked(index)) {
      return;
    }

    if (!resource.filePath) {
      return;
    }

    /*
     * Open resource in a new browser tab.
     *
     * This is appropriate for external resources
     * such as Google Drive, Google Docs, PDFs,
     * etc.
     */

    window.open(
      resource.filePath,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* =======================================================
     CONTINUE LEARNING
  ======================================================= */

  const handleContinueLearning = () => {
    if (
      !courseId ||
      lessons.length === 0
    ) {
      return;
    }

    /*
     * Find first incomplete lesson.
     */

    const firstIncompleteIndex =
      lessons.findIndex(
        (lesson) =>
          !progress[lesson.id]
            ?.completed
      );

    const index =
      firstIncompleteIndex === -1
        ? lessons.length - 1
        : firstIncompleteIndex;

    const lesson = lessons[index];

    if (!lesson) {
      return;
    }

    /*
     * Safety check.
     */

    if (isLessonLocked(index)) {
      return;
    }

    navigate(
      `/student/courses/${courseId}/learn/${lesson.id}`
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-red-500 mt-0.5" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load course
              </h2>

              <p className="text-sm text-red-600 mt-1">
                {error ||
                  'Course not found.'}
              </p>

              <button
                onClick={() =>
                  navigate(
                    '/student/courses'
                  )
                }
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand-dark"
              >
                <ArrowLeft className="w-4 h-4" />

                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* ===================================================
          BACK
      =================================================== */}

      <button
        onClick={() =>
          navigate(
            '/student/courses'
          )
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />

        Back to Courses
      </button>

      {/* ===================================================
          COURSE HEADER
      =================================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* THUMBNAIL */}

        {course.thumbnail && (
          <div className="w-full h-56 md:h-72 bg-gray-100 overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            {/* COURSE INFO */}

            <div className="flex-1">

              {course.category && (
                <span className="inline-flex px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wide">
                  {course.category}
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-sm font-medium text-gray-600 mt-2">
                  {course.subtitle}
                </p>
              )}

              {course.description && (
                <p className="text-sm text-gray-500 mt-3 leading-7 max-w-3xl">
                  {course.description}
                </p>
              )}

            </div>

            {/* COURSE STATS */}

            <div className="flex items-center gap-4 shrink-0">

              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {lessons.length}
                </p>

                <p className="text-[11px] text-gray-400">
                  Lessons
                </p>
              </div>

              <div className="w-px h-8 bg-gray-200" />

              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {courseProgress}%
                </p>

                <p className="text-[11px] text-gray-400">
                  Complete
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              PROGRESS
          ================================================= */}

          <div className="mt-7">

            <div className="flex items-center justify-between mb-2">

              <span className="text-xs font-semibold text-gray-500">
                Course Progress
              </span>

              <span className="text-xs font-bold text-emerald-600">
                {completedLessons} of{' '}
                {lessons.length}{' '}
                lessons completed
              </span>

            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">

              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${courseProgress}%`,
                }}
              />

            </div>

          </div>

          {/* =================================================
              CONTINUE
          ================================================= */}

          {lessons.length > 0 && (
            <button
              onClick={
                handleContinueLearning
              }
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />

              {courseProgress > 0
                ? 'Continue Learning'
                : 'Start Course'}
            </button>
          )}

        </div>
      </div>

      {/* ===================================================
          COURSE CONTENT
      =================================================== */}

      <div className="space-y-4">

        {/* SECTION HEADER */}

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-base font-bold text-gray-900">
              Course Content
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {lessons.length}{' '}
              {lessons.length === 1
                ? 'lesson'
                : 'lessons'}{' '}
              in this course
            </p>
          </div>

        </div>

        {/* =================================================
            NO LESSONS
        ================================================= */}

        {lessons.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">

            <Video className="w-10 h-10 mx-auto text-gray-300" />

            <h3 className="mt-4 text-sm font-bold text-gray-800">
              No lessons available
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Lessons will appear here
              when they are added to
              this course.
            </p>

          </div>
        )}

        {/* =================================================
            LESSON LIST
        ================================================= */}

        <div className="space-y-3">

          {lessons.map(
            (lesson, index) => {

              const lessonProgress =
                progress[lesson.id];

              const completed =
                lessonProgress?.completed ===
                true;

              const locked =
                isLessonLocked(index);

              const lessonOrder =
                lesson.lessonOrder ??
                lesson.orderIndex ??
                lesson.position ??
                index + 1;

              const lessonResources =
                resources[
                  lesson.id
                ] || [];

              return (
                <div
                  key={lesson.id}
                  className={`
                    bg-white
                    rounded-xl
                    border
                    transition-all
                    overflow-hidden
                    ${
                      locked
                        ? 'border-gray-100 opacity-60'
                        : 'border-gray-100 shadow-sm hover:border-brand/30 hover:shadow-md'
                    }
                  `}
                >

                  {/* =================================================
                      LESSON HEADER
                  ================================================= */}

                  <div
                    onClick={() =>
                      handleLessonClick(
                        lesson,
                        index
                      )
                    }
                    className={`
                      group
                      p-4
                      flex
                      items-center
                      justify-between
                      gap-4
                      ${
                        locked
                          ? 'cursor-not-allowed'
                          : 'cursor-pointer'
                      }
                    `}
                  >

                    {/* LEFT */}

                    <div className="flex items-center gap-4 min-w-0">

                      {/* NUMBER */}

                      <span
                        className={`
                          w-10
                          h-10
                          shrink-0
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-bold
                          ${
                            completed
                              ? 'bg-emerald-50 text-emerald-600'
                              : locked
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-brand/10 text-brand'
                          }
                        `}
                      >
                        {String(
                          lessonOrder
                        ).padStart(2, '0')}
                      </span>

                      {/* INFO */}

                      <div className="min-w-0">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {lesson.title}
                          </h3>

                          {completed && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Completed
                            </span>
                          )}

                        </div>

                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">

                          {lesson.durationMinutes !==
                            undefined && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock className="w-3.5 h-3.5" />

                              {
                                lesson.durationMinutes
                              }{' '}
                              min
                            </span>
                          )}

                          {lesson.videoUrl && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              <Video className="w-3.5 h-3.5" />

                              Video
                            </span>
                          )}

                          {lessonResources.length >
                            0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-brand">
                              <Link2 className="w-3.5 h-3.5" />

                              {
                                lessonResources.length
                              }{' '}
                              {lessonResources.length ===
                              1
                                ? 'Resource'
                                : 'Resources'}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="shrink-0">

                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />

                      ) : locked ? (
                        <Lock className="w-4 h-4 text-gray-400" />

                      ) : (
                        <div className="flex items-center gap-2">

                          <span className="hidden sm:block text-[11px] font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                            Watch
                          </span>

                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />

                        </div>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      RESOURCES
                  ================================================= */}

                  {!locked &&
                    lessonResources.length >
                      0 && (
                      <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">

                        <div className="flex items-center gap-2 mb-2">

                          <FileText className="w-4 h-4 text-gray-400" />

                          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                            Lesson Resources
                          </span>

                        </div>

                        <div className="space-y-2">

                          {lessonResources.map(
                            (resource) => (
                              <button
                                key={
                                  resource.id
                                }
                                type="button"
                                onClick={() =>
                                  handleResourceClick(
                                    resource,
                                    lesson,
                                    index
                                  )
                                }
                                className="w-full flex items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-all text-left"
                              >

                                <div className="flex items-center gap-3 min-w-0">

                                  <div className="w-8 h-8 shrink-0 rounded-lg bg-brand/10 flex items-center justify-center">
                                    <Link2 className="w-4 h-4 text-brand" />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="text-xs font-semibold text-gray-800 truncate">
                                      {
                                        resource.title
                                      }
                                    </p>

                                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                      {resource.fileType ===
                                      'LINK'
                                        ? 'External resource'
                                        : resource.fileName ||
                                          'Lesson resource'}
                                    </p>

                                  </div>

                                </div>

                                <ExternalLink className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-brand" />

                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}