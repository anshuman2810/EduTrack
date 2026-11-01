import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import Login from './pages/Login';
import PublicStudentProfile from './pages/public/PublicStudentProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import StudentDetails from './pages/admin/StudentDetails';
import AcademicsManager from './pages/admin/AcademicsManager';
import TeachersManager from './pages/admin/TeachersManager';
import ParentsManager from './pages/admin/ParentsManager';
import AttendanceManager from './pages/admin/AttendanceManager';
import ExamsMarksManager from './pages/admin/ExamsMarksManager';
import FeedbackManager from './pages/admin/FeedbackManager';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarksEntry from './pages/teacher/TeacherMarksEntry';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherFeedback from './pages/teacher/TeacherFeedback';

// Parent pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildAcademicReport from './pages/parent/ChildAcademicReport';
import ParentFeedback from './pages/parent/ParentFeedback';

// Route protector component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not allowed in this area, redirect to their role dashboard
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user?.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Root redirector based on authentication & role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'parent') return <Navigate to="/parent/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:qrToken" element={<PublicStudentProfile />} />
          <Route path="/student-profile/:qrToken" element={<PublicStudentProfile />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="academics" element={<AcademicsManager />} />
            <Route path="teachers" element={<TeachersManager />} />
            <Route path="parents" element={<ParentsManager />} />
            <Route path="attendance" element={<AttendanceManager />} />
            <Route path="exams" element={<ExamsMarksManager />} />
            <Route path="feedback" element={<FeedbackManager />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="marks" element={<TeacherMarksEntry />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="feedback" element={<TeacherFeedback />} />
          </Route>

          {/* Parent Protected Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['parent', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/parent/dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="report" element={<ChildAcademicReport />} />
            <Route path="feedback" element={<ParentFeedback />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
