import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface FlashcardViewProps {
  cards: Flashcard[];
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const currentCard = cards[currentIndex];

  if (!cards || cards.length === 0) {
      return <div className="text-center p-8 text-slate-500">Keine Flashcards verfügbar.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] max-w-2xl mx-auto">
      
      {/* Progress */}
      <div className="mb-6 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-1 rounded-full">
        Karte {currentIndex + 1} von {cards.length}
      </div>

      {/* Card Container */}
      <div 
        className="w-full aspect-[3/2] cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-blue-50 border-2 border-white rounded-3xl flex flex-col items-center justify-center p-8 text-center">
             <span className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-4">Begriff</span>
             <h3 className="text-3xl font-bold text-slate-800">{currentCard.term}</h3>
             <p className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-1">
                <RotateCw size={14} /> Klicken zum Umdrehen
             </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-indigo-500">
             <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold mb-4">Definition</span>
             <p className="text-xl leading-relaxed font-medium">{currentCard.definition}</p>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-10">
        <button 
            onClick={prevCard}
            className="p-4 rounded-full bg-white shadow-md text-slate-600 hover:text-blue-600 hover:shadow-lg transition-all"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={nextCard}
            className="p-4 rounded-full bg-white shadow-md text-slate-600 hover:text-blue-600 hover:shadow-lg transition-all"
        >
            <ChevronRight size={24} />
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};