import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  coursesEnrolled: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export default function UsersManagement() {
  const navigate = useNavigate();

  const [students, setStudents] =
    useState<StudentUser[]>([]);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const studentsPerPage = 10;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(
        '/admin/students'
      );

      setStudents(response.data);

    } catch (err: any) {

      console.error(
        'Failed to fetch students:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to load students.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {

    const search =
      searchTerm.toLowerCase().trim();

    return students.filter((student) => {

      const fullName =
        `${student.firstName} ${student.lastName}`
          .toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        student.email
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'ALL' ||
        student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  }, [
    students,
    searchTerm,
    statusFilter,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredStudents.length /
        studentsPerPage
      )
    );

  const paginatedStudents =
    filteredStudents.slice(
      (currentPage - 1) * studentsPerPage,
      currentPage * studentsPerPage
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
  ]);

  const getStatusStyle = (
    status: StudentUser['status']
  ) => {

    if (status === 'ACTIVE') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }

    if (status === 'SUSPENDED') {
      return 'bg-red-50 text-red-700 border-red-100';
    }

    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStatusLabel = (
    status: StudentUser['status']
  ) => {

    if (status === 'ACTIVE') {
      return 'Active';
    }

    if (status === 'SUSPENDED') {
      return 'Suspended';
    }

    return 'Pending setup';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Students
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage students and their access
            to AI STORYSPRINT Editing.
          </p>
        </div>

        {/* <button
          onClick={() =>
            navigate('/admin/users/create')
          }
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Student
        </button> */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

  
  <div className="flex items-center gap-2">

    <button
      onClick={() =>
        navigate('/admin/users/enroll')
      }
      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-brand border border-brand/20 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      Enroll Student
    </button>

    <button
      onClick={() =>
        navigate('/admin/users/create')
      }
      className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
    >
      <Plus className="w-4 h-4" />
      Create Student
    </button>

  </div>

</div>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 flex items-center justify-between">

          <p className="text-sm">
            {error}
          </p>

          <button
            onClick={fetchStudents}
            className="text-xs font-semibold underline"
          >
            Try again
          </button>

        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="relative w-full sm:w-80">

          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search students..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />

        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">

          <label className="text-xs text-gray-500 font-medium">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-3 py-2.5 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Pending Setup
            </option>

            <option value="SUSPENDED">
              Suspended
            </option>
          </select>

          <button
            onClick={fetchStudents}
            disabled={loading}
            title="Refresh students"
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">

              <tr>

                <th className="py-3.5 px-6">
                  Student
                </th>

                <th className="py-3.5 px-6">
                  Email
                </th>

                <th className="py-3.5 px-6">
                  Courses
                </th>

                <th className="py-3.5 px-6">
                  Status
                </th>

                <th className="py-3.5 px-6 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">

              {loading ? (

                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center"
                  >
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand" />

                    <p className="text-sm text-gray-500 mt-3">
                      Loading students...
                    </p>
                  </td>
                </tr>

              ) : paginatedStudents.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center"
                  >

                    <Users className="w-8 h-8 mx-auto text-gray-300" />

                    <p className="text-sm font-medium text-gray-700 mt-3">
                      No students found
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Try changing your search
                      or filter.
                    </p>

                  </td>
                </tr>

              ) : (

                paginatedStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >

                     <td className="py-4 px-6">
  <button
    onClick={() =>
      navigate(`/admin/users/${student.id}`)
    }
    className="flex items-center gap-3 text-left group"
  >

    <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
      {student.firstName?.[0]}
      {student.lastName?.[0]}
    </div>

    <div>
      <p className="font-medium text-gray-900 group-hover:text-brand transition-colors">
        {student.firstName}{' '}
        {student.lastName}
      </p>

      <p className="text-xs text-gray-400">
        View student
      </p>
    </div>

  </button>
</td>

                      <td className="py-4 px-6 text-gray-500">
                        {student.email}
                      </td>

                      <td className="py-4 px-6 font-medium">
                        {student.coursesEnrolled ?? 0}
                      </td>

                      <td className="py-4 px-6">

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
                            student.status
                          )}`}
                        >
                          {getStatusLabel(
                            student.status
                          )}
                        </span>

                      </td>

                      <td className="py-4 px-6 text-right">

                        <button
  onClick={() =>
    navigate(`/admin/users/${student.id}`)
  }
  title="Manage student"
  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
>
  <MoreHorizontal className="w-4 h-4" />
</button>

                      </td>

                    </tr>
                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        {!loading &&
          filteredStudents.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">

              <p className="text-xs text-gray-500">
                Showing{' '}
                {Math.min(
                  (currentPage - 1) *
                    studentsPerPage +
                    1,
                  filteredStudents.length
                )}
                {' '}–{' '}
                {Math.min(
                  currentPage *
                    studentsPerPage,
                  filteredStudents.length
                )}
                {' '}of{' '}
                {filteredStudents.length}
                {' '}students
              </p>

              <div className="flex items-center gap-1">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(1, page - 1)
                    )
                  }
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-xs font-medium text-gray-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          )}

      </div>

    </div>
  );
}