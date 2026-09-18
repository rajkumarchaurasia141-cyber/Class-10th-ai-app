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
import { BookText, ChevronRight } from 'lucide-react';

function MyCoursesList({ onSelect }: { onSelect: (id: string) => void }) {
  const { subjects, loading } = useData();
  const subList = Object.values(subjects);

  if (loading) return <div className="p-8 text-center text-stone-500">कोर्स लोड हो रहे हैं...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-20">
      <div className="bg-gradient-to-r from-red-700 to-amber-700 text-white p-4 rounded-3xl shadow-sm">
        <h2 className="text-lg font-black">कक्षा 10वीं - टॉपर बैच (BSEB 2027)</h2>
        <p className="text-xs text-amber-100 mt-0.5">एनसीईआरटी आधारित सम्पूर्ण 6 विषय</p>
      </div>

      <div className="space-y-2.5">
        {subList.map((sub: any) => (
          <div
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-100 group-hover:scale-105 transition-transform shrink-0">
                <BookText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-red-700 transition-colors">
                  {sub.subject_name_hindi || sub.subject_name || sub.id}
                </h4>
                <p className="text-xs text-stone-500">
                  {sub.chapters?.length || 0} सम्पूर्ण अध्याय • नोट्स, टिप्स & 50 MCQs
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-50 text-stone-400 group-hover:text-red-700 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainApp() {
  const { user, isAdmin, isVIP, vipDetails } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-red-500/30">
      {/* Mobile Smartphone App Frame (Matches user screenshot mockup perfectly on desktop/mobile) */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200/80">
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
        <main className="flex-1 overflow-y-auto">
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
            <MyCoursesList 
              onSelect={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
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
