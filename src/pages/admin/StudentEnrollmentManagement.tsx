import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

import {
  ArrowLeft,
  BookOpen,
  User,
  Mail,
  RefreshCw,
  UserPlus,
  Ban,
  CheckCircle,
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  coursesEnrolled: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  active: boolean;
  enrolledAt: string;
}

export default function StudentEnrollmentManagement() {

  const { userId } = useParams<{
    userId: string;
  }>();

  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  // ==========================================
  // LOAD STUDENT
  // ==========================================

  const fetchStudent = async () => {

    if (!userId) return;

    try {

      const response = await api.get(
        `/admin/students/${userId}`
      );

      setStudent(response.data);

    } catch (err: any) {

      console.error(
        'Failed to load student:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load student.'
      );
    }
  };

  // ==========================================
  // LOAD ENROLLMENTS
  // ==========================================

  const fetchEnrollments = async () => {

    if (!userId) return;

    try {

      const response = await api.get(
        `/enrollments/user/${userId}`
      );

      setEnrollments(response.data);

    } catch (err: any) {

      console.error(
        'Failed to load enrollments:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load student enrollments.'
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  const loadPage = async () => {

    try {

      setLoading(true);
      setError('');

      await Promise.all([
        fetchStudent(),
        fetchEnrollments(),
      ]);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    loadPage();

  }, [userId]);

  // ==========================================
  // DEACTIVATE
  // ==========================================

  const handleDeactivate = async (
    enrollment: Enrollment
  ) => {

    const confirmed = window.confirm(
      `Remove ${student?.firstName}'s access to "${enrollment.courseTitle}"?`
    );

    if (!confirmed) return;

    try {

      setActionLoading(enrollment.id);

      await api.patch(
        `/enrollments/${enrollment.id}/deactivate`
      );

      await fetchEnrollments();

    } catch (err: any) {

      console.error(
        'Failed to remove access:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Failed to remove course access.'
      );

    } finally {

      setActionLoading(null);
    }
  };

  // ==========================================
  // REACTIVATE
  // ==========================================

  const handleReactivate = async (
    enrollment: Enrollment
  ) => {

    try {

      setActionLoading(enrollment.id);

      await api.patch(
        `/enrollments/${enrollment.id}/reactivate`
      );

      await fetchEnrollments();

    } catch (err: any) {

      console.error(
        'Failed to reactivate access:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Failed to reactivate course access.'
      );

    } finally {

      setActionLoading(null);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    value?: string
  ) => {

    if (!value) return 'Unknown';

    return new Date(value).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="max-w-6xl mx-auto">

        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center justify-center">

          <RefreshCw className="w-7 h-7 text-brand animate-spin" />

          <p className="text-sm text-gray-500 mt-3">
            Loading student...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (!student) {

    return (
      <div className="max-w-6xl mx-auto">

        <div className="bg-white border border-red-100 rounded-xl p-10 text-center">

          <h2 className="text-lg font-bold text-gray-900">
            Student unavailable
          </h2>

          <p className="text-sm text-red-500 mt-2">
            {error || 'Student could not be found.'}
          </p>

          <button
            onClick={() =>
              navigate('/admin/users')
            }
            className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* BACK */}

      <button
        onClick={() =>
          navigate('/admin/users')
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* STUDENT HEADER */}

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

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">

                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  {student.email}
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  Student
                </span>

              </div>

            </div>

          </div>

          <div>

            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                student.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700'
                  : student.status === 'SUSPENDED'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {student.status === 'ACTIVE'
                ? 'Active'
                : student.status === 'SUSPENDED'
                ? 'Suspended'
                : 'Pending Setup'}
            </span>

          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 flex items-center justify-between">

          <p className="text-sm">
            {error}
          </p>

          <button
            onClick={loadPage}
            className="text-xs font-semibold underline"
          >
            Try again
          </button>

        </div>
      )}

      {/* ENROLLMENT HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h2 className="text-lg font-bold text-gray-900">
            Course Enrollments
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage the courses this student can access.
          </p>

        </div>

        <button
          onClick={() =>
            navigate(
              `/admin/users/enroll?studentId=${student.id}`
            )
          }
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Enroll in Course
        </button>

      </div>

      {/* ENROLLMENTS */}

      {enrollments.length === 0 ? (

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">

          <BookOpen className="w-9 h-9 mx-auto text-gray-300" />

          <h3 className="text-sm font-semibold text-gray-900 mt-4">
            No course enrollments
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            This student has not been enrolled in any courses yet.
          </p>

          <button
            onClick={() =>
              navigate(
                `/admin/users/enroll?studentId=${student.id}`
              )
            }
            className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>

        </div>

      ) : (

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="divide-y divide-gray-100">

            {enrollments.map(
              (enrollment) => (

                <div
                  key={enrollment.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >

                  {/* COURSE */}

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <div>

                      <h3 className="text-sm font-semibold text-gray-900">
                        {enrollment.courseTitle}
                      </h3>

                      <p className="text-xs text-gray-400 mt-1">
                        Enrolled{' '}
                        {formatDate(
                          enrollment.enrolledAt
                        )}
                      </p>

                    </div>

                  </div>

                  {/* STATUS + ACTION */}

                  <div className="flex items-center gap-3">

                    {enrollment.active ? (

                      <>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>

                        <button
                          onClick={() =>
                            handleDeactivate(
                              enrollment
                            )
                          }
                          disabled={
                            actionLoading ===
                            enrollment.id
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold disabled:opacity-50"
                        >

                          {actionLoading ===
                          enrollment.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}

                          Remove Access

                        </button>
                      </>

                    ) : (

                      <>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <Ban className="w-3.5 h-3.5" />
                          Inactive
                        </span>

                        <button
                          onClick={() =>
                            handleReactivate(
                              enrollment
                            )
                          }
                          disabled={
                            actionLoading ===
                            enrollment.id
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50"
                        >

                          {actionLoading ===
                          enrollment.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}

                          Reactivate

                        </button>
                      </>

                    )}

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}