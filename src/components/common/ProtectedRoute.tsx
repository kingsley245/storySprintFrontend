import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requiredRole }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // expected: 'admin' or 'student'

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return <Outlet />;
}