/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  INDIAN_HISTORY_DATA,
  HistoryNode,
  findNodeById,
  findParentPath,
} from './data/historyData';
import { MindMap3DCanvas } from './components/MindMap3D/MindMap3DCanvas';
import { MindMap2DCanvas } from './components/MindMap2D/MindMap2DCanvas';
import { TopicDetails } from './components/Sidebar/TopicDetails';
import { Header } from './components/Layout/Header';
import { MindMapControls } from './components/MindMap/MindMapControls';
import { ExamRevisionModal } from './components/Exam/ExamRevisionModal';
import { PDFPreviewModal } from './components/PDF/PDFPreviewModal';

export default function App() {
  // Primary default view: 3D Knowledge Universe (confirmed by user)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Currently selected node for deep study in right sidebar
  // Default to Chapter 1 Prehistory (प्रागैतिहासिक काल)
  const [selectedNode, setSelectedNode] = useState<HistoryNode | null>(() => {
    return findNodeById('prehistory') || INDIAN_HISTORY_DATA;
  });

  // Set of expanded nodes (default expanded to showcase Chapter 1 sample hierarchy)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => {
    return new Set(['bharatiya-itihas', 'ancient-india', 'prehistory', 'chalcolithic']);
  });

  // Focused period filter
  const [focusedPeriod, setFocusedPeriod] = useState<'all' | 'ancient' | 'medieval' | 'modern'>('all');

  // Search match highlighting
  const [searchHighlightedId, setSearchHighlightedId] = useState<string | null>(null);

  // Bookmarks & Study Status persisted in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('bharat_itihas_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set(['prehistory', 'paleolithic', 'chalcolithic']);
    } catch {
      return new Set(['prehistory', 'paleolithic', 'chalcolithic']);
    }
  });

  const [studyStatuses, setStudyStatuses] = useState<Record<string, 'important' | 'pending' | 'mastered' | 'frequent'>>(() => {
    try {
      const saved = localStorage.getItem('bharat_itihas_study_status');
      return saved ? JSON.parse(saved) : { prehistory: 'important', paleolithic: 'mastered', chalcolithic: 'pending' };
    } catch {
      return { prehistory: 'important', paleolithic: 'mastered', chalcolithic: 'pending' };
    }
  });

  // Filter bookmarked only
  const [isBookmarkFilterActive, setIsBookmarkFilterActive] = useState(false);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [pdfInitialPage, setPdfInitialPage] = useState<number>(1);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharat_itihas_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
    } catch {}
  }, [bookmarkedIds]);

  // Sync study status to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharat_itihas_study_status', JSON.stringify(studyStatuses));
    } catch {}
  }, [studyStatuses]);

  // Toggle node expansion
  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Select node handler
  const handleSelectNode = useCallback((node: HistoryNode) => {
    setSelectedNode(node);
    setSearchHighlightedId(node.id);

    // Auto-expand all ancestors so the selected node is visible in the graph
    const parentIds = findParentPath(node.id);
    if (parentIds && parentIds.length > 0) {
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        parentIds.forEach((pid) => next.add(pid));
        return next;
      });
    }

    // Update initial PDF page for preview
    if (node.sourcePages && node.sourcePages.length > 0) {
      setPdfInitialPage(node.sourcePages[0]);
    }
  }, []);

  // Expand All nodes
  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    function collect(n: HistoryNode) {
      allIds.add(n.id);
      if (n.children) n.children.forEach(collect);
    }
    collect(INDIAN_HISTORY_DATA);
    setExpandedNodeIds(allIds);
  }, []);

  // Collapse All to top-level Eras
  const handleCollapseAll = useCallback(() => {
    setExpandedNodeIds(new Set(['bharatiya-itihas']));
  }, []);

  // Bookmark Toggle
  const handleToggleBookmark = useCallback((nodeId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Study Status update
  const handleUpdateStudyStatus = useCallback((nodeId: string, status: 'important' | 'pending' | 'mastered' | 'frequent') => {
    setStudyStatuses((prev) => ({
      ...prev,
      [nodeId]: status,
    }));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c16] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        rootNode={INDIAN_HISTORY_DATA}
        onSelectNode={handleSelectNode}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
        onOpenExamModal={() => setIsExamModalOpen(true)}
        onOpenPDFModal={() => setIsPDFModalOpen(true)}
        bookmarkedCount={bookmarkedIds.size}
        onToggleBookmarkFilter={() => setIsBookmarkFilterActive(!isBookmarkFilterActive)}
        isBookmarkFilterActive={isBookmarkFilterActive}
        focusedPeriod={focusedPeriod}
        onChangeFocusedPeriod={setFocusedPeriod}
      />

      {/* Main Workspace Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left / Center Viewport Canvas (3D or 2D) */}
        <main className="relative flex-1 h-full w-full overflow-hidden">
          {viewMode === '3d' ? (
            <MindMap3DCanvas
              data={INDIAN_HISTORY_DATA}
              selectedNodeId={selectedNode?.id || ''}
              expandedNodeIds={expandedNodeIds}
              onSelectNode={handleSelectNode}
              onToggleExpand={handleToggleExpand}
              focusedPeriodFilter={focusedPeriod}
              searchHighlightedId={searchHighlightedId}
            />
          ) : (
            <MindMap2DCanvas
              data={INDIAN_HISTORY_DATA}
              selectedNodeId={selectedNode?.id || ''}
              expandedNodeIds={expandedNodeIds}
              onSelectNode={handleSelectNode}
              onToggleExpand={handleToggleExpand}
              focusedPeriodFilter={focusedPeriod}
              searchHighlightedId={searchHighlightedId}
            />
          )}

          {/* Floating Collapsible Bottom Control Dock */}
          <MindMapControls
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            focusedPeriod={focusedPeriod}
            onChangeFocusedPeriod={setFocusedPeriod}
            onOpenExamMode={() => setIsExamModalOpen(true)}
          />
        </main>

        {/* Right Topic Details Sidebar */}
        {selectedNode && (
          <TopicDetails
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onSelectNode={handleSelectNode}
            studyStatus={studyStatuses[selectedNode.id] || 'pending'}
            onUpdateStudyStatus={handleUpdateStudyStatus}
            isBookmarked={bookmarkedIds.has(selectedNode.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </div>

      {/* Exam Flashcards Modal */}
      <ExamRevisionModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
      />

      {/* PDF Reference Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        initialPage={pdfInitialPage}
      />
    </div>
  );
}
