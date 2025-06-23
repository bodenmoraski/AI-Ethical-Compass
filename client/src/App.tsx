import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import ScenarioView from "@/components/ScenarioView";
import Scenarios from "@/pages/Scenarios";
import Dashboard from "@/pages/Dashboard";
import UserScenarios from "@/pages/UserScenarios";
import Leaderboard from "@/pages/Leaderboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TeacherDashboard from "@/pages/TeacherDashboard";
import ClassDetailView from "@/components/teacher/ClassDetailView";
import LiveClassroomMonitor from "@/components/teacher/LiveClassroomMonitor";
import UserTutorial from "@/pages/UserTutorial";
import TeacherTutorial from "@/pages/TeacherTutorial";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import AccessibilityControls from "@/components/AccessibilityControls";
import "@/styles/accessibility.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NotFound from "@/pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import { AuthProvider, useAuth } from "@/lib/auth";
import UserProfileSetup from "@/components/UserProfileSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds - much more responsive for development
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

function AppContent() {
  const { user, needsProfileSetup, loading, createUserProfile } = useAuth();

  const handleFontSizeChange = (size: number) => {
    document.documentElement.style.setProperty('--font-size', `${size}px`);
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    document.documentElement.classList.toggle('high-contrast', enabled);
  };

  const handleScreenReaderToggle = (enabled: boolean) => {
    document.documentElement.setAttribute('aria-live', enabled ? 'polite' : 'off');
  };

  const handleProfileComplete = async (profileData: any) => {
    // Profile is created through the UserProfileSetup component
    // The auth context will automatically update
    console.log('Profile setup complete:', profileData);
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <span className="material-icons animate-spin text-4xl text-primary-600 mb-4">refresh</span>
          <p className="text-primary-800 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if user is logged in but needs to complete profile
  if (user && needsProfileSetup) {
    return (
      <>
        <UserProfileSetup 
          email={user.email!} 
          onProfileComplete={handleProfileComplete}
        />
        <Toaster />
      </>
    );
  }

  // Normal app flow
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/scenarios/:id" element={<ScenarioView />} />
          <Route path="/user-scenarios" element={<UserScenarios />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/class/:classId" element={<ClassDetailView classId="1" />} />
          <Route path="/teacher/classroom/:classId" element={<LiveClassroomMonitor classId={1} userId={1} />} />
          <Route path="/tutorial/user" element={<UserTutorial />} />
          <Route path="/tutorial/teacher" element={<TeacherTutorial />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <Toaster />
      <AccessibilityControls
        onFontSizeChange={handleFontSizeChange}
        onHighContrastToggle={handleHighContrastToggle}
        onScreenReaderToggle={handleScreenReaderToggle}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
