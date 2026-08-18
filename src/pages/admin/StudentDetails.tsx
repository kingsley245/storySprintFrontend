import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';

import api from '../../api/axios';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  coursesEnrolled?: number;
}

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty?: string;
  status: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  enrolledAt?: string;
}

export default function StudentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [showEnrollmentModal, setShowEnrollmentModal] =
    useState(false);

  const [courseSearch, setCourseSearch] = useState('');

  const [selectedCourseId, setSelectedCourseId] =
    useState('');

  const [enrolling, setEnrolling] = useState(false);

  const [removingEnrollment, setRemovingEnrollment] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // FETCH STUDENT
  // =========================================================

  const fetchStudent = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      const response = await api.get(
        `/admin/students/${studentId}`
      );

      setStudent(response.data);
    } catch (err: any) {
      console.error('Failed to load student:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load student.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ENROLLMENTS
  // =========================================================

  const fetchEnrollments = async () => {
    if (!studentId) return;

    try {
      setLoadingEnrollments(true);

      const response = await api.get(
        `/admin/students/${studentId}/enrollments`
      );

      setEnrollments(response.data);
    } catch (err: any) {
      console.error(
        'Failed to load enrollments:',
        err
      );

      setEnrollments([]);

      setError(
        err.response?.data?.message ||
          'Failed to load student enrollments.'
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // =========================================================
  // FETCH COURSES
  // =========================================================

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const response = await api.get('/admin/courses');

      setCourses(response.data);
    } catch (err: any) {
      console.error(
        'Failed to load courses:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load courses.'
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!studentId) return;

    fetchStudent();
    fetchEnrollments();
  }, [studentId]);

  // =========================================================
  // OPEN ENROLLMENT MODAL
  // =========================================================

  const openEnrollmentModal = async () => {
    setShowEnrollmentModal(true);
    setCourseSearch('');
    setSelectedCourseId('');
    setError('');
    setSuccess('');

    await fetchCourses();
  };

  // =========================================================
  // FILTER COURSES
  // =========================================================

  const availableCourses = useMemo(() => {
    const enrolledCourseIds = new Set(
      enrollments.map(
        (enrollment) => enrollment.courseId
      )
    );

    const search =
      courseSearch.toLowerCase().trim();

    return courses.filter((course) => {
      const alreadyEnrolled =
        enrolledCourseIds.has(course.id);

      const matchesSearch =
        !search ||
        course.title
          .toLowerCase()
          .includes(search) ||
        course.category
          ?.toLowerCase()
          .includes(search);

      return (
        !alreadyEnrolled &&
        matchesSearch &&
        course.status !== 'ARCHIVED'
      );
    });
  }, [
    courses,
    enrollments,
    courseSearch,
  ]);

  // =========================================================
  // ENROLL STUDENT
  // =========================================================

  const handleEnroll = async () => {
    if (!studentId || !selectedCourseId) {
      return;
    }

    try {
      setEnrolling(true);
      setError('');
      setSuccess('');

      await api.post('/admin/enrollments', {
        studentId,
        courseId: selectedCourseId,
      });

      setSuccess(
        'Student enrolled successfully.'
      );

      setSelectedCourseId('');
      setCourseSearch('');

      await fetchEnrollments();

      setTimeout(() => {
        setShowEnrollmentModal(false);
        setSuccess('');
      }, 900);
    } catch (err: any) {
      console.error(
        'Failed to enroll student:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to enroll student.'
      );
    } finally {
      setEnrolling(false);
    }
  };

  // =========================================================
  // REMOVE ENROLLMENT
  // =========================================================

  const handleRemoveEnrollment = async (
    enrollment: Enrollment
  ) => {
    const confirmed = window.confirm(
      `Remove "${enrollment.courseTitle}" from this student?`
    );

    if (!confirmed) return;

    try {
      setRemovingEnrollment(enrollment.id);
      setError('');

      await api.delete(
        `/admin/enrollments/${enrollment.id}`
      );

      await fetchEnrollments();
    } catch (err: any) {
      console.error(
        'Failed to remove enrollment:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to remove enrollment.'
      );
    } finally {
      setRemovingEnrollment(null);
    }
  };

  // =========================================================
  // FORMAT CATEGORY
  // =========================================================

  const formatCategory = (
    category?: string
  ) => {
    if (!category) return 'Course';

    return category
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center">
          <RefreshCw className="w-7 h-7 text-brand animate-spin" />

          <p className="text-sm text-gray-500 mt-3">
            Loading student...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO STUDENT
  // =========================================================

  if (!student) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-red-100 rounded-xl p-10 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Student not found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error ||
              'Unable to load this student.'}
          </p>

          <button
            onClick={() =>
              navigate('/admin/users')
            }
            className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* BACK */}

      <button
        onClick={() =>
          navigate('/admin/users')
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* HEADER */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-lg font-bold">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </div>

            <div>

              <h1 className="text-xl font-bold text-gray-900">
                {student.firstName}{' '}
                {student.lastName}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {student.email}
              </p>

              <div className="mt-2">

                <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {student.status}
                </span>

              </div>

            </div>

          </div>

          <button
            onClick={openEnrollmentModal}
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* ENROLLED COURSES */}

      <div>

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Enrolled Courses
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Courses currently available to this student.
            </p>

          </div>

          <span className="text-xs font-medium text-gray-500">
            {enrollments.length}{' '}
            {enrollments.length === 1
              ? 'course'
              : 'courses'}
          </span>

        </div>

        {loadingEnrollments ? (

          <div className="bg-white rounded-xl border border-gray-100 p-10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-brand animate-spin" />
            <span className="ml-2 text-sm text-gray-500">
              Loading enrollments...
            </span>
          </div>

        ) : enrollments.length === 0 ? (

          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">

            <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mt-4">
              No courses enrolled
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Enroll this student in a course to give them access.
            </p>

            <button
              onClick={openEnrollmentModal}
              className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {enrollments.map(
              (enrollment) => (

                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >

                  <div className="flex">

                    <div className="w-28 h-28 bg-gray-100 shrink-0">

                      {enrollment.courseThumbnail ? (
                        <img
                          src={
                            enrollment.courseThumbnail
                          }
                          alt={
                            enrollment.courseTitle
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-gray-300" />
                        </div>
                      )}

                    </div>

                    <div className="flex-1 p-4 min-w-0">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {enrollment.courseTitle}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            Enrolled course
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            handleRemoveEnrollment(
                              enrollment
                            )
                          }
                          disabled={
                            removingEnrollment ===
                            enrollment.id
                          }
                          className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Remove enrollment"
                        >
                          {removingEnrollment ===
                          enrollment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>

                      </div>

                      <span className="inline-flex mt-3 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        Enrolled
                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          ENROLLMENT MODAL
      ===================================================== */}

      {showEnrollmentModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              !enrolling &&
              setShowEnrollmentModal(false)
            }
          />

          {/* MODAL */}

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-base font-bold text-gray-900">
                  Enroll Student
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Choose a course for{' '}
                  {student.firstName}{' '}
                  {student.lastName}.
                </p>

              </div>

              <button
                onClick={() =>
                  !enrolling &&
                  setShowEnrollmentModal(false)
                }
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-5">

              {/* SEARCH */}

              <div className="relative">

                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

                <input
                  value={courseSearch}
                  onChange={(e) =>
                    setCourseSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />

              </div>

              {/* COURSE LIST */}

              <div className="mt-4 max-h-72 overflow-y-auto space-y-2">

                {loadingCourses ? (

                  <div className="py-10 text-center">

                    <Loader2 className="w-5 h-5 animate-spin text-brand mx-auto" />

                    <p className="text-xs text-gray-500 mt-2">
                      Loading courses...
                    </p>

                  </div>

                ) : availableCourses.length === 0 ? (

                  <div className="py-10 text-center">

                    <BookOpen className="w-7 h-7 text-gray-300 mx-auto" />

                    <p className="text-sm font-medium text-gray-700 mt-3">
                      No available courses
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      The student may already be enrolled in all courses.
                    </p>

                  </div>

                ) : (

                  availableCourses.map(
                    (course) => {

                      const selected =
                        selectedCourseId ===
                        course.id;

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() =>
                            setSelectedCourseId(
                              course.id
                            )
                          }
                          className={`w-full text-left p-3 rounded-xl border transition ${
                            selected
                              ? 'border-brand bg-brand/5'
                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">

                              {course.thumbnail ? (
                                <img
                                  src={
                                    course.thumbnail
                                  }
                                  alt={
                                    course.title
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-300" />
                                </div>
                              )}

                            </div>

                            <div className="flex-1 min-w-0">

                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {course.title}
                              </h3>

                              <p className="text-[11px] text-gray-500 mt-1">
                                {formatCategory(
                                  course.category
                                )}
                              </p>

                            </div>

                            {selected && (
                              <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                            )}

                          </div>

                        </button>
                      );
                    }
                  )

                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowEnrollmentModal(false)
                }
                disabled={enrolling}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleEnroll}
                disabled={
                  !selectedCourseId ||
                  enrolling
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {enrolling && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {enrolling
                  ? 'Enrolling...'
                  : 'Enroll Student'}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}