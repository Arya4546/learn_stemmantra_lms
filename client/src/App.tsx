import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SecurityEnforcer } from './components/security/SecurityEnforcer';
import { Landing } from './pages/Landing/Landing';
import { Login } from './pages/Login/Login';
import { About } from './pages/Landing/About';
import { Programs } from './pages/Landing/Programs';
import { Contact } from './pages/Landing/Contact';
import { AdminLayout } from './components/layout/AdminLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { CourseList } from './pages/Student/CourseList';
import { CourseDetail } from './pages/Student/CourseDetail';
import { ContentViewer } from './pages/Student/ContentViewer';
import './index.css';

// A simple protected route wrapper
function ProtectedRoute({ 
  children, 
  requiredRole,
  allowedRoles
}: { 
  children: React.ReactNode; 
  requiredRole?: 'ADMIN' | 'STUDENT';
  allowedRoles?: ('ADMIN' | 'STUDENT')[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-medium">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
    }
  } else if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
}

import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminCourseList } from './pages/Admin/AdminCourseList';
import { AdminStudentList } from './pages/Admin/AdminStudentList';

import { StudentDashboard } from './pages/Student/StudentDashboard';

import { Toaster } from 'react-hot-toast';

// A simple component to redirect to external URLs
function ExternalRedirect({ url }: { url: string }) {
  React.useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return <div className="min-h-screen flex items-center justify-center text-primary font-medium">Redirecting to stemmantra.com...</div>;
}

function App() {
  return (
    <AuthProvider>
      <SecurityEnforcer />
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '1rem', background: '#333', color: '#fff', fontSize: '14px', fontWeight: 'bold' } }} />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<ExternalRedirect url="https://stemmantra.com/career" />} />
          <Route path="/gallery" element={<ExternalRedirect url="https://stemmantra.com/gallery" />} />
          <Route path="/clients" element={<ExternalRedirect url="https://stemmantra.com/clients" />} />
          <Route path="/privacy-policy" element={<ExternalRedirect url="https://stemmantra.com/privacy-policy" />} />
          <Route path="/terms-of-service" element={<ExternalRedirect url="https://stemmantra.com/terms-of-service" />} />
          <Route path="/refund-policy" element={<ExternalRedirect url="https://stemmantra.com/refund-policy" />} />
          
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="students" element={<AdminStudentList />} />
          </Route>
          
          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="content/:contentId" element={<ContentViewer />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
