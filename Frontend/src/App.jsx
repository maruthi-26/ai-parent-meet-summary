import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import SetupAdmin from "./pages/SetupAdmin";
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
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import CommandPalette from "./components/ui/CommandPalette";
import api from "./services/api";
import { PageLoader } from "./components/ui/LoadingSpinner";

function SetupGuard() {
  const [setupRequired, setSetupRequired] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const res = await api.get("/setup/status");
        setSetupRequired(res.data.setupRequired);
      } catch (err) {
        setSetupRequired(false);
      }
    };
    checkSetupStatus();
  }, [location.pathname]);

  if (setupRequired === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (setupRequired && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  if (!setupRequired && location.pathname === "/setup") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CommandPalette />
        <Routes>
          <Route element={<SetupGuard />}>
            {/* Setup Page */}
            <Route path="/setup" element={<SetupAdmin />} />

            {/* Public */}
            <Route path="/" element={<Login />} />
            <Route path="/feedback/:meetingId" element={<PublicFeedback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Shared Protected Routes (Admins and Teachers) */}
            <Route path="/students" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><Students /></ProtectedRoute>} />
            <Route path="/students/:id" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><StudentProfile /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><Meetings /></ProtectedRoute>} />
            <Route path="/meetings/:id" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><MeetingWorkspace /></ProtectedRoute>} />
            <Route path="/communication" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><Communication /></ProtectedRoute>} />
            <Route path="/parent-messages" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><ParentMessages /></ProtectedRoute>} />
            <Route path="/activity-feed" element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}><ActivityFeed /></ProtectedRoute>} />

            {/* Admin Only Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Teachers /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AINotices /></ProtectedRoute>} />
            <Route path="/parent-satisfaction" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ParentSatisfaction /></ProtectedRoute>} />

            {/* Teacher Only Routes */}
            <Route path="/teacherDashboard" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/analytics" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherAnalytics /></ProtectedRoute>} />
            <Route path="/teacher/notices" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherNotices /></ProtectedRoute>} />

            {/* Legacy redirect fix */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={["TEACHER"]}><Navigate to="/teacherDashboard" replace /></ProtectedRoute>} />

            {/* Wildcard 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;