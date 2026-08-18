import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Search,
  UserPlus,
  BookOpen,
} from 'lucide-react';

import api from '../../api/axios';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
}

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  category?: string;
  status?: string;
}

interface EnrollmentResponse {
  id: string;
  userId?: string;
  courseId?: string;
  studentName?: string;
  courseTitle?: string;
  active?: boolean;
}

export default function EnrollStudent() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');

  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =====================================================
  // LOAD STUDENTS + COURSES
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentsResponse, coursesResponse] =
        await Promise.all([
          api.get('/admin/students'),
          api.get('/admin/courses'),
        ]);

      setStudents(studentsResponse.data);
      setCourses(coursesResponse.data);
    } catch (err: any) {
      console.error('Failed to load enrollment data:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load students and courses.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = students.filter((student) => {
    const search = studentSearch.toLowerCase().trim();

    if (!search) return true;

    const fullName =
      `${student.firstName} ${student.lastName}`.toLowerCase();

    return (
      fullName.includes(search) ||
      student.email.toLowerCase().includes(search)
    );
  });

  // =====================================================
  // FILTER COURSES
  // =====================================================

  const filteredCourses = courses.filter((course) => {
    const search = courseSearch.toLowerCase().trim();

    if (!search) return true;

    return (
      course.title.toLowerCase().includes(search) ||
      course.subtitle?.toLowerCase().includes(search) ||
      course.category?.toLowerCase().includes(search)
    );
  });

  // =====================================================
  // SELECTED DATA
  // =====================================================

  const selectedStudent = students.find(
    (student) => student.id === studentId
  );

  const selectedCourse = courses.find(
    (course) => course.id === courseId
  );

  // =====================================================
  // ENROLL
  // =====================================================

  const handleEnroll = async () => {
    if (!studentId) {
      setError('Please select a student.');
      return;
    }

    if (!courseId) {
      setError('Please select a course.');
      return;
    }

    try {
      setEnrolling(true);
      setError('');
      setSuccess('');

      const response = await api.post<EnrollmentResponse>(
        '/enrollments',
        {
          userId: studentId,
          courseId: courseId,
        }
      );

      console.log('Enrollment created:', response.data);

      setSuccess(
        `${selectedStudent?.firstName} ${selectedStudent?.lastName} has been enrolled in "${selectedCourse?.title}".`
      );

      // Clear selection
      setStudentId('');
      setCourseId('');
      setStudentSearch('');
      setCourseSearch('');

    } catch (err: any) {
      console.error('Enrollment failed:', err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to enroll student.';

      setError(
        typeof message === 'string'
          ? message
          : 'Failed to enroll student.'
      );
    } finally {
      setEnrolling(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center">
          <RefreshCw className="w-7 h-7 text-brand animate-spin" />

          <p className="text-sm text-gray-500 mt-3">
            Loading students and courses...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3">

        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enroll Student
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Give a student access to a course.
          </p>
        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">

          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Enrollment successful
            </p>

            <p className="text-xs text-emerald-700 mt-1">
              {success}
            </p>
          </div>

        </div>
      )}

      {/* =================================================
          ENROLLMENT FORM
      ================================================= */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

        <div className="mb-6">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Course Enrollment
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                Select a student and the course they should access.
              </p>
            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* =================================================
              STUDENT
          ================================================= */}

          <div>

            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Student
            </label>

            <div className="relative mb-3">

              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={studentSearch}
                onChange={(e) =>
                  setStudentSearch(e.target.value)
                }
                placeholder="Search student..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />

            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">

              <div className="max-h-72 overflow-y-auto">

                {filteredStudents.length === 0 ? (

                  <div className="p-8 text-center">

                    <p className="text-sm text-gray-500">
                      No students found.
                    </p>

                  </div>

                ) : (

                  filteredStudents.map((student) => {

                    const selected =
                      student.id === studentId;

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setStudentId(student.id);
                          setError('');
                        }}
                        className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition ${
                          selected
                            ? 'bg-brand/5'
                            : 'hover:bg-gray-50'
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {student.firstName}{' '}
                              {student.lastName}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {student.email}
                            </p>

                          </div>

                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                          )}

                        </div>

                      </button>
                    );
                  })

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              COURSE
          ================================================= */}

          <div>

            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Course
            </label>

            <div className="relative mb-3">

              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={courseSearch}
                onChange={(e) =>
                  setCourseSearch(e.target.value)
                }
                placeholder="Search course..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />

            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">

              <div className="max-h-72 overflow-y-auto">

                {filteredCourses.length === 0 ? (

                  <div className="p-8 text-center">

                    <BookOpen className="w-7 h-7 mx-auto text-gray-300" />

                    <p className="text-sm text-gray-500 mt-2">
                      No courses found.
                    </p>

                  </div>

                ) : (

                  filteredCourses.map((course) => {

                    const selected =
                      course.id === courseId;

                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => {
                          setCourseId(course.id);
                          setError('');
                        }}
                        className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition ${
                          selected
                            ? 'bg-brand/5'
                            : 'hover:bg-gray-50'
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-9 rounded-md overflow-hidden bg-gray-100 shrink-0">

                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300">
                                TM
                              </div>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {course.title}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {course.category || 'Course'}
                            </p>

                          </div>

                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                          )}

                        </div>

                      </button>
                    );
                  })

                )}

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SELECTION SUMMARY
        ================================================= */}

        {(selectedStudent || selectedCourse) && (

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Enrollment Summary
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">

              <div>
                <p className="text-[11px] text-gray-400">
                  Student
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : 'Not selected'}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-gray-400">
                  Course
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {selectedCourse?.title ||
                    'Not selected'}
                </p>
              </div>

            </div>

          </div>

        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleEnroll}
            disabled={
              enrolling ||
              !studentId ||
              !courseId
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {enrolling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Enroll Student
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}