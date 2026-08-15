import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
// import Login from './pages/auth/Login';
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/Users';
import CreateStudent from './pages/admin/CreateStudent';
import AdminCourses from './pages/admin/Courses';
import CourseManagement from './pages/admin/CourseManage';
import CreateCourse from './pages/admin/CreateCourse';
import AddLesson from './pages/admin/AddLesson';
import EditLesson from './pages/admin/LessonEditor';
// import LessonEditor from './pages/admin/LessonEditor';
// import AdminAnalytics from './pages/admin/Analytics';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
// import MyCourses from './pages/student/MyCourses';
// import CourseView from './pages/student/CourseView';
// import LessonViewer from './pages/student/LessonViewer';
// import MyProgress from './pages/student/MyProgress';
// import StudentSettings from './pages/student/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="users/create" element={<CreateStudent />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:courseId/manage" element={<CourseManagement />} />
            <Route path="/admin/courses/create" element={<CreateCourse />} />
<Route path="/admin/courses/:courseId/lessons/add" element={<AddLesson />} />
<Route path="/admin/courses/:courseId/lessons/:lessonId/edit" element={<EditLesson />} />
            {/* <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
            <Route path="analytics" element={<AdminAnalytics />} /> */}
          </Route>
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            {/* <Route path="courses" element={<MyCourses />} />
            <Route path="courses/:courseId" element={<CourseView />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
            <Route path="progress" element={<MyProgress />} />
            <Route path="settings" element={<StudentSettings />} /> */}
          </Route>
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}