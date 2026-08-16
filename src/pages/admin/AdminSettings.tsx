import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import {
  Settings,
  Users,
  Search,
  Trash2,
  Shield,
  GraduationCap,
  UserCheck,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettings() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [userToDelete, setUserToDelete] =
    useState<User | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {

    try {

      setLoading(true);
      setError('');

      const response =
        await api.get('/admin/students');

      setUsers(response.data);

    } catch (err: any) {

      console.error('Failed to load users:', err);

      setError(
        err?.response?.data?.message ||
        'Failed to load users.'
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {

    const value = search.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {

      const fullName =
        `${user.firstName} ${user.lastName}`.toLowerCase();

      return (
        fullName.includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value) ||
        user.status.toLowerCase().includes(value)
      );
    });

  }, [users, search]);

  const handleDelete = async () => {

    if (!userToDelete) {
      return;
    }

    try {

      setDeletingId(userToDelete.id);
      setError('');
      setSuccess('');

      await api.delete(
        `/admin/students/${userToDelete.id}`
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== userToDelete.id
        )
      );

      setSuccess(
        `${userToDelete.firstName} ${userToDelete.lastName} was deleted successfully.`
      );

      setUserToDelete(null);

    } catch (err: any) {

      console.error('Failed to delete user:', err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to delete user.'
      );

    } finally {

      setDeletingId(null);
    }
  };

  const formatDate = (date: string) => {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getInitials = (user: User) => {

    return (
      `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
    ).toUpperCase();
  };

  return (
    <div className="min-h-full space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Settings className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="text-sm text-slate-500">
                Manage your TubeMaster Academy settings
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>

      </div>

      {/* Notifications */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{error}</span>

          <button
            onClick={() => setError('')}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Settings navigation */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">

          <Users className="mb-3 h-6 w-6 text-violet-600" />

          <h2 className="font-semibold text-slate-900">
            User Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage students and administrators.
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <Shield className="mb-3 h-6 w-6 text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Security
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Authentication and access settings.
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <GraduationCap className="mb-3 h-6 w-6 text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Academy
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage platform configuration.
          </p>

        </div>

      </div>

      {/* Users section */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Users header */}

        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Users
              </h2>

              <p className="text-sm text-slate-500">
                {users.length} total users
              </p>
            </div>

            <div className="relative w-full lg:w-80">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
              />

            </div>

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <Loader2 className="h-7 w-7 animate-spin text-violet-600" />

              <p className="text-sm text-slate-500">
                Loading users...
              </p>

            </div>

          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">

            <Users className="h-10 w-10 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50/70"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                          {getInitials(user)}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">

                        {user.role?.toUpperCase() === 'ADMIN' ? (
                          <Shield className="h-3.5 w-3.5" />
                        ) : (
                          <GraduationCap className="h-3.5 w-3.5" />
                        )}

                        {user.role}

                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.status?.toUpperCase() === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >

                        <UserCheck className="h-3.5 w-3.5" />

                        {user.status}

                      </span>

                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">

                      <button
                        onClick={() => setUserToDelete(user)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Trash2 className="h-4 w-4" />

                        Delete

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Delete confirmation modal */}

      {userToDelete && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">

                <AlertTriangle className="h-5 w-5 text-red-600" />

              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Delete user?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  You are about to permanently delete{' '}
                  <strong className="text-slate-700">
                    {userToDelete.firstName}{' '}
                    {userToDelete.lastName}
                  </strong>
                  . This action cannot be undone.
                </p>

              </div>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                onClick={() => setUserToDelete(null)}
                disabled={deletingId !== null}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}