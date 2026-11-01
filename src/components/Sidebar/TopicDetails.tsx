import React from 'react';
import { HistoryNode } from '../../data/historyData';
import {
  X,
  BookOpen,
  Calendar,
  MapPin,
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  Bookmark,
  Share2,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface TopicDetailsProps {
  node: HistoryNode | null;
  onClose: () => void;
  onSelectNode: (node: HistoryNode) => void;
  studyStatus?: 'important' | 'pending' | 'mastered' | 'frequent';
  onUpdateStudyStatus: (nodeId: string, status: 'important' | 'pending' | 'mastered' | 'frequent') => void;
  isBookmarked: boolean;
  onToggleBookmark: (nodeId: string) => void;
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({
  node,
  onClose,
  onSelectNode,
  studyStatus = 'pending',
  onUpdateStudyStatus,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!node) return null;

  const getCategoryBadge = () => {
    switch (node.period) {
      case 'ancient':
        return { label: 'प्राचीन भारत', bg: 'bg-teal-950/70 text-teal-300 border-teal-700/60' };
      case 'medieval':
        return { label: 'मध्यकालीन भारत', bg: 'bg-blue-950/70 text-blue-300 border-blue-700/60' };
      case 'modern':
        return { label: 'आधुनिक भारत', bg: 'bg-amber-950/70 text-amber-300 border-amber-700/60' };
      default:
        return { label: 'मूल केंद्र', bg: 'bg-sky-950/70 text-sky-300 border-sky-700/60' };
    }
  };

  const category = getCategoryBadge();

  return (
    <aside className="w-full md:w-96 lg:w-[420px] h-full bg-[#0b101e]/95 border-l border-slate-800 backdrop-blur-md flex flex-col z-30 shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/60">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${category.bg}`}>
              {category.label}
            </span>
            {node.sourcePages && node.sourcePages.length > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>मूल PDF पृष्ठ {node.sourcePages.join(', ')}</span>
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-100 leading-snug">{node.title}</h2>
          {node.subtitle && (
            <div className="text-xs text-slate-400 mt-0.5">{node.subtitle}</div>
          )}
          {node.dates && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400 mt-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{node.dates}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleBookmark(node.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isBookmarked ? 'बुकमार्क हटाया गया' : 'बुकमार्क करें'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Study Status Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">अध्ययन स्थिति:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateStudyStatus(node.id, 'important')}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              studyStatus === 'important'
                ? 'bg-red-950/80 border-red-500 text-red-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            महत्वपूर्ण
          </button>
          <button
            onClick={() => onUpdateStudyStatus(node.id, 'pending')}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              studyStatus === 'pending'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            पढ़ना बाकी
          </button>
          <button
            onClick={() => onUpdateStudyStatus(node.id, 'mastered')}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              studyStatus === 'mastered'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            पढ़ लिया ✓
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-200 text-sm">
        {/* Description Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>विषय परिचय एवं पृष्ठभूमि</span>
          </h3>
          <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
            {node.description}
          </p>
        </div>

        {/* Key Points */}
        {node.keyPoints && node.keyPoints.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>मुख्य बिंदु (PDF अनुसार)</span>
            </h3>
            <ul className="space-y-2">
              {node.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-2 rounded-md bg-slate-900/40 border border-slate-800/60 text-xs leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <span className="text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Archaeological Sites */}
        {node.sites && node.sites.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>प्रमुख ऐतिहासिक एवं पुरातात्विक स्थल</span>
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {node.sites.map((site, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1.5 rounded bg-emerald-950/20 border border-emerald-900/50 text-emerald-200 text-xs flex items-center gap-2"
                >
                  <span className="text-emerald-400">❖</span>
                  <span>{site}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discoverers */}
        {node.discoverers && node.discoverers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>खोजकर्ता एवं उत्खननकर्ता</span>
            </h3>
            <div className="space-y-1.5">
              {node.discoverers.map((disc, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-purple-950/20 border border-purple-900/50 text-purple-200 text-xs font-medium"
                >
                  {disc}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam One-Liners (परीक्षापयोगी तथ्य) */}
        {node.examFacts && node.examFacts.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>परीक्षापयोगी वन-लाइनर (Exam One-Liners)</span>
            </h3>
            <div className="space-y-2">
              {node.examFacts.map((fact, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs leading-relaxed flex items-start gap-2 shadow-sm"
                >
                  <span className="text-amber-400 font-bold shrink-0">★</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-branches / Child Nodes Navigation */}
        {node.children && node.children.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              संबंधित उप-शाखाएं ({node.children.length})
            </h3>
            <div className="space-y-1.5">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onSelectNode(child)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center justify-between transition-colors group"
                >
                  <span className="font-medium group-hover:text-sky-400 transition-colors">
                    {child.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer info reference */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>स्रोत: भारतीय इतिहास हस्तलिखित माइंड मैप PDF</span>
        <span className="text-slate-500 font-mono">GS World Notes</span>
      </div>
    </aside>
  );
};
