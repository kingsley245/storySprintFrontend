import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';

const categories = [
  {
    value: 'YOUTUBE_AUTOMATION',
    label: 'YouTube Automation',
  },
  {
    value: 'YOUTUBE_SEO',
    label: 'YouTube SEO',
  },
  {
    value: 'VIDEO_EDITING',
    label: 'Video Editing',
  },
  {
    value: 'THUMBNAIL_DESIGN',
    label: 'Thumbnail Design',
  },
  {
    value: 'SCRIPT_WRITING',
    label: 'Script Writing',
  },
  {
    value: 'MONETIZATION',
    label: 'Monetization',
  },
  {
    value: 'AI_TOOLS',
    label: 'AI Tools',
  },
];

const statuses = [
  {
    value: 'DRAFT',
    label: 'Draft',
  },
  {
    value: 'PUBLISHED',
    label: 'Published',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
];

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  status: string;
}

export default function CreateCourse() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<CourseFormData>({
      title: '',
      subtitle: '',
      description: '',
      category: 'YOUTUBE_AUTOMATION',
      status: 'DRAFT',
    });

  const [thumbnail, setThumbnail] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string>('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {

      setError(
        'Please select a valid image file.'
      );

      return;
    }

    setThumbnail(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setError('');
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError('');

    if (!thumbnail) {

      setError(
        'Please select a course thumbnail.'
      );

      return;
    }

    setLoading(true);

    try {

      const data = new FormData();

      data.append(
        'title',
        formData.title
      );

      data.append(
        'subtitle',
        formData.subtitle
      );

      data.append(
        'description',
        formData.description
      );

      data.append(
        'category',
        formData.category
      );

      data.append(
        'status',
        formData.status
      );

      data.append(
        'thumbnail',
        thumbnail
      );

      const response =
        await api.post(
          '/admin/courses',
          data
        );

      const newCourseId =
        response.data?.id;

      if (!newCourseId) {

        throw new Error(
          'Course was created but no ID was returned.'
        );
      }

      navigate(
        `/admin/courses/${newCourseId}`
      );

    } catch (err: any) {

      console.error(
        'Failed to create course:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to create course. Please try again.';

      setError(message);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() =>
            navigate('/admin/courses')
          }
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Create Course
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Add a new course to your platform.
          </p>

        </div>

      </div>

      {/* FORM */}

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* TITLE */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Course Title
            </label>

            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. YouTube Automation Masterclass"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg"
            />

          </div>

          {/* SUBTITLE */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Subtitle
            </label>

            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Short description of the course"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
            >

              {categories.map(category => (

                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>

              ))}

            </select>

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg"
            />

          </div>

          {/* THUMBNAIL */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Thumbnail
            </label>

            <label className="block cursor-pointer">

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-brand transition-colors">

                {preview ? (

                  <div className="space-y-3">

                    <img
                      src={preview}
                      alt="Thumbnail preview"
                      className="w-full h-52 object-cover rounded-lg"
                    />

                    <div className="flex items-center justify-center gap-2 text-sm text-brand font-medium">
                      <Upload className="w-4 h-4" />
                      Choose another image
                    </div>

                  </div>

                ) : (

                  <div className="flex flex-col items-center justify-center py-8">

                    <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />

                    <p className="text-sm font-medium text-gray-700">
                      Click to upload thumbnail
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG or WEBP
                    </p>

                  </div>

                )}

              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleThumbnailChange}
                className="hidden"
              />

            </label>

            {thumbnail && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {thumbnail.name}
              </p>
            )}

          </div>

          {/* STATUS */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Initial Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
            >

              {statuses.map(status => (

                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>

              ))}

            </select>

          </div>

          {/* ACTIONS */}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">

            <button
              type="button"
              onClick={() =>
                navigate('/admin/courses')
              }
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-lg disabled:opacity-50"
            >
              {loading
                ? 'Creating...'
                : 'Create Course'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}