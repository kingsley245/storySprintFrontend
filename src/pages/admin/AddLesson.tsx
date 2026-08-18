import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

import {
  ArrowLeft,
  Video,
  Upload,
  CheckCircle2,
  AlertCircle,
  Link2,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function AddLesson() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonOrder: '',
    durationMinutes: '',
    preview: false,
    published: false,
    resourceLink: '',
    resourceTitle: '',
  });

  // ==========================================
  // VIDEO
  // ==========================================

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [videoUrl, setVideoUrl] =
    useState('');

  // ==========================================
  // UI STATES
  // ==========================================

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  // ==========================================
  // HANDLE VIDEO SELECTION
  // ==========================================

  const handleVideoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

    if (!file.type.startsWith('video/')) {
      setError(
        'Please select a valid video file.'
      );

      return;
    }

    setVideoFile(file);
    setVideoUrl('');
  };

  // ==========================================
  // UPLOAD VIDEO
  // ==========================================

  const handleUploadVideo = async () => {
    if (!videoFile) {
      setError(
        'Please select a video first.'
      );

      return;
    }

    if (!courseId) {
      setError(
        'Course ID is missing.'
      );

      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const data = new FormData();

      data.append(
        'file',
        videoFile
      );

      const response =
        await api.post(
          `/admin/courses/${courseId}/lessons/video`,
          data,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },

            onUploadProgress:
              (progressEvent) => {
                if (
                  progressEvent.total
                ) {
                  const progress =
                    Math.round(
                      (progressEvent.loaded *
                        100) /
                        progressEvent.total
                    );

                  setUploadProgress(
                    progress
                  );
                }
              },
          }
        );

      const returnedUrl =
        response.data;

      if (!returnedUrl) {
        throw new Error(
          'The server did not return a video URL.'
        );
      }

      setVideoUrl(
        returnedUrl
      );

      setSuccess(
        'Video uploaded successfully. You can now create the lesson.'
      );

    } catch (err: any) {
      console.error(
        'Failed to upload video:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to upload video.';

      setError(
        typeof message === 'string'
          ? message
          : 'Failed to upload video.'
      );

    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // CREATE LESSON
  // ==========================================

  const createLesson = async () => {
    if (!courseId) {
      throw new Error(
        'Course ID is missing.'
      );
    }

    const response =
      await api.post(
        `/admin/courses/${courseId}/lessons`,
        {
          title:
            formData.title.trim(),

          description:
            formData.description.trim(),

          videoUrl:
            videoUrl,

          lessonOrder:
            Number(
              formData.lessonOrder
            ),

          durationMinutes:
            Number(
              formData.durationMinutes
            ),

          preview:
            formData.preview,

          published:
            formData.published,
        }
      );

    return response.data;
  };

  // ==========================================
  // CREATE RESOURCE
  // ==========================================

  const createResource = async (
    lessonId: string
  ) => {
    const resourceLink =
      formData.resourceLink.trim();

    if (!resourceLink) {
      return null;
    }

    const resourceTitle =
      formData.resourceTitle.trim() ||
      `${formData.title.trim()} Resource`;

    /*
     * Save the resource in:
     *
     * resources
     *
     * with:
     *
     * lesson_id = created lesson ID
     */

    const response =
      await api.post(
        `/lessons/${lessonId}/resources`,
        {
          title:
            resourceTitle,

          fileName:
            'Lesson Resource',

          fileType:
            'LINK',

          fileSize:
            0,

          filePath:
            resourceLink,
        }
      );

    return response.data;
  };

  // ==========================================
  // CREATE LESSON + RESOURCE
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // ========================================
    // VALIDATION
    // ========================================

    if (!courseId) {
      setError(
        'Course ID is missing.'
      );

      return;
    }

    if (!formData.title.trim()) {
      setError(
        'Lesson title is required.'
      );

      return;
    }

    if (!formData.lessonOrder) {
      setError(
        'Lesson order is required.'
      );

      return;
    }

    if (
      Number(formData.lessonOrder) < 1
    ) {
      setError(
        'Lesson order must be at least 1.'
      );

      return;
    }

    if (!formData.durationMinutes) {
      setError(
        'Lesson duration is required.'
      );

      return;
    }

    if (
      Number(formData.durationMinutes) < 1
    ) {
      setError(
        'Lesson duration must be at least 1 minute.'
      );

      return;
    }

    if (!videoUrl) {
      setError(
        'Please upload the lesson video before creating the lesson.'
      );

      return;
    }

    // ========================================
    // VALIDATE RESOURCE URL IF PROVIDED
    // ========================================

    const resourceLink =
      formData.resourceLink.trim();

    if (resourceLink) {
      try {
        new URL(resourceLink);
      } catch {
        setError(
          'Please enter a valid resource URL.'
        );

        return;
      }
    }

    setSaving(true);

    try {

      // ======================================
      // STEP 1
      // CREATE LESSON
      // ======================================

      const createdLesson =
        await createLesson();

      console.log(
        'Created lesson:',
        createdLesson
      );

      /*
       * Your backend must return something like:
       *
       * {
       *   id: "lesson-uuid",
       *   title: "...",
       *   ...
       * }
       */

      const lessonId =
        createdLesson?.id;

      if (!lessonId) {
        console.error(
          'Lesson creation response:',
          createdLesson
        );

        throw new Error(
          'Lesson was created, but the server did not return the lesson ID.'
        );
      }

      // ======================================
      // STEP 2
      // CREATE RESOURCE
      // ======================================

      if (resourceLink) {

        console.log(
          'Creating resource for lesson:',
          lessonId
        );

        await createResource(
          lessonId
        );
      }

      // ======================================
      // SUCCESS
      // ======================================

      setSuccess(
        resourceLink
          ? 'Lesson and resource created successfully!'
          : 'Lesson created successfully!'
      );

      // ======================================
      // REDIRECT
      // ======================================

      setTimeout(() => {
        navigate(
          `/admin/courses/${courseId}`
        );
      }, 1000);

    } catch (err: any) {

      console.error(
        'Failed to create lesson/resource:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to create lesson.';

      setError(
        typeof message === 'string'
          ? message
          : 'Failed to create lesson.'
      );

    } finally {

      setSaving(false);

    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/courses/${courseId}`
            )
          }
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Add Lesson
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Add a video lesson and optional resources to this course.
          </p>

        </div>

      </div>

      {/* =====================================
          FORM CARD
      ====================================== */}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">

            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100">

            <CheckCircle2 className="w-5 h-5 shrink-0" />

            <span>
              {success}
            </span>

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================
              LESSON INFORMATION
          ================================== */}

          <div className="space-y-5">

            <h2 className="text-sm font-bold text-gray-900">
              Lesson Information
            </h2>

            {/* TITLE */}

            <div>

              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lesson Title
              </label>

              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title:
                      e.target.value,
                  })
                }
                placeholder="e.g. Introduction to Video Editing"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description
              </label>

              <textarea
                rows={4}
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Describe what students will learn in this lesson..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
              />

            </div>

            {/* ORDER + DURATION */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* ORDER */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Lesson Order
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={
                    formData.lessonOrder
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lessonOrder:
                        e.target.value,
                    })
                  }
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />

              </div>

              {/* DURATION */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Duration (minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={
                    formData.durationMinutes
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes:
                        e.target.value,
                    })
                  }
                  placeholder="15"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />

              </div>

            </div>

          </div>

          {/* =================================
              VIDEO
          ================================== */}

          <div className="border-t border-gray-100 pt-6">

            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Lesson Video
            </h2>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6">

              <div className="flex flex-col items-center text-center">

                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
                  <Video className="w-6 h-6 text-brand" />
                </div>

                <h3 className="text-sm font-bold text-gray-900">
                  Upload lesson video
                </h3>

                <p className="text-xs text-gray-500 mt-1 mb-4">
                  MP4, WebM or other supported video format
                </p>

                {/* CHOOSE VIDEO */}

                <label className="cursor-pointer">

                  <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors">

                    <Upload className="w-4 h-4" />

                    Choose Video

                  </span>

                  <input
                    type="file"
                    accept="video/*"
                    onChange={
                      handleVideoChange
                    }
                    className="hidden"
                  />

                </label>

                {/* SELECTED VIDEO */}

                {videoFile && (
                  <div className="mt-5 w-full">

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-left">

                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {videoFile.name}
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        {(
                          videoFile.size /
                          (1024 * 1024)
                        ).toFixed(2)}{' '}
                        MB
                      </p>

                    </div>

                    {/* UPLOAD BUTTON */}

                    {!videoUrl && (
                      <button
                        type="button"
                        onClick={
                          handleUploadVideo
                        }
                        disabled={
                          uploading
                        }
                        className="mt-3 w-full px-4 py-2.5 bg-brand text-white text-xs font-semibold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                      >

                        {uploading ? (
                          <span className="inline-flex items-center gap-2">

                            <Loader2 className="w-4 h-4 animate-spin" />

                            Uploading{' '}
                            {uploadProgress}%

                          </span>
                        ) : (
                          'Upload Video'
                        )}

                      </button>
                    )}

                    {/* UPLOAD PROGRESS */}

                    {uploading && (
                      <div className="mt-3">

                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-brand transition-all"
                            style={{
                              width:
                                `${uploadProgress}%`,
                            }}
                          />

                        </div>

                      </div>
                    )}

                    {/* UPLOADED */}

                    {videoUrl && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600">

                        <CheckCircle2 className="w-4 h-4" />

                        Video uploaded successfully

                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================
              RESOURCE
          ================================== */}

          <div className="border-t border-gray-100 pt-6">

            <div className="mb-4">

              <h2 className="text-sm font-bold text-gray-900">
                Lesson Resource
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Add a Google Drive, Dropbox, PDF, document, or other resource link for students.
              </p>

            </div>

            <div className="space-y-4">

              {/* RESOURCE TITLE */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Resource Name
                </label>

                <div className="relative">

                  <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />

                  <input
                    type="text"
                    value={
                      formData.resourceTitle
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resourceTitle:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Lesson 1 Project Files"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />

                </div>

              </div>

              {/* RESOURCE LINK */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Resource Link
                  <span className="font-normal text-gray-400">
                    {' '}(optional)
                  </span>
                </label>

                <div className="relative">

                  <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />

                  <input
                    type="url"
                    value={
                      formData.resourceLink
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resourceLink:
                          e.target.value,
                      })
                    }
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />

                </div>

              </div>

              {/* RESOURCE PREVIEW */}

              {formData.resourceLink.trim() && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-9 h-9 shrink-0 rounded-lg bg-brand/10 flex items-center justify-center">

                      <Link2 className="w-4 h-4 text-brand" />

                    </div>

                    <div className="min-w-0">

                      <p className="text-xs font-semibold text-gray-800 truncate">

                        {formData.resourceTitle.trim() ||
                          'Lesson Resource'}

                      </p>

                      <p className="text-[11px] text-gray-400 truncate mt-0.5">

                        {formData.resourceLink}

                      </p>

                    </div>

                  </div>

                  <a
                    href={
                      formData.resourceLink
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 text-gray-400 hover:text-brand hover:bg-white rounded-lg"
                    title="Open resource"
                  >

                    <ExternalLink className="w-4 h-4" />

                  </a>

                </div>
              )}

            </div>

          </div>

          {/* =================================
              PUBLISH SETTINGS
          ================================== */}

          <div className="border-t border-gray-100 pt-6 space-y-4">

            <h2 className="text-sm font-bold text-gray-900">
              Publishing
            </h2>

            {/* PUBLISHED */}

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">

              <input
                type="checkbox"
                checked={
                  formData.published
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    published:
                      e.target.checked,
                  })
                }
                className="mt-0.5 w-4 h-4"
              />

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  Publish lesson
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Published lessons become available to students.
                </p>

              </div>

            </label>

            {/* PREVIEW */}

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">

              <input
                type="checkbox"
                checked={
                  formData.preview
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preview:
                      e.target.checked,
                  })
                }
                className="mt-0.5 w-4 h-4"
              />

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  Allow preview
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Allow students to preview this lesson.
                </p>

              </div>

            </label>

          </div>

          {/* =================================
              ACTIONS
          ================================== */}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                navigate(
                  `/admin/courses/${courseId}`
                )
              }
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                uploading ||
                !videoUrl
              }
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {saving ? (
                <span className="inline-flex items-center gap-2">

                  <Loader2 className="w-4 h-4 animate-spin" />

                  Creating Lesson...

                </span>
              ) : (
                'Create Lesson'
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}