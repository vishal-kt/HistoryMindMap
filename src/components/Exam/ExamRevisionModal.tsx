import React, { useState, useMemo } from 'react';
import { getAllExamFlashcards, ExamFlashcard } from '../../data/historyData';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  FileText,
  Trophy,
  Filter,
} from 'lucide-react';

interface ExamRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamRevisionModal: React.FC<ExamRevisionModalProps> = ({ isOpen, onClose }) => {
  const allCards = useMemo(() => getAllExamFlashcards(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'प्राचीन भारत' | 'मध्यकालीन भारत' | 'आधुनिक भारत'>('all');

  const filteredCards = useMemo(() => {
    if (categoryFilter === 'all') return allCards;
    return allCards.filter((c) => c.category === categoryFilter);
  }, [allCards, categoryFilter]);

  if (!isOpen) return null;

  const currentCard: ExamFlashcard | undefined = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // If all mastered in this set, fire confetti
        if (next.size === filteredCards.length) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
      return next;
    });
  };

  const progressPercent = Math.round((masteredIds.size / (filteredCards.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                परीक्षा उपयोगी वन-लाइनर एवं क्विक रिकॉल कार्ड्स
              </h2>
              <p className="text-xs text-slate-400">
                RRB NTPC, SSC CGL एवं State PSC परीक्षा हेतु प्रामाणिक ऐतिहासिक तथ्य
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Progress */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">काल:</span>
            {(['all', 'प्राचीन भारत', 'मध्यकालीन भारत', 'आधुनिक भारत'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'सभी' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-mono text-[11px]">
              {masteredIds.size} / {filteredCards.length} याद हुए ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[320px]">
          {currentCard ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[240px] bg-gradient-to-br from-slate-900 via-slate-900 to-[#1e293b] border-2 border-slate-700/80 hover:border-sky-500/80 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-xl flex flex-col justify-between group relative select-none"
            >
              {/* Card Badge Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 font-semibold">
                  {currentCard.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-xs flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>पृष्ठ {currentCard.sourcePage}</span>
                  </span>

                  <span className="text-slate-400 font-mono text-xs">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Main Card Content */}
              <div className="my-auto py-4 text-center">
                {!isFlipped ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">
                      विषय: {currentCard.topic}
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed">
                      {currentCard.question}
                    </div>
                    <div className="mt-4 text-xs text-sky-400/80 flex items-center justify-center gap-1 group-hover:text-sky-300">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>उत्तर देखने हेतु कार्ड पर क्लिक करें</span>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-xs uppercase tracking-wider text-amber-400 mb-2 font-mono flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>प्रामाणिक परीक्षा तथ्य (One-Liner)</span>
                    </div>
                    <div className="text-base md:text-lg font-semibold text-emerald-300 leading-relaxed bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/50">
                      {currentCard.answer}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-[11px]">क्लिक करके पलटें</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMastered(currentCard.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    masteredIds.has(currentCard.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{masteredIds.has(currentCard.id) ? 'कंठस्थ हो गया ✓' : 'कंठस्थ मार्क करें'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">इस श्रेणी में कोई कार्ड उपलब्ध नहीं है।</div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={filteredCards.length <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>पिछला</span>
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'प्रश्न देखें' : 'उत्तर देखें'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={filteredCards.length <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-sky-600/20"
          >
            <span>अगला</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
