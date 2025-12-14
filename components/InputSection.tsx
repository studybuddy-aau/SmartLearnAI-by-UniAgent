import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Plus } from 'lucide-react';
import { FileInput } from '../types';

interface InputSectionProps {
  onStartProcessing: (files: FileInput[], text: string, focus: string, exclude: string) => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    mammoth: any;
  }
}

export const InputSection: React.FC<InputSectionProps> = ({ onStartProcessing, isLoading }) => {
  const [files, setFiles] = useState<FileInput[]>([]);
  const [textInput, setTextInput] = useState('');
  const [focusInput, setFocusInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const uploadedFiles = Array.from(event.target.files) as File[];

    const processedFiles: FileInput[] = [];

    for (const file of uploadedFiles) {
      if (file.type === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        processedFiles.push({
          name: file.name,
          type: 'pdf',
          data: buffer,
          mimeType: 'application/pdf'
        });
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.endsWith('.docx')
      ) {
        // Handle DOCX using mammoth (loaded via CDN in index.html)
        const arrayBuffer = await file.arrayBuffer();
        try {
          const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          processedFiles.push({
            name: file.name,
            type: 'text',
            data: result.value,
            mimeType: 'text/plain'
          });
        } catch (e) {
          console.error("Error parsing DOCX", e);
          alert(`Fehler beim Lesen von ${file.name}. Bitte als PDF versuchen.`);
        }
      } else {
        // Treat as text (txt, md, etc)
        const text = await file.text();
        processedFiles.push({
          name: file.name,
          type: 'text',
          data: text,
          mimeType: 'text/plain'
        });
      }
    }

    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length === 0 && !textInput.trim()) {
      alert("Bitte laden Sie mindestens eine Datei hoch oder geben Sie Text ein.");
      return;
    }
    onStartProcessing(files, textInput, focusInput, excludeInput);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Deine Unterlagen. Dein Erfolg.</h1>
        <p className="text-slate-500 text-lg">Lade Dokumente hoch oder füge Text ein. Die KI erstellt deinen persönlichen Lernplan.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Upload Area */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Dokumente hochladen (PDF, Word, Text)</label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50">
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.docx,.txt,.md"
                    disabled={isLoading}
                />
                <div className="space-y-2 pointer-events-none">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Upload size={24} />
                    </div>
                    <p className="text-slate-600 font-medium">Dateien hierher ziehen oder klicken</p>
                    <p className="text-xs text-slate-400">Kein Datenlimit</p>
                </div>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                            <FileText size={14} className="text-slate-500"/>
                            <span className="truncate max-w-[150px]">{f.name}</span>
                            <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Text Area */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Oder Text direkt einfügen</label>
            <textarea
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow h-32 resize-none text-slate-700"
                placeholder="Füge hier Notizen oder Texte direkt ein..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isLoading}
            />
        </div>

        {/* Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lernfokus (Optional)</label>
                <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="z.B. Marketing-Mix, Bilanzierung..."
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Weglassen (Optional)</label>
                <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="z.B. Einleitung, Literaturverzeichnis..."
                    value={excludeInput}
                    onChange={(e) => setExcludeInput(e.target.value)}
                    disabled={isLoading}
                />
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${
                isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
            }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin" />
                    Analysiere Inhalte...
                </>
            ) : (
                <>
                    <span className="flex items-center gap-2">Lernmaterial erstellen <Plus size={20} className="hidden sm:inline" /></span>
                </>
            )}
        </button>

      </div>
    </div>
  );
};
