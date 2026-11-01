import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  UnfoldHorizontal,
  FoldHorizontal,
  Compass,
  Layers,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface MindMapControlsProps {
  viewMode: '3d' | '2d';
  onToggleViewMode: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onResetCamera?: () => void;
  focusedPeriod: 'all' | 'ancient' | 'medieval' | 'modern';
  onChangeFocusedPeriod: (period: 'all' | 'ancient' | 'medieval' | 'modern') => void;
  onOpenExamMode: () => void;
}

export const MindMapControls: React.FC<MindMapControlsProps> = ({
  viewMode,
  onToggleViewMode,
  onExpandAll,
  onCollapseAll,
  onResetCamera,
  focusedPeriod,
  onChangeFocusedPeriod,
  onOpenExamMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-[min(940px,94vw)] flex flex-col items-center pointer-events-none select-none">
      {/* Collapse / Expand Tab Trigger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white rounded-t-lg border-t border-x border-slate-700/80 shadow-md flex items-center gap-1.5 transition-transform"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
            <span>नियंत्रण दिखाएं</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>छुपाएं</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 p-2 bg-[#0b101e]/90 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md">
          {/* View Mode */}
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            title={viewMode === '3d' ? '2D ट्री दृश्य' : '3D अंतरिक्ष दृश्य'}
          >
            {viewMode === '3d' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>2D ट्री</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>3D ब्रह्मांड</span>
              </>
            )}
          </button>

          {/* Reset Camera (3D mode) */}
          {viewMode === '3d' && onResetCamera && (
            <button
              onClick={onResetCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              title="कैमरा डिफ़ॉल्ट स्थिति में लाएं"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>कैमरा रीसेट</span>
            </button>
          )}

          {/* Expand All */}
          <button
            onClick={onExpandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            title="सभी शाखाएं खोलें"
          >
            <UnfoldHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <span>सब खोलें</span>
          </button>

          {/* Collapse All */}
          <button
            onClick={onCollapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            title="मुख्य कालों तक समेटें"
          >
            <FoldHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>समेटें</span>
          </button>

          <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
            {(['all', 'ancient', 'medieval', 'modern'] as const).map((p) => {
              const label =
                p === 'all'
                  ? 'सभी काल'
                  : p === 'ancient'
                  ? 'प्राचीन'
                  : p === 'medieval'
                  ? 'मध्य'
                  : 'आधुनिक';
              return (
                <button
                  key={p}
                  onClick={() => onChangeFocusedPeriod(p)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    focusedPeriod === p
                      ? p === 'ancient'
                        ? 'bg-teal-600 text-white font-semibold'
                        : p === 'medieval'
                        ? 'bg-blue-600 text-white font-semibold'
                        : p === 'modern'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-sky-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

          {/* Exam Mode Quick Trigger */}
          <button
            onClick={onOpenExamMode}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-semibold transition-colors"
            title="क्विक रिकॉल कार्ड्स"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>परीक्षा कार्ड्स</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            title={isFullscreen ? 'पूर्ण स्क्रीन से बाहर निकलें' : 'पूर्ण स्क्रीन मोड'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
