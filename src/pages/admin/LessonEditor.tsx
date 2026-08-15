import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  ChevronRight, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Code, 
  Quote,
  AlignLeft
} from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'PDF' | 'Link';
  url: string;
}

export default function EditLesson() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('Introduction to Video Editing');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=abc123');
  const [writtenNotes, setWrittenNotes] = useState(
    'Video editing is the process of manipulating and rearranging video shots. In this lesson, you will learn the basics of video editing interface and workflow.'
  );
  const [homework, setHomework] = useState(
    'Create a 30-second video applying the techniques you learned in this lesson.'
  );

  // Resources State
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: 'Video Editing Notes.pdf', type: 'PDF', url: '#' },
    { id: '2', name: 'Recommended Tutorial', type: 'Link', url: '#' },
    { id: '3', name: 'Editing Workbook.pdf', type: 'PDF', url: '#' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/admin/courses/${courseId}/lessons/${lessonId}`, {
        title,
        videoUrl,
        writtenNotes,
        homework,
        resources,
      });
      navigate(`/admin/courses/${courseId}`);
    } catch (err: any) {
      console.error('Failed to save lesson:', err);
      // Fallback navigation
      navigate(`/admin/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = () => {
    const newRes: Resource = {
      id: Date.now().toString(),
      name: 'New Resource File.pdf',
      type: 'PDF',
      url: '#',
    };
    setResources([...resources, newRes]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
        <p className="text-sm text-gray-500 mt-0.5">Update your lesson content.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSaveLesson} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content - 2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lesson Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Lesson Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-gray-800"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Video URL
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or Vimeo link"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-700"
            />
            <span className="block text-[11px] text-gray-400 mt-1 font-medium">
              Paste YouTube or Vimeo link
            </span>
          </div>

          {/* Written Notes & Rich Text Toolbar */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Written Notes
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
              
              {/* Text Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/70 border-b border-gray-200 text-gray-600 text-xs">
                <select className="px-2 py-1 bg-transparent border border-gray-200 rounded text-xs font-medium focus:outline-none text-gray-700 mr-1">
                  <option>Normal</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                </select>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200/60 rounded text-gray-700">
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Area */}
              <textarea
                rows={6}
                value={writtenNotes}
                onChange={(e) => setWrittenNotes(e.target.value)}
                className="w-full p-3.5 text-sm focus:outline-none text-gray-700 leading-relaxed resize-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column (Resources & Homework - 1/3 Width) */}
        <div className="space-y-6">
          
          {/* Resources Card */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700">Resources</h3>
            
            <div className="space-y-2">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        res.type === 'PDF'
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-indigo-50 text-indigo-500'
                      }`}
                    >
                      {res.type === 'PDF' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-800 line-clamp-1">
                      {res.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      {res.type}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddResource}
              className="w-full py-2.5 bg-white hover:bg-gray-50 text-brand text-xs font-semibold rounded-xl border border-gray-200 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Resource
            </button>
          </div>

          {/* Homework Card */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Homework <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
              <textarea
                rows={3}
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="Assign optional homework task..."
                className="w-full text-xs text-gray-700 border-none p-0 focus:outline-none focus:ring-0 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}