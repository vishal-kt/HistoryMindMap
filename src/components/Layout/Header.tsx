import React from 'react';
import { SearchBar } from '../Search/SearchBar';
import { HistoryNode } from '../../data/historyData';
import {
  Compass,
  Layers,
  Sparkles,
  Bookmark,
  FileText,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  rootNode: HistoryNode;
  onSelectNode: (node: HistoryNode) => void;
  viewMode: '3d' | '2d';
  onToggleViewMode: () => void;
  onOpenExamModal: () => void;
  onOpenPDFModal: () => void;
  bookmarkedCount: number;
  onToggleBookmarkFilter: () => void;
  isBookmarkFilterActive: boolean;
  focusedPeriod: 'all' | 'ancient' | 'medieval' | 'modern';
  onChangeFocusedPeriod: (period: 'all' | 'ancient' | 'medieval' | 'modern') => void;
}

export const Header: React.FC<HeaderProps> = ({
  rootNode,
  onSelectNode,
  viewMode,
  onToggleViewMode,
  onOpenExamModal,
  onOpenPDFModal,
  bookmarkedCount,
  onToggleBookmarkFilter,
  isBookmarkFilterActive,
  focusedPeriod,
  onChangeFocusedPeriod,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-[#0b101e]/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 z-40 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Compass className="w-5 h-5 text-white animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>भारतीय इतिहास</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              135 पृष्ठ प्रामाणिक
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400">
            इंटरएक्टिव 3D एवं 2D ज्ञान मानचित्र · प्रतियोगी परीक्षा विशेषांक
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <SearchBar rootNode={rootNode} onSelectNode={onSelectNode} />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Era Filter Selector */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => onChangeFocusedPeriod('all')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              focusedPeriod === 'all'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            सम्पूर्ण
          </button>
          <button
            onClick={() => onChangeFocusedPeriod('ancient')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              focusedPeriod === 'ancient'
                ? 'bg-teal-600 text-white'
                : 'text-slate-400 hover:text-teal-300'
            }`}
          >
            प्राचीन
          </button>
          <button
            onClick={() => onChangeFocusedPeriod('medieval')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              focusedPeriod === 'medieval'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            मध्यकालीन
          </button>
          <button
            onClick={() => onChangeFocusedPeriod('modern')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              focusedPeriod === 'modern'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            आधुनिक
          </button>
        </div>

        {/* 3D / 2D View Mode Toggle */}
        <button
          onClick={onToggleViewMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          title={viewMode === '3d' ? '2D ट्री व्यू में बदलें' : '3D यूनिवर्स में बदलें'}
        >
          {viewMode === '3d' ? (
            <>
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>2D व्यू</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>3D व्यू</span>
            </>
          )}
        </button>

        {/* Exam Revision Flashcards Button */}
        <button
          onClick={onOpenExamModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
          title="परीक्षा वन-लाइनर एवं क्विक रिकॉल कार्ड"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">परीक्षा मोड</span>
        </button>

        {/* Original PDF Reference Modal */}
        <button
          onClick={onOpenPDFModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          title="मूल PDF पूर्वावलोकन देखें"
        >
          <FileText className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden lg:inline">मूल PDF</span>
        </button>

        {/* Bookmarks Toggle */}
        <button
          onClick={onToggleBookmarkFilter}
          className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
            isBookmarkFilterActive
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="बुकमार्क किए गए विषय"
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
          {bookmarkedCount > 0 && <span className="text-[11px] font-mono">{bookmarkedCount}</span>}
        </button>
      </div>
    </header>
  );
};
