import React, { useState, useRef, useEffect } from 'react';
import { HistoryNode } from '../../data/historyData';
import { ChevronRight, ChevronDown, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

interface MindMap2DCanvasProps {
  data: HistoryNode;
  selectedNodeId: string;
  expandedNodeIds: Set<string>;
  onSelectNode: (node: HistoryNode) => void;
  onToggleExpand: (nodeId: string) => void;
  focusedPeriodFilter?: 'all' | 'ancient' | 'medieval' | 'modern';
  searchHighlightedId?: string | null;
}

export const MindMap2DCanvas: React.FC<MindMap2DCanvasProps> = ({
  data,
  selectedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
  focusedPeriodFilter = 'all',
  searchHighlightedId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Recursive renderer for 2D tree hierarchy
  const renderTreeNode = (node: HistoryNode, depth: number = 0): React.ReactNode => {
    // Check filter at level 1
    if (depth === 1 && focusedPeriodFilter !== 'all' && node.period !== focusedPeriodFilter) {
      return null;
    }

    const isExpanded = expandedNodeIds.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isSearchMatch = searchHighlightedId === node.id;
    const hasChildren = Boolean(node.children && node.children.length > 0);

    const getBorderColor = () => {
      if (isSelected) return 'border-sky-400 bg-sky-950/40 text-sky-100 ring-2 ring-sky-400';
      if (isSearchMatch) return 'border-amber-400 bg-amber-950/40 text-amber-100 ring-2 ring-amber-400 animate-pulse';
      if (node.period === 'ancient') return 'border-teal-700/60 bg-teal-950/20 text-teal-100 hover:border-teal-500';
      if (node.period === 'medieval') return 'border-blue-700/60 bg-blue-950/20 text-blue-100 hover:border-blue-500';
      if (node.period === 'modern') return 'border-amber-700/60 bg-amber-950/20 text-amber-100 hover:border-amber-500';
      return 'border-slate-700 bg-slate-900/40 text-slate-100 hover:border-slate-500';
    };

    return (
      <div key={node.id} className="relative flex flex-col pl-6 my-1.5 transition-all">
        {/* Node Box */}
        <div className="flex items-center gap-2 group">
          {/* Connecting Branch Marker */}
          {depth > 0 && (
            <div className="absolute -left-3 top-4 w-5 h-0.5 bg-slate-700 group-hover:bg-sky-500 transition-colors" />
          )}

          {/* Node Button Card */}
          <div
            onClick={() => onSelectNode(node)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-150 shadow-sm ${getBorderColor()}`}
          >
            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(node.id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title={isExpanded ? 'शाखाएं समेटें' : 'शाखाएं खोलें'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-600 ml-1.5 mr-0.5" />
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{node.title}</span>
                {node.sourcePages && node.sourcePages.length > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800/80 text-amber-300 font-mono">
                    पृष्ठ {node.sourcePages.join(', ')}
                  </span>
                )}
              </div>
              {node.dates && (
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">{node.dates}</span>
              )}
            </div>

            {node.examFacts && node.examFacts.length > 0 && (
              <span className="ml-2 flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{node.examFacts.length} तथ्य</span>
              </span>
            )}
          </div>
        </div>

        {/* Children Sub-branches */}
        {hasChildren && isExpanded && (
          <div className="relative border-l-2 border-slate-700/60 ml-3.5 pl-2 pt-1 transition-all">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-[#080c16] p-6 md:p-8"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div className="max-w-5xl mx-auto pb-24">
        {/* Instruction Header */}
        <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              <span>भारतीय इतिहास – 2D श्रेणीबद्ध ज्ञान मानचित्र</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              प्रत्येक नोड पर क्लिक करके विस्तृत परीक्षा तथ्य देखें एवं शाखाएं (+ / −) खोलें/समेटें।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200"
            >
              + ज़ूम
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200"
            >
              100%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200"
            >
              − ज़ूम
            </button>
          </div>
        </div>

        {/* Root Mind Map Tree */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 md:p-6 shadow-xl">
          {renderTreeNode(data, 0)}
        </div>
      </div>
    </div>
  );
};
