import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Meetings from "./pages/Meetings";
import MeetingWorkspace from "./pages/MeetingWorkspace";
import Communication from "./pages/Communication";
import TeacherDashboard from "./pages/TeacherDashboard";
import Teachers from "./pages/Teachers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import AINotices from "./pages/admin/AINotices";
import TeacherNotices from "./pages/teacher/TeacherNotices";
import ParentMessages from "./pages/ParentMessages";
import ParentSatisfaction from "./pages/ParentSatisfaction";
import PublicFeedback from "./pages/PublicFeedback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ActivityFeed from "./pages/ActivityFeed";

import ProtectedRoute from "./routes/ProtectedRoute";
import CommandPalette from "./components/ui/CommandPalette";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CommandPalette />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/feedback/:meetingId" element={<PublicFeedback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/meetings/:id" element={<ProtectedRoute><MeetingWorkspace /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/notices" element={<ProtectedRoute><AINotices /></ProtectedRoute>} />
          <Route path="/parent-messages" element={<ProtectedRoute><ParentMessages /></ProtectedRoute>} />
          <Route path="/parent-satisfaction" element={<ProtectedRoute><ParentSatisfaction /></ProtectedRoute>} />
          <Route path="/activity-feed" element={<ProtectedRoute><ActivityFeed /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacherDashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/analytics" element={<ProtectedRoute><TeacherAnalytics /></ProtectedRoute>} />
          <Route path="/teacher/notices" element={<ProtectedRoute><TeacherNotices /></ProtectedRoute>} />

          {/* Legacy redirect fix */}
          <Route path="/teacher" element={<Navigate to="/teacherDashboard" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;