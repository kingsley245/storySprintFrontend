import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Link2,
  Loader2,
  Lock,
  Play,
  Video,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';

/* =========================================================
   TYPES
========================================================= */

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

interface LessonProgress {
  lessonId: string;
  lastPositionSeconds: number;
  completionPercentage: number;
  completed: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LessonLearn() {
  const {
    courseId,
    lessonId,
  } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  const navigate = useNavigate();

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [progress, setProgress] =
    useState<LessonProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [savingProgress, setSavingProgress] =
    useState(false);

  const [videoStarted, setVideoStarted] =
    useState(false);

  const [videoCompleted, setVideoCompleted] =
    useState(false);

  /* =======================================================
     USER ID
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
     LOAD LESSON
  ======================================================= */

  useEffect(() => {
    if (!courseId || !lessonId) {
      setError(
        'Course or lesson ID is missing.'
      );

      setLoading(false);

      return;
    }

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError('');

        /* ================================================
           LOAD LESSON
        ================================================= */

        let loadedLesson: Lesson | null =
          null;

        /*
         * Try the direct lesson endpoint first.
         *
         * If your backend does not have this endpoint,
         * the course lessons request below will still
         * locate the lesson.
         */

        try {
          const response =
            await api.get(
              `/lessons/${lessonId}`
            );

          loadedLesson =
            response.data;
        } catch {
          loadedLesson = null;
        }

        /* ================================================
           LOAD COURSE LESSONS
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

        /*
         * If direct lesson endpoint wasn't available,
         * find the lesson from the course lessons.
         */

        if (!loadedLesson) {
          loadedLesson =
            loadedLessons.find(
              (item) =>
                item.id === lessonId
            ) || null;
        }

        if (!loadedLesson) {
          throw new Error(
            'Lesson not found.'
          );
        }

        setLesson(loadedLesson);

        /* ================================================
           LOAD RESOURCES
        ================================================= */

        try {
          const resourceResponse =
            await api.get(
              `/lessons/${lessonId}/resources`
            );

          const loadedResources: Resource[] =
            Array.isArray(
              resourceResponse.data
            )
              ? resourceResponse.data
              : [];

          setResources(
            loadedResources
          );
        } catch (resourceError) {
          console.error(
            'Failed to load lesson resources:',
            resourceError
          );

          /*
           * Resource failure should not prevent
           * the student from watching the lesson.
           */

          setResources([]);
        }

        /* ================================================
           LOAD PROGRESS
        ================================================= */

        const userId = getUserId();

        if (userId) {
          try {
            const progressResponse =
              await api.get(
                `/progress/${userId}/${lessonId}`
              );

            const loadedProgress =
              progressResponse.data as LessonProgress;

            setProgress(
              loadedProgress
            );

            /*
             * Restore previous video position.
             */

            if (
              loadedProgress?.lastPositionSeconds
            ) {
              setTimeout(() => {
                if (
                  videoRef.current
                ) {
                  videoRef.current.currentTime =
                    loadedProgress.lastPositionSeconds;
                }
              }, 500);
            }

            if (
              loadedProgress?.completed
            ) {
              setVideoCompleted(
                true
              );
            }
          } catch {
            /*
             * No progress yet.
             */
            setProgress(null);
          }
        }
      } catch (err: any) {
        console.error(
          'Failed to load lesson:',
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            'Unable to load lesson.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [courseId, lessonId]);

  /* =======================================================
     SAVE PROGRESS
  ======================================================= */

  const saveProgress = async (
    positionSeconds: number,
    percentage: number,
    completed: boolean
  ) => {
    const userId = getUserId();

    if (!userId || !lessonId) {
      return;
    }

    try {
      setSavingProgress(true);

      await api.post(
        '/progress',
        {
          userId,
          lessonId,
          lastPositionSeconds:
            Math.floor(
              positionSeconds
            ),
          completionPercentage:
            Math.round(
              percentage
            ),
          completed,
        }
      );

      setProgress({
        lessonId,
        lastPositionSeconds:
          Math.floor(
            positionSeconds
          ),
        completionPercentage:
          Math.round(
            percentage
          ),
        completed,
      });
    } catch (err) {
      console.error(
        'Failed to save progress:',
        err
      );
    } finally {
      setSavingProgress(false);
    }
  };

  /* =======================================================
     VIDEO PLAY
  ======================================================= */

  const handleVideoPlay = () => {
    setVideoStarted(true);
  };

  /* =======================================================
     VIDEO TIME UPDATE
  ======================================================= */

  const handleVideoTimeUpdate = () => {
    const video =
      videoRef.current;

    if (!video || !video.duration) {
      return;
    }

    const percentage =
      (video.currentTime /
        video.duration) *
      100;

    /*
     * Only save at useful milestones.
     * Avoid sending a request every second.
     */

    const rounded =
      Math.floor(
        percentage
      );

    if (
      rounded > 0 &&
      rounded % 10 === 0
    ) {
      /*
       * We don't save repeatedly while the
       * video remains on the same percentage.
       */

      if (
        progress?.completionPercentage !==
        rounded
      ) {
        saveProgress(
          video.currentTime,
          percentage,
          false
        );
      }
    }
  };

  /* =======================================================
     VIDEO ENDED
  ======================================================= */

  const handleVideoEnded = async () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    setVideoCompleted(true);

    await saveProgress(
      video.duration,
      100,
      true
    );
  };

  /* =======================================================
     RESOURCE CLICK
  ======================================================= */

  const handleResourceClick = (
    resource: Resource
  ) => {
    if (!resource.filePath) {
      return;
    }

    /*
     * Open the resource in a new tab.
     *
     * The resource itself is controlled by the
     * URL supplied by the administrator.
     */

    window.open(
      resource.filePath,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* =======================================================
     FORMAT FILE SIZE
  ======================================================= */

  const formatFileSize = (
    size?: number
  ) => {
    if (
      size === undefined ||
      size === null ||
      size === 0
    ) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /* =======================================================
     PREVIOUS LESSON
  ======================================================= */

  const currentIndex =
    lessons.findIndex(
      (item) =>
        item.id === lessonId
    );

  const previousLesson =
    currentIndex > 0
      ? lessons[currentIndex - 1]
      : null;

  /* =======================================================
     NEXT LESSON
  ======================================================= */

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  /* =======================================================
     GO PREVIOUS
  ======================================================= */

  const handlePreviousLesson = () => {
    if (
      !courseId ||
      !previousLesson
    ) {
      return;
    }

    navigate(
      `/student/courses/${courseId}/learn/${previousLesson.id}`
    );
  };

  /* =======================================================
     GO NEXT
  ======================================================= */

  const handleNextLesson = () => {
    if (
      !courseId ||
      !nextLesson
    ) {
      return;
    }

    /*
     * Require current lesson completion
     * before opening next lesson.
     */

    if (
      !videoCompleted &&
      !progress?.completed
    ) {
      return;
    }

    navigate(
      `/student/courses/${courseId}/learn/${nextLesson.id}`
    );
  };

  /* =======================================================
     DISABLE CONTEXT MENU
  ======================================================= */

  const handleContextMenu = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">

        <div className="flex flex-col items-center gap-3 text-gray-500">

          <Loader2 className="w-8 h-8 animate-spin text-brand" />

          <p className="text-sm">
            Loading lesson...
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto">

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">

          <div className="flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

            <div>

              <h2 className="font-semibold text-red-800">
                Unable to load lesson
              </h2>

              <p className="text-sm text-red-600 mt-1">
                {error ||
                  'Lesson not found.'}
              </p>

              <button
                onClick={() =>
                  navigate(
                    `/student/courses/${courseId}`
                  )
                }
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand-dark"
              >
                <ArrowLeft className="w-4 h-4" />

                Back to Course
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="max-w-6xl mx-auto pb-12"
      onContextMenu={
        handleContextMenu
      }
    >

      {/* ==================================================
          TOP NAVIGATION
      ================================================== */}

      <div className="flex items-center justify-between gap-4 mb-6">

        <button
          onClick={() =>
            navigate(
              `/student/courses/${courseId}`
            )
          }
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Course
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">

          <BookOpen className="w-4 h-4" />

          Lesson{' '}

          {currentIndex >= 0
            ? currentIndex + 1
            : 1}{' '}

          of {lessons.length}

        </div>

      </div>

      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="min-w-0">

          {/* ==============================================
              VIDEO
          ============================================== */}

          <div
            className="bg-black rounded-2xl overflow-hidden shadow-sm relative select-none"
            onContextMenu={
              handleContextMenu
            }
          >

            {lesson.videoUrl ? (
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                playsInline
                className="w-full aspect-video object-contain bg-black"
                onPlay={
                  handleVideoPlay
                }
                onTimeUpdate={
                  handleVideoTimeUpdate
                }
                onEnded={
                  handleVideoEnded
                }
                onContextMenu={
                  handleContextMenu
                }
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center text-gray-400">

                <Video className="w-12 h-12 mb-3" />

                <p className="text-sm">
                  No video available
                </p>

              </div>
            )}

          </div>

          {/* ==============================================
              VIDEO STATUS
          ============================================== */}

          <div className="flex items-center justify-between mt-3">

            <div className="flex items-center gap-3">

              {videoStarted && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">

                  <Play className="w-3.5 h-3.5" />

                  Watching

                </span>
              )}

              {savingProgress && (
                <span className="text-[11px] text-gray-400">
                  Saving progress...
                </span>
              )}

            </div>

            {videoCompleted && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">

                <CheckCircle2 className="w-4 h-4" />

                Lesson completed

              </span>
            )}

          </div>

          {/* ==============================================
              LESSON TITLE
          ============================================== */}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-5">

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2 flex-wrap">

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wide">

                    <Video className="w-3 h-3" />

                    Lesson

                  </span>

                  {lesson.durationMinutes !==
                    undefined && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">

                      <Clock className="w-3.5 h-3.5" />

                      {lesson.durationMinutes}{' '}
                      min

                    </span>
                  )}

                </div>

                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-3">
                  {lesson.title}
                </h1>

              </div>

            </div>

            {/* DESCRIPTION */}

            {lesson.description && (
              <div className="mt-5 pt-5 border-t border-gray-100">

                <h2 className="text-sm font-bold text-gray-900">
                  About this lesson
                </h2>

                <p className="text-sm text-gray-500 leading-7 mt-2 whitespace-pre-line">
                  {lesson.description}
                </p>

              </div>
            )}

            {/* NOTES */}

            {lesson.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">

                <div className="flex items-center gap-2">

                  <FileText className="w-4 h-4 text-brand" />

                  <h2 className="text-sm font-bold text-gray-900">
                    Lesson Notes
                  </h2>

                </div>

                <div className="mt-3 text-sm text-gray-600 leading-7 whitespace-pre-line">
                  {lesson.notes}
                </div>

              </div>
            )}

          </div>

          {/* ==============================================
              RESOURCES
          ============================================== */}

          {resources.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <Link2 className="w-5 h-5 text-brand" />

                    <h2 className="text-base font-bold text-gray-900">
                      Lesson Resources
                    </h2>

                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Additional materials provided
                    for this lesson.
                  </p>

                </div>

                <span className="text-[11px] font-semibold text-gray-400">
                  {resources.length}{' '}
                  {resources.length === 1
                    ? 'resource'
                    : 'resources'}
                </span>

              </div>

              <div className="mt-5 space-y-3">

                {resources.map(
                  (resource) => (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() =>
                        handleResourceClick(
                          resource
                        )
                      }
                      className="w-full flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-brand/30 hover:bg-brand/5 transition-all text-left group"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 shrink-0 rounded-lg bg-brand/10 flex items-center justify-center">

                          <Link2 className="w-5 h-5 text-brand" />

                        </div>

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {resource.title}
                          </p>

                          <div className="flex items-center gap-2 mt-1">

                            {resource.fileType && (
                              <span className="text-[10px] text-gray-400 uppercase">
                                {resource.fileType}
                              </span>
                            )}

                            {resource.fileSize &&
                              resource.fileSize >
                                0 && (
                                <>
                                  <span className="text-gray-300">
                                    •
                                  </span>

                                  <span className="text-[10px] text-gray-400">
                                    {formatFileSize(
                                      resource.fileSize
                                    )}
                                  </span>
                                </>
                              )}

                          </div>

                        </div>

                      </div>

                      <ExternalLink className="w-4 h-4 shrink-0 text-gray-300 group-hover:text-brand transition-colors" />

                    </button>
                  )
                )}

              </div>

            </div>
          )}

          {/* ==============================================
              LESSON NAVIGATION
          ============================================== */}

          <div className="flex items-center justify-between gap-3 mt-6">

            <button
              type="button"
              onClick={
                handlePreviousLesson
              }
              disabled={
                !previousLesson
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >

              <ChevronLeft className="w-4 h-4" />

              Previous

            </button>

            <button
              type="button"
              onClick={
                handleNextLesson
              }
              disabled={
                !nextLesson ||
                (!videoCompleted &&
                  !progress?.completed)
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >

              {nextLesson
                ? 'Next Lesson'
                : 'Course Complete'}

              {nextLesson && (
                <ChevronRight className="w-4 h-4" />
              )}

            </button>

          </div>

        </main>

        {/* =================================================
            LESSON SIDEBAR
        ================================================= */}

        <aside className="lg:sticky lg:top-6 lg:self-start">

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

            {/* SIDEBAR HEADER */}

            <div className="p-5 border-b border-gray-100">

              <h2 className="text-sm font-bold text-gray-900">
                Course Lessons
              </h2>

              <p className="text-[11px] text-gray-400 mt-1">
                {lessons.length} lessons
              </p>

            </div>

            {/* LESSON LIST */}

            <div className="max-h-[600px] overflow-y-auto">

              {lessons.map(
                (item, index) => {

                  const active =
                    item.id ===
                    lessonId;

                  const itemProgress =
                    progress;

                  const completed =
                    active
                      ? itemProgress?.completed
                      : false;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (
                          item.id ===
                          lessonId
                        ) {
                          return;
                        }

                        /*
                         * For now navigation from
                         * the sidebar is allowed only
                         * for the current/previously
                         * available lessons.
                         */

                        const itemIndex =
                          index;

                        if (
                          itemIndex >
                          currentIndex
                        ) {
                          if (
                            !videoCompleted &&
                            !progress?.completed
                          ) {
                            return;
                          }
                        }

                        navigate(
                          `/student/courses/${courseId}/learn/${item.id}`
                        );
                      }}
                      className={`
                        w-full
                        text-left
                        flex
                        items-center
                        gap-3
                        p-3.5
                        border-b
                        border-gray-50
                        transition-colors
                        ${
                          active
                            ? 'bg-brand/5'
                            : 'hover:bg-gray-50'
                        }
                      `}
                    >

                      {/* NUMBER */}

                      <span
                        className={`
                          w-8
                          h-8
                          shrink-0
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-[10px]
                          font-bold
                          ${
                            active
                              ? 'bg-brand text-white'
                              : 'bg-gray-100 text-gray-500'
                          }
                        `}
                      >
                        {String(
                          index + 1
                        ).padStart(2, '0')}
                      </span>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <p
                          className={`
                            text-xs
                            font-semibold
                            truncate
                            ${
                              active
                                ? 'text-brand'
                                : 'text-gray-700'
                            }
                          `}
                        >
                          {item.title}
                        </p>

                        <div className="flex items-center gap-2 mt-1">

                          {item.durationMinutes !==
                            undefined && (
                            <span className="text-[10px] text-gray-400">
                              {item.durationMinutes}{' '}
                              min
                            </span>
                          )}

                          {item.videoUrl && (
                            <Video className="w-3 h-3 text-gray-300" />
                          )}

                        </div>

                      </div>

                      {/* STATUS */}

                      {active ? (
                        <Play className="w-3.5 h-3.5 text-brand shrink-0" />
                      ) : completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : index >
                        currentIndex ? (
                        <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}