import React from 'react';
import { useData } from '../context/DataContext';
import { BookText } from 'lucide-react';

export function HomeScreen({ onSelect }: any) {
  const { subjects, loading } = useData();

  if (loading) return <div className="text-center p-10 text-stone-400">विषय लोड हो रहे हैं...</div>;

  const subList = Object.values(subjects);
  if (subList.length === 0) return <div className="text-center p-10 text-stone-400">कोई विषय नहीं मिला।</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-amber-500">सभी विषय (Class 10)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subList.map((sub: any, index: number) => (
          <div 
            key={sub.id || `sub-${index}`} 
            onClick={() => onSelect(sub.id)} 
            className="bg-stone-900 p-6 rounded-2xl cursor-pointer border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/50 transition-all flex items-center gap-4 shadow-lg"
          >
            <div className="p-4 bg-amber-500/10 rounded-xl text-amber-500">
              <BookText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{sub.subject_name_hindi || sub.subject_name || sub.id}</h3>
              <p className="text-sm text-stone-400 mt-1">{sub.chapters?.length || 0} अध्याय उपलब्ध</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
