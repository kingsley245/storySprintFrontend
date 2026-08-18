import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Lock,
  Play,
  Video,
  AlertCircle,
} from 'lucide-react';

import api from '../../api/axios';

/* =========================================================
   TYPES
========================================================= */

interface VideoData {
  id: string;
  originalFileName?: string;
  storedFileName?: string;
  contentType?: string;
  fileSize?: number;
  durationSeconds?: number;
  createdAt?: string;
  streamUrl?: string;
}

interface Lesson {
  id: string;
  courseId?: string;

  title: string;
  description?: string;
  notes?: string;

  /*
   * Legacy/external video URL.
   */
  videoUrl?: string;

  /*
   * New uploaded video.
   */
  video?: VideoData | null;

  lessonOrder?: number;
  orderIndex?: number;
  position?: number;

  durationMinutes?: number;

  preview?: boolean;
  published?: boolean;

  createdAt?: string;
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
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  const navigate = useNavigate();

  /* =======================================================
     REFS
  ======================================================= */

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoObjectUrlRef = useRef<string | null>(null);

  const lastSavedPercentage = useRef<number>(0);

  const progressSaveTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const [videoReady, setVideoReady] =
    useState(false);

  const [videoError, setVideoError] =
    useState(false);

  const [videoLoading, setVideoLoading] =
    useState(false);

  /*
   * This is the actual URL given to <video>.
   *
   * It will normally be a blob URL such as:
   *
   * blob:http://localhost:5173/xxxxx
   */
  const [videoUrl, setVideoUrl] =
    useState<string | null>(null);

  /* =======================================================
     BACKEND URL
  ======================================================= */

  /*
   * Your Axios base URL is:
   *
   * http://192.168.0.144:8081/api
   *
   * Therefore the actual Spring Boot server is:
   *
   * http://192.168.0.144:8081
   */

  const BACKEND_URL =
    'http://192.168.0.144:8081';

  /* =======================================================
     USER ID
  ======================================================= */

  const getUserId = (): string | null => {
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
     GET AUTH TOKEN
  ======================================================= */

  const getToken = (): string | null => {
    return (
      localStorage.getItem('token') ||
      sessionStorage.getItem('token')
    );
  };

  /* =======================================================
     CLEAN VIDEO OBJECT URL
  ======================================================= */

  const cleanupVideoObjectUrl = () => {
    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(
        videoObjectUrlRef.current
      );

      videoObjectUrlRef.current = null;
    }
  };

  /* =======================================================
     LOAD VIDEO
  ======================================================= */

  const loadVideo = async (
    currentLessonId: string,
    currentLesson: Lesson
  ) => {
    try {
      setVideoLoading(true);
      setVideoError(false);
      setVideoReady(false);

      /*
       * Remove previous blob URL.
       */
      cleanupVideoObjectUrl();

      setVideoUrl(null);

      /*
       * Clear previous video element.
       */
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      /*
       * ====================================================
       * NEW UPLOADED VIDEO
       * ====================================================
       *
       * We deliberately use the backend streaming endpoint.
       *
       * We do NOT use:
       *
       * /uploads/videos/xxxxx.mp4
       *
       * because that would be requested from Vite:
       *
       * http://localhost:5174/uploads/...
       *
       * instead of Spring Boot.
       */

      const hasUploadedVideo =
        Boolean(
          currentLesson.video?.id
        ) ||
        Boolean(
          currentLesson.videoUrl
        );

      if (!hasUploadedVideo) {
        console.warn(
          'This lesson has no video.'
        );

        setVideoLoading(false);
        return;
      }

      /*
       * Backend video stream endpoint.
       *
       * Axios baseURL already contains /api,
       * so DO NOT put /api here.
       */

      const streamEndpoint =
        `/videos/lesson/${currentLessonId}/stream`;

      console.log(
        'VIDEO STREAM ENDPOINT:',
        `${BACKEND_URL}/api${streamEndpoint}`
      );

      /*
       * Get JWT.
       */

      const token = getToken();


      const response =
        await api.get(
          streamEndpoint,
          {
            responseType: 'blob',

            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : undefined,
          }
        );

      console.log(
        'VIDEO RESPONSE STATUS:',
        response.status
      );

      console.log(
        'VIDEO CONTENT TYPE:',
        response.headers[
          'content-type'
        ]
      );

      console.log(
        'VIDEO SIZE:',
        response.data?.size
      );

      /*
       * Make sure backend actually returned data.
       */

      if (
        !response.data ||
        response.data.size === 0
      ) {
        throw new Error(
          'The server returned an empty video file.'
        );
      }

      /*
       * Create Blob URL.
       */

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob(
              [response.data],
              {
                type: (response.headers['content-type'] as string) || 'video/mp4'
              }
            );

      const objectUrl =
        URL.createObjectURL(blob);

      /*
       * Remember it so we can revoke it later.
       */

      videoObjectUrlRef.current =
        objectUrl;

      console.log(
        'VIDEO BLOB URL CREATED:',
        objectUrl
      );

      setVideoUrl(objectUrl);
    } catch (err: any) {
      console.error(
        'FAILED TO LOAD VIDEO:',
        err
      );

      console.error(
        'VIDEO RESPONSE:',
        err?.response
      );

      if (err?.response) {
        console.error(
          'VIDEO STATUS:',
          err.response.status
        );

        console.error(
          'VIDEO DATA:',
          err.response.data
        );
      }

      setVideoError(true);
      setVideoUrl(null);
    } finally {
      setVideoLoading(false);
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

    let cancelled = false;

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError('');

        setVideoReady(false);
        setVideoError(false);
        setVideoStarted(false);
        setVideoCompleted(false);

        /*
         * Clear previous video.
         */

        cleanupVideoObjectUrl();

        setVideoUrl(null);

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.removeAttribute(
            'src'
          );
          videoRef.current.load();
        }

        /* =================================================
           LOAD LESSON DIRECTLY
        ================================================= */

        let loadedLesson: Lesson | null =
          null;

        try {
          const response =
            await api.get(
              `/lessons/${lessonId}`
            );

          loadedLesson =
            response.data;

          console.log(
            'DIRECT LESSON RESPONSE:',
            loadedLesson
          );
        } catch (lessonError) {
          console.warn(
            'Direct lesson endpoint failed:',
            lessonError
          );
        }

        /* =================================================
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

        /*
         * Sort lessons.
         */

        loadedLessons.sort(
          (a, b) => {
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

            return (
              orderA - orderB
            );
          }
        );

        if (cancelled) {
          return;
        }

        setLessons(
          loadedLessons
        );

        /* =================================================
           FIND LESSON
        ================================================= */

        if (!loadedLesson) {
          loadedLesson =
            loadedLessons.find(
              item =>
                item.id === lessonId
            ) || null;
        }

        if (!loadedLesson) {
          throw new Error(
            'Lesson not found.'
          );
        }

        /*
         * Find matching course lesson.
         */

        const courseLesson =
          loadedLessons.find(
            item =>
              item.id === lessonId
          );

        /*
         * Merge video information from course
         * lesson response if necessary.
         */

        if (
          courseLesson?.video &&
          !loadedLesson.video
        ) {
          loadedLesson = {
            ...loadedLesson,
            video:
              courseLesson.video,
          };
        }

        /*
         * Preserve legacy videoUrl.
         */

        if (
          courseLesson?.videoUrl &&
          !loadedLesson.videoUrl
        ) {
          loadedLesson = {
            ...loadedLesson,
            videoUrl:
              courseLesson.videoUrl,
          };
        }

        console.log(
          'FINAL LESSON:',
          loadedLesson
        );

        console.log(
          'LESSON ID:',
          loadedLesson.id
        );

        console.log(
          'LESSON VIDEO:',
          loadedLesson.video
        );

        console.log(
          'LEGACY VIDEO URL:',
          loadedLesson.videoUrl
        );

        setLesson(
          loadedLesson
        );

        /* =================================================
           LOAD VIDEO
        ================================================= */

        await loadVideo(
          lessonId,
          loadedLesson
        );

        /* =================================================
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

          if (!cancelled) {
            setResources(
              loadedResources
            );
          }
        } catch (resourceError) {
          console.error(
            'Failed to load lesson resources:',
            resourceError
          );

          if (!cancelled) {
            setResources([]);
          }
        }

        /* =================================================
           LOAD PROGRESS
        ================================================= */

        const userId =
          getUserId();

        if (userId) {
          try {
            const progressResponse =
              await api.get(
                `/progress/${userId}/${lessonId}`
              );

            const loadedProgress =
              progressResponse.data as LessonProgress;

            if (!cancelled) {
              setProgress(
                loadedProgress
              );

              lastSavedPercentage.current =
                loadedProgress
                  ?.completionPercentage ||
                0;

              if (
                loadedProgress?.completed
              ) {
                setVideoCompleted(
                  true
                );
              }
            }
          } catch (progressError) {
            console.warn(
              'No existing progress found:',
              progressError
            );

            if (!cancelled) {
              setProgress(null);

              lastSavedPercentage.current =
                0;
            }
          }
        } else {
          if (!cancelled) {
            setProgress(null);

            lastSavedPercentage.current =
              0;
          }
        }
      } catch (err: any) {
        console.error(
          'Failed to load lesson:',
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data ||
              err?.message ||
              'Unable to load lesson.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      cancelled = true;

      if (
        progressSaveTimer.current
      ) {
        clearTimeout(
          progressSaveTimer.current
        );
      }

      cleanupVideoObjectUrl();
    };
  }, [courseId, lessonId]);

  /* =======================================================
     CLEANUP VIDEO ON UNMOUNT
  ======================================================= */

  useEffect(() => {
    return () => {
      cleanupVideoObjectUrl();
    };
  }, []);

  /* =======================================================
     DEBUG VIDEO URL
  ======================================================= */

  useEffect(() => {
    console.log(
      'CURRENT VIDEO URL:',
      videoUrl
    );
  }, [videoUrl]);

  /* =======================================================
     RESTORE VIDEO POSITION
  ======================================================= */

  useEffect(() => {
    if (
      !progress ||
      !videoReady ||
      !videoRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    const position =
      progress.lastPositionSeconds;

    if (
      !position ||
      position <= 0
    ) {
      return;
    }

    try {
      if (
        video.duration &&
        !isNaN(video.duration) &&
        position < video.duration
      ) {
        video.currentTime =
          position;
      }
    } catch (err) {
      console.error(
        'Unable to restore video position:',
        err
      );
    }
  }, [
    progress,
    videoReady,
  ]);

  /* =======================================================
     SAVE PROGRESS
  ======================================================= */

  const saveProgress = async (
    positionSeconds: number,
    percentage: number,
    completed: boolean
  ) => {
    const userId =
      getUserId();

    if (
      !userId ||
      !lessonId
    ) {
      return;
    }

    try {
      setSavingProgress(true);

      const roundedPercentage =
        Math.min(
          100,
          Math.max(
            0,
            Math.round(
              percentage
            )
          )
        );

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
            roundedPercentage,

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
          roundedPercentage,

        completed,
      });

      lastSavedPercentage.current =
        roundedPercentage;
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
     VIDEO READY
  ======================================================= */

  const handleVideoLoadedMetadata =
    () => {
      console.log(
        'VIDEO METADATA LOADED'
      );

      setVideoReady(true);
      setVideoError(false);

      const video =
        videoRef.current;

      if (
        !video ||
        !progress?.lastPositionSeconds
      ) {
        return;
      }

      try {
        if (
          video.duration &&
          !isNaN(video.duration) &&
          progress.lastPositionSeconds <
            video.duration
        ) {
          video.currentTime =
            progress.lastPositionSeconds;
        }
      } catch (err) {
        console.error(
          'Unable to restore video position:',
          err
        );
      }
    };

  /* =======================================================
     VIDEO CAN PLAY
  ======================================================= */

  const handleVideoCanPlay =
    () => {
      console.log(
        'VIDEO CAN PLAY'
      );

      setVideoReady(true);
      setVideoError(false);
    };

  /* =======================================================
     VIDEO ERROR
  ======================================================= */

  const handleVideoError = () => {
    const mediaError =
      videoRef.current?.error;

    console.error(
      'VIDEO FAILED TO LOAD'
    );

    console.error(
      'VIDEO SRC:',
      videoRef.current?.currentSrc
    );

    console.error(
      'MEDIA ERROR:',
      mediaError
    );

    if (mediaError) {
      console.error(
        'MEDIA ERROR CODE:',
        mediaError.code
      );

      console.error(
        'MEDIA ERROR MESSAGE:',
        mediaError.message
      );
    }

    setVideoError(true);
    setVideoReady(false);
  };

  /* =======================================================
     VIDEO WAITING
  ======================================================= */

  const handleVideoWaiting = () => {
    /*
     * Buffering is not an error.
     */
  };

  /* =======================================================
     VIDEO TIME UPDATE
  ======================================================= */

  const handleVideoTimeUpdate =
    () => {
      const video =
        videoRef.current;

      if (
        !video ||
        !video.duration ||
        isNaN(video.duration)
      ) {
        return;
      }

      const percentage =
        (video.currentTime /
          video.duration) *
        100;

      const rounded =
        Math.floor(
          percentage
        );

      /*
       * Save progress every 10%.
       */

      if (
        rounded >= 10 &&
        rounded % 10 === 0 &&
        rounded >
          lastSavedPercentage.current
      ) {
        if (
          progressSaveTimer.current
        ) {
          clearTimeout(
            progressSaveTimer.current
          );
        }

        progressSaveTimer.current =
          setTimeout(() => {
            saveProgress(
              video.currentTime,
              percentage,
              false
            );
          }, 500);
      }
    };

  /* =======================================================
     VIDEO ENDED
  ======================================================= */

  const handleVideoEnded =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      setVideoCompleted(true);

      await saveProgress(
        video.duration || 0,
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

    let resourceUrl =
      resource.filePath;

    /*
     * Relative backend path.
     */

    if (
      resourceUrl.startsWith('/')
    ) {
      resourceUrl =
        `${BACKEND_URL}${resourceUrl}`;
    }

    window.open(
      resourceUrl,
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

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    if (
      size <
      1024 *
        1024 *
        1024
    ) {
      return `${(
        size /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(
      size /
      (1024 *
        1024 *
        1024)
    ).toFixed(2)} GB`;
  };

  /* =======================================================
     CURRENT LESSON
  ======================================================= */

  const currentIndex =
    lessons.findIndex(
      item =>
        item.id === lessonId
    );

  /* =======================================================
     PREVIOUS LESSON
  ======================================================= */

  const previousLesson =
    currentIndex > 0
      ? lessons[
          currentIndex - 1
        ]
      : null;

  /* =======================================================
     NEXT LESSON
  ======================================================= */

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      lessons.length - 1
      ? lessons[
          currentIndex + 1
        ]
      : null;

  /* =======================================================
     GO PREVIOUS
  ======================================================= */

  const handlePreviousLesson =
    () => {
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

  const handleNextLesson =
    () => {
      if (
        !courseId ||
        !nextLesson
      ) {
        return;
      }

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
     CONTEXT MENU
  ======================================================= */

  const handleContextMenu = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
  };

  /* =======================================================
     KEYBOARD PROTECTION
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        (e.ctrlKey ||
          e.metaKey) &&
        (
          e.key.toLowerCase() ===
            's' ||
          e.key.toLowerCase() ===
            'u'
        )
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

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

  if (
    error ||
    !lesson
  ) {
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
      className="max-w-6xl mx-auto pb-12 select-none"
      onContextMenu={
        handleContextMenu
      }
    >
      {/* ==================================================
          TOP NAVIGATION
      ================================================== */}

      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
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
              VIDEO PLAYER
          ============================================== */}

          <div
            className="
              bg-black
              rounded-2xl
              overflow-hidden
              shadow-sm
              relative
              select-none
              group
            "
            onContextMenu={
              handleContextMenu
            }
          >

            {videoLoading ? (
              <div className="aspect-video flex flex-col items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin" />

                <p className="text-sm mt-3">
                  Loading video...
                </p>

                <p className="text-[11px] text-gray-500 mt-1">
                  Preparing your lesson video
                </p>
              </div>
            ) : videoError ? (
              <div className="aspect-video flex items-center justify-center bg-black">
                <div className="text-center px-6">

                  <AlertCircle className="w-10 h-10 mx-auto text-red-400" />

                  <h3 className="text-sm font-semibold text-white mt-3">
                    Unable to play video
                  </h3>

                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    The video could not be
                    loaded from the learning
                    server.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setVideoError(
                        false
                      );

                      if (lesson) {
                        loadVideo(
                          lesson.id,
                          lesson
                        );
                      }
                    }}
                    className="
                      mt-4
                      px-4
                      py-2
                      rounded-lg
                      bg-white
                      text-gray-900
                      text-xs
                      font-semibold
                      hover:bg-gray-100
                    "
                  >
                    Retry
                  </button>

                </div>
              </div>
            ) : videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  disablePictureInPicture
                  className="w-full aspect-video object-contain bg-black"
                  onPlay={
                    handleVideoPlay
                  }
                  onLoadedMetadata={
                    handleVideoLoadedMetadata
                  }
                  onCanPlay={
                    handleVideoCanPlay
                  }
                  onWaiting={
                    handleVideoWaiting
                  }
                  onError={
                    handleVideoError
                  }
                  onTimeUpdate={
                    handleVideoTimeUpdate
                  }
                  onEnded={
                    handleVideoEnded
                  }
                />

                {/* ========================================
                    WATERMARK
                ======================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    top-3
                    left-3
                    flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    rounded-lg
                    bg-black/60
                    backdrop-blur-sm
                    text-white
                  "
                >
                  <Video className="w-3.5 h-3.5" />

                  <span className="text-[10px] font-semibold">
                    Video By Cephas Uba
                  </span>
                </div>

                {/* ========================================
                    VIDEO LOADING
                ======================================== */}

                {!videoReady &&
                  !videoError && (
                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-black/60
                        pointer-events-none
                      "
                    >
                      <div className="flex flex-col items-center gap-3 text-white">
                        <Loader2 className="w-7 h-7 animate-spin" />

                        <span className="text-xs">
                          Preparing video...
                        </span>
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center text-gray-400">
                <Video className="w-12 h-12 mb-3" />

                <p className="text-sm">
                  No video available
                </p>

                <p className="text-[11px] text-gray-500 mt-1">
                  This lesson does not have a video yet.
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
              LESSON INFORMATION
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
                  resource => (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() =>
                        handleResourceClick(
                          resource
                        )
                      }
                      className="
                        w-full
                        flex
                        items-center
                        justify-between
                        gap-4
                        p-4
                        border
                        border-gray-100
                        rounded-xl
                        hover:border-brand/30
                        hover:bg-brand/5
                        transition-all
                        text-left
                        group
                      "
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
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-gray-200
                text-xs
                font-semibold
                text-gray-600
                hover:bg-gray-50
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition-colors
              "
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
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-brand
                text-white
                text-xs
                font-semibold
                hover:bg-brand-dark
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition-colors
              "
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

            <div className="p-5 border-b border-gray-100">

              <h2 className="text-sm font-bold text-gray-900">
                Course Lessons
              </h2>

              <p className="text-[11px] text-gray-400 mt-1">
                {lessons.length} lessons
              </p>

            </div>

            <div className="max-h-[600px] overflow-y-auto">

              {lessons.map(
                (item, index) => {

                  const active =
                    item.id ===
                    lessonId;

                  const completed =
                    active
                      ? progress?.completed
                      : false;

                  const locked =
                    index >
                      currentIndex &&
                    !videoCompleted &&
                    !progress?.completed;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {

                        if (
                          item.id ===
                          lessonId
                        ) {
                          return;
                        }

                        if (locked) {
                          return;
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
                            : locked
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                        }
                      `}
                    >

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
                        ).padStart(
                          2,
                          '0'
                        )}
                      </span>

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

                          {(item.video?.id ||
                            item.videoUrl) && (
                            <Video className="w-3 h-3 text-gray-300" />
                          )}

                        </div>

                      </div>

                      {active ? (
                        <Play className="w-3.5 h-3.5 text-brand shrink-0" />
                      ) : locked ? (
                        <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      ) : completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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