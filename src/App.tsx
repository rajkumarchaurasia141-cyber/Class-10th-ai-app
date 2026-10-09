import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { GmailAuthModal } from './components/GmailAuthModal';
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
import { DailyQuizView } from './components/DailyQuizView';
import { TopperLeaderboardView } from './components/TopperLeaderboardView';
import { DownloadPage } from './components/DownloadPage';
import { InstallAppBanner } from './components/InstallAppBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { Footer } from './components/Footer';
import { AiTeacherStudioView } from './components/AiTeacherStudioView';
import { CartoonStudioView } from './components/CartoonStudioView';
import { PyqView } from './components/PyqView';
import { CrashCourseView } from './components/CrashCourseView';

// Password check logic function as requested
function checkAdminSecret(enteredPass: string): boolean {
  return enteredPass === "#656920578506#";
}

function MainApp() {
  const { user, isAdmin, isVIP, vipDetails } = useAuth();

  // Clear any old stale firestore quota block flag on load
  React.useEffect(() => {
    try {
      localStorage.removeItem('bseb_firestore_quota_exhausted');
    } catch (e) {}
  }, []);

  // Screen Wake Lock API to prevent screen from turning off while app is open
  React.useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);
  
  const isDownloadQuery = typeof window !== 'undefined' && 
    (window.location.search.includes('download=apk') || window.location.pathname.includes('/download'));
  const isAdminQuery = typeof window !== 'undefined' && 
    (window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin') || window.location.search.includes('tab=admin'));
  const isAboutQuery = typeof window !== 'undefined' && window.location.pathname.includes('/about');
  const isContactQuery = typeof window !== 'undefined' && window.location.pathname.includes('/contact');
  const isPrivacyQuery = typeof window !== 'undefined' && window.location.pathname.includes('/privacy');

  const getInitialTab = () => {
    if (isAboutQuery) return 'about';
    if (isContactQuery) return 'contact';
    if (isPrivacyQuery) return 'privacy';
    if (isAdminQuery) return 'admin';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [forceDownloadMode, setForceDownloadMode] = useState(isDownloadQuery);

  // Modals
  const [showVipModal, setShowVipModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showGmailAuth, setShowGmailAuth] = useState(false);

  const [adminVerified, setAdminVerified] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  const mainScrollRef = React.useRef<HTMLElement>(null);

  // Auto-scroll to top when active tab or subject changes so user NEVER has to scroll up!
  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, selectedSubject]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      // If clicking current active tab, smoothly scroll back to top of screen
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedSubject(null);
      setActiveTab(tab);
      try {
        const path = tab === 'about' ? '/about' : tab === 'contact' ? '/contact' : tab === 'privacy' ? '/privacy-policy' : tab === 'admin' ? '/admin' : '/';
        window.history.pushState({}, '', path);
      } catch (e) {}
      mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleAdminClick = () => {
    setActiveTab('admin');
  };

  if (forceDownloadMode) {
    return (
      <DownloadPage onBackToApp={() => {
        window.history.replaceState({}, '', window.location.origin);
        setForceDownloadMode(false);
      }} />
    );
  }

  const handleDrawerNavigate = (view: string, extra?: any) => {
    switch (view) {
      case 'home':
        handleTabChange('home');
        break;
      case 'course':
        handleTabChange('my_courses');
        break;
      case 'live':
        handleTabChange('live');
        break;
      case 'leaderboard':
        handleTabChange('leaderboard');
        break;
      case 'chat':
        handleTabChange('chat');
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
      case 'crash_course':
        handleTabChange('crash_course');
        break;
      case 'pyqs':
        handleTabChange('pyqs');
        break;
      case 'ai_studio':
        handleTabChange('ai_studio');
        break;
      case 'cartoon_studio':
        handleTabChange('cartoon_studio');
        break;
      case 'admin':
        handleAdminClick();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col selection:bg-red-500/30 overflow-x-hidden">
      {/* Edge-to-Edge Full-Width Responsive App Container */}
      <div className="w-full bg-slate-50 min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Top Header Bar with Hamburger Menu & Notifications */}
        <MobileTopBar
          onOpenDrawer={() => setShowDrawer(true)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenVip={() => setShowVipModal(true)}
          onOpenAdmin={handleAdminClick}
          onOpenGmailAuth={() => setShowGmailAuth(true)}
          onGoHome={() => handleTabChange('home')}
          unreadCount={2}
        />

        {/* Side Drawer (Sliding Hamburger Menu) */}
        <AppDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          onNavigate={handleDrawerNavigate}
          onOpenVip={() => setShowVipModal(true)}
          onOpenGmailAuth={() => setShowGmailAuth(true)}
        />

        {/* Main Content Area */}
        <main ref={mainScrollRef} className="flex-1 w-full pb-40">
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

          {activeTab === 'ai_studio' && (
            <AiTeacherStudioView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'cartoon_studio' && (
            <CartoonStudioView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'crash_course' && (
            <CrashCourseView 
              onBack={() => setActiveTab('home')} 
              onOpenVip={() => setShowVipModal(true)} 
            />
          )}

          {activeTab === 'pyqs' && (
            <PyqView 
              onBack={() => setActiveTab('home')} 
              onOpenVip={() => setShowVipModal(true)} 
            />
          )}

          {activeTab === 'daily_quiz' && (
            <DailyQuizView 
              onOpenVip={() => setShowVipModal(true)}
              onSelectSubject={(id: string) => {
                setSelectedSubject(id);
                setActiveTab('explorer');
              }}
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
              onOpenGmailAuth={() => setShowGmailAuth(true)}
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

          {activeTab === 'admin' && isAdmin && adminVerified && (
            <AdminPanel onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && isAdmin && !adminVerified && (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-5">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
                🔑
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Enter admin secret password</h2>
                <p className="text-stone-500 text-xs font-semibold">
                  एडमिन पैनल सुरक्षा के लिए कृपया सीक्रेट पासवर्ड दर्ज करें
                </p>
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl mt-2 text-[11px] text-emerald-800 font-bold">
                  पहचान स्वीकृत: {user?.email || 'राजकुमार (Direct)'}
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (checkAdminSecret(adminPasswordInput)) {
                    setAdminVerified(true);
                    setAdminPasswordError('');
                  } else {
                    alert("Galat Password");
                    setAdminPasswordError('गलत पासवर्ड! कृपया पुनः प्रयास करें।');
                  }
                }}
                className="space-y-4 pt-2"
              >
                <div>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    placeholder="सीक्रेट पासवर्ड यहाँ डालें..."
                    className="w-full px-4 py-3 text-center border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold tracking-widest text-lg bg-stone-50 text-stone-900"
                    autoFocus
                  />
                  {adminPasswordError && (
                    <p className="text-red-600 text-xs font-bold mt-2">{adminPasswordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm"
                  >
                    🔓 प्रवेश करें / Verify Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasswordInput('');
                      setAdminPasswordError('');
                      setActiveTab('home');
                    }}
                    className="w-full bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer text-xs"
                  >
                    होम पर वापस जाएँ
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'about' && (
            <AboutView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'contact' && (
            <ContactView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPolicyView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && !isAdmin && (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-5">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                ⚠️
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">अनधिकृत प्रवेश (Restricted Access)</h2>
                <p className="text-stone-500 text-xs font-semibold leading-relaxed">
                  यह अनुभाग केवल राजकुमार सर (Admin) के लिए सुरक्षित है। आपकी जीमेल आईडी <b>{user?.email || 'Guest / Not Logged In'}</b> को एडमिन का अधिकार प्राप्त नहीं है।
                </p>
                <p className="text-red-600 text-xs font-black">
                  कृपया लॉगिन पेज पर सही एडमिन जीमेल आईडी से लॉगिन करें।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="w-full bg-stone-900 hover:bg-black text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer text-xs"
              >
                ← मुख्य पृष्ठ (Home Screen) पर वापस जाएँ
              </button>
            </div>
          )}

          {/* App Footer with AdSense Pages Links */}
          <Footer onNavigate={handleTabChange} />
        </main>

        {/* Bottom Navigation Bar (Sticky Native App Footer) */}
        {activeTab !== 'admin' && (
          <BottomNavBar
            activeTab={activeTab === 'explorer' ? 'my_courses' : activeTab}
            onTabChange={handleTabChange}
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
        <GmailAuthModal 
          isOpen={showGmailAuth} 
          onClose={() => setShowGmailAuth(false)} 
        />
        <InstallAppBanner />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
