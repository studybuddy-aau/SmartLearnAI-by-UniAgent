import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '../types';
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Trophy, RefreshCw, StopCircle } from 'lucide-react';

interface QuizViewProps {
  data: QuizData;
  onRestart: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ data, onRestart }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Flatten logic slightly for easier processing or keep structured
  const currentChapter = data.chapters[currentChapterIndex];
  const currentQuestion = currentChapter?.questions[currentQuestionIndex];
  
  const totalChapters = data.chapters.length;
  // Calculate total questions across all chapters for progress bar
  const totalQuestions = data.chapters.reduce((acc, ch) => acc + ch.questions.length, 0);
  const questionsProcessed = data.chapters.slice(0, currentChapterIndex).reduce((acc, ch) => acc + ch.questions.length, 0) + currentQuestionIndex;
  const progressPercent = totalQuestions > 0 ? (questionsProcessed / totalQuestions) * 100 : 0;

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswerIndex) {
        setScore(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentChapterIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setIsFinished(false);
    if (onRestart) onRestart();
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setShowHint(false);

    if (currentQuestionIndex < currentChapter.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        // End of chapter
        if (currentChapterIndex < totalChapters - 1) {
            setCurrentChapterIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        } else {
            setIsFinished(true);
        }
    }
  };

  if (isFinished) {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = "";
    if (percentage >= 90) message = "Fantastisch! Du bist ein echter Experte.";
    else if (percentage >= 75) message = "Super Leistung! Weiter so.";
    else if (percentage >= 50) message = "Gut gemacht! Du bist auf dem richtigen Weg.";
    else message = "Nicht aufgeben! Wiederholung ist der Schlüssel zum Erfolg.";

    return (
        <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={48} className="text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Erfolgsbericht</h2>
                <div className="text-6xl font-black text-blue-600 mb-4">{percentage}%</div>
                <p className="text-xl text-slate-600 font-medium mb-8">"{message}"</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-xl">
                    <div>
                        <div className="text-sm text-slate-500 uppercase font-bold">Richtig</div>
                        <div className="text-2xl font-bold text-green-600">{score}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 uppercase font-bold">Gesamt</div>
                        <div className="text-2xl font-bold text-slate-700">{totalQuestions}</div>
                    </div>
                </div>

                <button 
                    onClick={handleRestart}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                >
                    <RefreshCw size={20} /> Quiz Neustarten
                </button>
            </div>
        </div>
    );
  }

  if (!currentQuestion) return <div>Lade Quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Header Info */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">Kapitel {currentChapterIndex + 1} von {totalChapters}</span>
                <h2 className="text-xl font-bold text-slate-800">{currentChapter.title}</h2>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsFinished(true)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all text-sm font-semibold"
                    title="Quiz beenden und auswerten"
                >
                    <StopCircle size={18} />
                    <span className="hidden sm:inline">Beenden</span>
                </button>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
                    Frage {currentQuestionIndex + 1} / {currentChapter.questions.length}
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
            <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
                {currentQuestion.text}
            </h3>

            <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                    if (isAnswered) {
                        if (idx === currentQuestion.correctAnswerIndex) {
                            btnClass += "border-green-500 bg-green-50 text-green-800";
                        } else if (idx === selectedOption) {
                            btnClass += "border-red-500 bg-red-50 text-red-800";
                        } else {
                            btnClass += "border-slate-100 text-slate-400";
                        }
                    } else {
                        btnClass += "border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700";
                    }

                    return (
                        <button 
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswered}
                            className={btnClass}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                                    isAnswered && idx === currentQuestion.correctAnswerIndex ? 'bg-green-500 border-green-500 text-white' : 
                                    isAnswered && idx === selectedOption ? 'bg-red-500 border-red-500 text-white' :
                                    'border-slate-300 text-slate-500'
                                }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                {option}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Actions & Hints */}
            {!isAnswered && (
                <div className="mt-6 flex justify-end">
                     <button 
                        onClick={() => setShowHint(true)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${showHint ? 'text-amber-600' : 'text-slate-400 hover:text-amber-500'}`}
                    >
                        <Lightbulb size={18} />
                        {showHint ? currentQuestion.hint : "Hinweis anzeigen"}
                    </button>
                </div>
            )}
        </div>

        {/* Explanation Area */}
        {isAnswered && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl animate-fade-in mb-20">
                <div className="flex items-start gap-4">
                    {selectedOption === currentQuestion.correctAnswerIndex ? (
                        <CheckCircle className="text-green-500 shrink-0 mt-1" size={24} />
                    ) : (
                        <XCircle className="text-red-500 shrink-0 mt-1" size={24} />
                    )}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">
                            {selectedOption === currentQuestion.correctAnswerIndex ? 'Korrekt!' : 'Leider falsch'}
                        </h4>
                        <p className="text-slate-600 leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Fixed Bottom Nav for Next */}
        {isAnswered && (
             <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-center z-10 animate-slide-up">
                <button 
                    onClick={handleNext}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    {currentChapterIndex === totalChapters - 1 && currentQuestionIndex === currentChapter.questions.length - 1 ? "Ergebnis anzeigen" : "Nächste Frage"}
                    <ArrowRight size={20} />
                </button>
             </div>
        )}
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};