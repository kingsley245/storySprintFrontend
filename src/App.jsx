import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import SetupPassword from './pages/auth/SetupPassword';
import CourseEdit from './pages/admin/CourseEdit';
import AdminLessons from './pages/admin/AdminLessons';
import ComingSoonModal from './pages/admin/coming-soon';
// import StudentCourse from './pages/student/StudentCourse';
import StudentLesson from './pages/student/StudentLesson';

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
import StudentEnrollmentManagement from './pages/admin/StudentEnrollmentManagement';

import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/AdminSettings';
import EnrollStudent from './pages/admin/EnrollStudent';
// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseView from './pages/student/CourseView';

import MyProgress from './pages/student/MyProgress';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route
  path="/set-password"
  element={<SetupPassword />}
/>
        </Route>

        {/* Protected Admin Routes */}
       <Route element={<ProtectedRoute requiredRole="admin" />}>
  <Route path="/admin" element={<AdminLayout />}>

    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<AdminDashboard />} />

    <Route path="users" element={<UsersManagement />} />
    <Route path="settings" element={<AdminSettings/>} />
    <Route path="resources" element={<ComingSoonModal/>} />
    <Route
  path="/admin/users/:userId"
  element={<StudentEnrollmentManagement />}
/>

    <Route
      path="users/create"
      element={<CreateStudent />}
    />
    <Route
  path="/admin/users/enroll"
  element={<EnrollStudent />}
/>

    {/* Courses */}
    <Route
      path="courses"
      element={<AdminCourses />}
    />

    <Route
      path="courses/create"
      element={<CreateCourse />}
    />

    {/* Course Management */}
    <Route
      path="courses/:courseId"
      element={<CourseManagement />}
    />

    {/* Add Lesson */}
    <Route
      path="courses/:courseId/lessons/add"
      element={<AddLesson />}
    />

    {/* Edit Lesson */}
    <Route
      path="courses/:courseId/lessons/:lessonId/edit"
      element={<EditLesson />}
    />
    <Route path="courses/:courseId/edit" element={<CourseEdit />} />

    <Route
      path="analytics"
      element={<AdminAnalytics />}
    />

    <Route
  path="/admin/lessons"
  element={<AdminLessons />}
/>

  </Route>
</Route>


<Route element={<ProtectedRoute requiredRole="student" />}>
  <Route path="/student" element={<StudentLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<StudentDashboard />} />

    <Route path="courses" element={<MyCourses />} />

    <Route path="courses/:courseId" element={<CourseView />} />

    <Route
      path="courses/:courseId/learn/:lessonId"
      element={<StudentLesson />}
    />

    <Route path="progress" element={<MyProgress />} />

    <Route path="settings" element={<ComingSoonModal />} />
  </Route>
</Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}