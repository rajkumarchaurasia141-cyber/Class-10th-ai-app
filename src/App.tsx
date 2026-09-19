import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { SubjectsExplorer } from './components/SubjectsExplorer';
import { AdminPanel } from './components/AdminPanel';
import { PaywallModal } from './components/PaywallModal';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { AppDrawer } from './components/AppDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { ClassRoutineModal } from './components/ClassRoutineModal';
import { SocialMediaModal } from './components/SocialMediaModal';
import { NcertBooksModal } from './components/NcertBooksModal';
import { DownloadsNotesView } from './components/DownloadsNotesView';
import { DoubtChatView } from './components/DoubtChatView';
import { ProfileView } from './components/ProfileView';
import { MyCoursesView } from './components/MyCoursesView';
import { LiveClassesView } from './components/LiveClassesView';
import { TopperLeaderboardView } from './components/TopperLeaderboardView';
import { DownloadPage } from './components/DownloadPage';
import { InstallAppBanner } from './components/InstallAppBanner';

function MainApp() {
  const { user, isAdmin, isVIP, vipDetails } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const isDownloadQuery = window.location.search.includes('download=apk') || window.location.pathname.includes('/download');
  const [forceDownloadMode, setForceDownloadMode] = useState(isDownloadQuery);

  if (forceDownloadMode) {
    return (
      <DownloadPage onBackToApp={() => {
        window.history.replaceState({}, '', window.location.origin);
        setForceDownloadMode(false);
      }} />
    );
  }

  // Modals
  const [showVipModal, setShowVipModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showNcert, setShowNcert] = useState(false);

  if (!user) return <LoginScreen />;

  const handleDrawerNavigate = (view: string, extra?: any) => {
    switch (view) {
      case 'home':
        setActiveTab('home');
        setSelectedSubject(null);
        break;
      case 'course':
        setActiveTab('my_courses');
        setSelectedSubject(null);
        break;
      case 'live':
        setActiveTab('live');
        setSelectedSubject(null);
        break;
      case 'leaderboard':
        setActiveTab('leaderboard');
        setSelectedSubject(null);
        break;
      case 'routine':
        setShowRoutine(true);
        break;
      case 'ncert':
        setShowNcert(true);
        break;
      case 'social':
        setShowSocial(true);
        break;
      case 'admin':
        setActiveTab('admin');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col selection:bg-red-500/30 overflow-x-hidden">
      {/* Edge-to-Edge Native Android Full-Width App Container */}
      <div className="w-full bg-slate-50 min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Top Header Bar with Hamburger Menu & Notifications */}
        <MobileTopBar
          onOpenDrawer={() => setShowDrawer(true)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenVip={() => setShowVipModal(true)}
          onOpenAdmin={() => setActiveTab('admin')}
          unreadCount={2}
        />

        {/* Side Drawer (Sliding Hamburger Menu) */}
        <AppDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          onNavigate={handleDrawerNavigate}
          onOpenVip={() => setShowVipModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeTab === 'home' && (
            <HomeScreen 
              onSelect={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'my_courses' && (
            <MyCoursesView 
              onSelectSubject={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'live' && (
            <LiveClassesView 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <TopperLeaderboardView 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'downloads' && (
            <DownloadsNotesView 
              onOpenSubject={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'chat' && (
            <DoubtChatView onOpenVip={() => setShowVipModal(true)} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onOpenVip={() => setShowVipModal(true)}
              onOpenRoutine={() => setShowRoutine(true)}
              onOpenSocial={() => setShowSocial(true)}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenCourse={() => setActiveTab('my_courses')}
            />
          )}

          {activeTab === 'explorer' && selectedSubject && (
            <SubjectsExplorer 
              subjectId={selectedSubject} 
              onBack={() => { 
                setActiveTab('home'); 
                setSelectedSubject(null); 
              }} 
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminPanel onBack={() => setActiveTab('home')} />
          )}
        </main>

        {/* Bottom Navigation Bar (Sticky Native App Footer) */}
        {activeTab !== 'admin' && (
          <BottomNavBar
            activeTab={activeTab === 'explorer' ? 'my_courses' : activeTab}
            onTabChange={(tab) => {
              setSelectedSubject(null);
              setActiveTab(tab);
            }}
          />
        )}

        {/* Global Modals */}
        {showVipModal && <PaywallModal onClose={() => setShowVipModal(false)} />}
        {showNotifications && (
          <NotificationsModal
            onClose={() => setShowNotifications(false)}
            onOpenVip={() => setShowVipModal(true)}
            onOpenCourse={() => {
              setActiveTab('my_courses');
              setSelectedSubject(null);
            }}
          />
        )}
        {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
        {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
        {showNcert && (
          <NcertBooksModal
            onClose={() => setShowNcert(false)}
            onOpenSubject={(id) => {
              setSelectedSubject(id);
              setActiveTab('explorer');
            }}
          />
        )}
        <InstallAppBanner />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
