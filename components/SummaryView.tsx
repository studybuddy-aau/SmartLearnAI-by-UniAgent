import React from 'react';
import { Download, BookOpen, HelpCircle } from 'lucide-react';
import { SummaryData } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

interface SummaryViewProps {
  data: SummaryData;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{data.title || "Zusammenfassung"}</h2>
           <p className="text-slate-500 text-sm mt-1">{data.chapters.length} Kapitel analysiert</p>
        </div>
        <button 
            onClick={() => generatePDF(data)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
        >
            <Download size={18} />
            PDF Export
        </button>
      </div>

      <div className="space-y-8">
        {data.chapters.map((chapter, cIdx) => (
            <div key={cIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border border-blue-200">
                            {cIdx + 1}
                        </span>
                        {chapter.title}
                    </h3>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {chapter.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="p-6">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-500" />
                                {topic.title}
                            </h4>
                            <div className="text-slate-600 leading-relaxed space-y-2 text-left">
                                {topic.content.split('\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                            
                            {topic.studyQuestions.length > 0 && (
                                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
                                    <h5 className="text-amber-800 font-semibold text-sm mb-2 flex items-center gap-2">
                                        <HelpCircle size={16} /> Lernfragen
                                    </h5>
                                    <ul className="space-y-2">
                                        {topic.studyQuestions.map((q, qIdx) => (
                                            <li key={qIdx} className="text-amber-900/80 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};