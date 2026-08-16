import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Link2, CheckCircle } from 'lucide-react';

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'homework'>('notes');
  const [isCompleted, setIsCompleted] = useState(false);

  const lessonData = {
    title: 'Introduction to Video Editing',
    lessonMeta: 'Lesson 01 of 12',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    notes: 'Video editing is the process of manipulating and rearranging video shots. In this lesson, you will learn the basics of video editing interface and workflow.',
    learningPoints: [
      'Understanding the interface',
      'Importing and organizing media',
      'Basic timeline navigation',
    ],
    resources: [
      { id: '1', name: 'Video Editing Notes.pdf', type: 'PDF' },
      { id: '2', name: 'Recommended Tutorial', type: 'Link' },
      { id: '3', name: 'Editing Workbook.pdf', type: 'PDF' },
    ],
    homework: 'Create a 30-second video applying the techniques you learned in this lesson.',
  };

  const handleToggleComplete = () => {
    setIsCompleted((prev) => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title & Metadata */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{lessonData.title}</h1>
        <p className="text-xs font-semibold text-gray-400 mt-0.5">{lessonData.lessonMeta}</p>
      </div>

      {/* Video Player Container */}
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-900">
        <iframe
          src={lessonData.videoUrl}
          title={lessonData.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Tab Controls */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'notes'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'resources'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'homework'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Homework
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[160px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {activeTab === 'notes' && (
          <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
            <p>{lessonData.notes}</p>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-gray-900">What you'll learn:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-1">
                {lessonData.learningPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-2.5">
            {lessonData.resources.map((res) => (
              <div
                key={res.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-100/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {res.type === 'PDF' ? (
                    <FileText className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Link2 className="w-4 h-4 text-indigo-500" />
                  )}
                  <span className="text-xs font-semibold text-gray-800">{res.name}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{res.type}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="text-xs text-gray-700 leading-relaxed">
            <h4 className="font-bold text-gray-900 mb-1.5">Assigned Task:</h4>
            <p className="bg-gray-50 p-4 rounded-xl border border-gray-100">{lessonData.homework}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Completion Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleToggleComplete}
          className={`px-6 py-2.5 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 text-white ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isCompleted && <CheckCircle className="w-4 h-4" />}
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </button>

        <button
          onClick={() => navigate(`/student/courses/${courseId}/lessons/${Number(lessonId || 1) + 1}`)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}