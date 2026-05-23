import { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import CoursePicker from './components/CoursePicker';
import LearnView from './components/LearnView';
import ProjectsView from './components/ProjectsView';
import ProgressView from './components/ProgressView';
import ProfileView from './components/ProfileView';
import CompilerView from './components/CompilerView';
import AIChatBot from './components/AIChatBot';
import { Course } from './types';

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; joinedAt: string; avatar?: string; bio?: string; github?: string; currentCourseId?: string | null; enrolledCourses?: string[] } | null>(null);
  const [currentTab, setTab] = useState<string>('learn');
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active course study tracking variables
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  // Authenticate on load
  const initPlatform = async () => {
    setLoading(true);
    try {
      const currentUser = await api.getMe();
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.enrolledCourses || currentUser.enrolledCourses.length === 0) {
          setActiveCourseId(null);
          setTab('new-course');
        } else {
          setActiveCourseId(currentUser.currentCourseId || currentUser.enrolledCourses[0] || null);
        }
      }
      
      const courses = await api.getCourses();
      setCoursesList(courses);
    } catch (err) {
      console.error('Error initializing LearnCraft Platform', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPlatform();
  }, []);

  // Close sidebar on tab change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentTab]);

  // Set selected course active state
  const handleEnrollSuccess = (courseId: string) => {
    setActiveCourseId(courseId);
    if (user) {
      const currentEnrolled = user.enrolledCourses || [];
      const updatedEnrolled = currentEnrolled.includes(courseId) ? currentEnrolled : [...currentEnrolled, courseId];
      setUser({ ...user, currentCourseId: courseId, enrolledCourses: updatedEnrolled });
    }
    setTab('learn');
  };

  const handleCourseChangeInSidebar = async (courseId: string) => {
    try {
      setLoading(true);
      await api.enrollCourse(courseId);
      setActiveCourseId(courseId);
      if (user) {
        const currentEnrolled = user.enrolledCourses || [];
        const updatedEnrolled = currentEnrolled.includes(courseId) ? currentEnrolled : [...currentEnrolled, courseId];
        setUser({ ...user, currentCourseId: courseId, enrolledCourses: updatedEnrolled });
      }
      setTab('learn');
    } catch (e) {
      console.error('Error switching active path:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPicker = () => {
    setActiveCourseId(null);
    if (user) {
      setUser({ ...user, currentCourseId: null });
    }
  };

  const handleAuthSuccess = async (authenticatedUser: any) => {
    setUser(authenticatedUser);
    if (!authenticatedUser.enrolledCourses || authenticatedUser.enrolledCourses.length === 0) {
      setActiveCourseId(null);
      setTab('new-course');
    } else {
      setActiveCourseId(authenticatedUser.currentCourseId || authenticatedUser.enrolledCourses[0] || null);
      setTab('learn');
    }
    try {
      const courses = await api.getCourses();
      setCoursesList(courses);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setActiveCourseId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20 flex items-center justify-center text-[#58CC02] animate-pulse">
            <svg id="loader-cap" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-content-muted text-xs font-semibold uppercase tracking-wider font-mono">Assembling LearnCraft Platform...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated -> Show Login screen
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // COURSE PICKER - After login, if the user has no active course or visits the virtual new course tab, show the course picker full screen
  if (!activeCourseId || currentTab === 'new-course') {
    return (
      <CoursePicker
        coursesList={coursesList}
        activeCourseId={activeCourseId}
        onEnroll={handleEnrollSuccess}
        enrolledCourses={user?.enrolledCourses || []}
        onCancel={user?.enrolledCourses && user.enrolledCourses.length > 0 ? () => {
          if (!activeCourseId) {
            setActiveCourseId(user.currentCourseId || user.enrolledCourses[0] || null);
          }
          setTab('learn');
        } : undefined}
      />
    );
  }

  return (
    <div id="app-workspace-layout" className="flex h-screen bg-base font-sans text-content overflow-hidden relative">
      {/* Mobile Top Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-panel flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#58CC02] flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span className="font-display font-bold text-base text-white">LearnCraft</span>
        </div>
        <button className="text-white p-2" onClick={() => setSidebarOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {/* PERSISTENT SIDEBAR NAVIGATION */}
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        user={user}
        onLogout={handleLogout}
        coursesList={coursesList}
        activeCourseId={activeCourseId}
        onCourseChange={handleCourseChangeInSidebar}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* DETAILED BODY VIEW PANELS */}
      <main id="app-viewport-pane" className="flex-1 flex flex-col h-full overflow-hidden bg-base pt-14 md:pt-0">
        {currentTab === 'learn' && (
          <LearnView
            coursesList={coursesList}
            activeCourseId={activeCourseId}
            onBackToPicker={handleBackToPicker}
          />
        )}

        {currentTab === 'compiler' && activeCourseId && (
          <CompilerView
            activeCourseId={activeCourseId}
            coursesList={coursesList}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsView />
        )}

        {currentTab === 'progress' && (
          <ProgressView />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            coursesList={coursesList}
            onProfileUpdate={(updatedUser) => {
               setUser(updatedUser);
            }}
          />
        )}
      </main>
      <AIChatBot />
    </div>
  );
}
