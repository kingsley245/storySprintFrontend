import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  coursesEnrolled?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function UsersManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentUser[]>([
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@gmail.com', coursesEnrolled: 3, status: 'ACTIVE' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@gmail.com', coursesEnrolled: 2, status: 'ACTIVE' },
    { id: '3', firstName: 'David', lastName: 'Brown', email: 'david@gmail.com', coursesEnrolled: 0, status: 'INACTIVE' },
    { id: '4', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@gmail.com', coursesEnrolled: 1, status: 'ACTIVE' },
    { id: '5', firstName: 'Michael', lastName: 'Lee', email: 'michael@gmail.com', coursesEnrolled: 4, status: 'ACTIVE' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch live students from backend port 8081
    // api.get('/admin/students').then(res => setStudents(res.data)).catch(console.error);
  }, []);

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage students and their access.</p>
        </div>
        <button
          onClick={() => navigate('/admin/users/create')}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Student
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-gray-500 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Courses</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="py-4 px-6 text-gray-500">{student.email}</td>
                  <td className="py-4 px-6 font-medium">{student.coursesEnrolled ?? 0}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {student.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-brand text-white font-medium text-xs flex items-center justify-center">
            1
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-xs flex items-center justify-center">
            2
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-xs flex items-center justify-center">
            3
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}