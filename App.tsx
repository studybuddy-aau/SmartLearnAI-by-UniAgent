import React, { useState } from 'react';
import { AppStatus, GeneratedContent, FileInput } from './types';
import { InputSection } from './components/InputSection';
import { SummaryView } from './components/SummaryView';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { generateLearningContent } from './services/geminiService';
import { BookOpen, Layers, GraduationCap, ArrowLeft, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartProcessing = async (files: FileInput[], text: string, focus: string, exclude: string) => {
    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);
    try {
      const result = await generateLearningContent(files, text, focus, exclude);
      setContent(result);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMsg("Ein Fehler ist aufgetreten. Bitte überprüfe deine Dateien oder den API Key.");
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setContent(null);
    setActiveTab('summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">SmartLearn AI</span>
            </div>
            {status === AppStatus.READY && (
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                >
                    <PlusCircle size={16} />
                    Neues Dokument
                </button>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
            
            {status === AppStatus.IDLE && (
                <InputSection onStartProcessing={handleStartProcessing} isLoading={false} />
            )}

            {status === AppStatus.PROCESSING && (
                <InputSection onStartProcessing={() => {}} isLoading={true} />
            )}

            {status === AppStatus.ERROR && (
                <div className="text-center py-20 animate-fade-in">
                    <div className="inline-block p-4 bg-red-100 text-red-600 rounded-full mb-4">
                        <ArrowLeft size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Hoppla! Etwas ist schiefgelaufen.</h2>
                    <p className="text-slate-600 mb-8">{errorMsg}</p>
                    <button onClick={handleReset} className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold">Zurück zum Start</button>
                </div>
            )}

            {status === AppStatus.READY && content && (
                <div className="animate-fade-in">
                    
                    {/* Navigation Tabs */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 inline-flex gap-1">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeTab === 'summary' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <BookOpen size={18} /> Zusammenfassung
                            </button>
                            <button
                                onClick={() => setActiveTab('flashcards')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeTab === 'flashcards' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <Layers size={18} /> Flashcards
                            </button>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeTab === 'quiz' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <GraduationCap size={18} /> Quiz
                            </button>
                        </div>
                    </div>

                    {/* Views */}
                    <div className="min-h-[500px]">
                        {activeTab === 'summary' && <SummaryView data={content.summary} />}
                        {activeTab === 'flashcards' && <FlashcardView cards={content.flashcards} />}
                        {activeTab === 'quiz' && <QuizView data={content.quiz} onRestart={() => { /* State reset handled in QuizView internal logic or simplified here */ }} />}
                    </div>
                </div>
            )}

        </div>
      </main>
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;