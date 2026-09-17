import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { SubjectsExplorer } from './components/SubjectsExplorer';
import { Pichhle10SaalPYQ } from './components/Pichhle10SaalPYQ';
import { AITeacherChatbot } from './components/AITeacherChatbot';
import { TrickSeSamjho } from './components/TrickSeSamjho';
import { MathPrashnawaliSolutions } from './components/MathPrashnawaliSolutions';
import { StudyTipsModal } from './components/StudyTipsModal';
import { InstallAppModal } from './components/InstallAppModal';
import { ActiveMainTab, SubjectId } from './types';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import { PullToRefresh } from './components/PullToRefresh';

function AppContent() {
  const { subjectsData, loading, refreshData } = useData();
  const [activeTab, setActiveTab] = useState<ActiveMainTab>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('maths');
  const [aiTeacherSubject, setAiTeacherSubject] = useState<string>('गणित (Maths)');
  const [aiTeacherChapter, setAiTeacherChapter] = useState<string>('');
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Navigate to AI Teacher with context
  const handleNavigateToAITeacherWithContext = (subjectName: string, chapterName: string) => {
    setAiTeacherSubject(subjectName);
    setAiTeacherChapter(chapterName);
    setActiveTab('ai-teacher');
  };

  // Direct ask on PYQ
  const handleAskAITeacherPYQ = (questionText: string, subjectName: string, chapterName: string) => {
    setAiTeacherSubject(subjectName);
    setAiTeacherChapter(chapterName);
    setActiveTab('ai-teacher');
  };

  if (loading && Object.keys(subjectsData).length === 0) {
    return <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">Loading database...</div>;
  }

  return (
    <PullToRefresh onRefresh={refreshData}>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenTips={() => setIsTipsModalOpen(true)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-20 pt-16">
          {activeTab === 'home' && (
            <HomeScreen
              onNavigateTab={setActiveTab}
              onSelectSubject={setSelectedSubjectId}
              onOpenTips={() => setIsTipsModalOpen(true)}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsExplorer
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
              onNavigateToAITeacher={handleNavigateToAITeacherWithContext}
            />
          )}

          {activeTab === 'pyq' && (
            <Pichhle10SaalPYQ
              onAskAITeacher={handleAskAITeacherPYQ}
            />
          )}

          {activeTab === 'ai-teacher' && (
            <AITeacherChatbot
              initialSubject={aiTeacherSubject}
              initialChapter={aiTeacherChapter}
            />
          )}
          
          {activeTab === 'tricks' && (
            <TrickSeSamjho onAskAITeacher={handleAskAITeacherPYQ} />
          )}
        </main>

        <BottomNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
        
        {isTipsModalOpen && <StudyTipsModal isOpen={isTipsModalOpen} onClose={() => setIsTipsModalOpen(false)} />}
        {isInstallModalOpen && <InstallAppModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />}
      </div>
    </PullToRefresh>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
