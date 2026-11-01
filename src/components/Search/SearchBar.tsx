import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronRight, FileText } from 'lucide-react';
import { HistoryNode, searchHistoryNodes } from '../../data/historyData';

interface SearchBarProps {
  onSelectNode: (node: HistoryNode) => void;
  rootNode: HistoryNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectNode, rootNode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HistoryNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const matches = searchHistoryNodes(query, rootNode);
    setResults(matches);
    setIsOpen(true);
  }, [query, rootNode]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="इतिहास विषय खोजें (उदा. भीमबेटका, लहुरादेव, अशोक, प्लासी)..."
          className="w-full pl-9 pr-8 py-1.5 bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus:border-sky-500 rounded-lg text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 divide-y divide-slate-800">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-950/60 flex items-center justify-between">
            <span>मिलते-जुलते विषय ({results.length})</span>
            <span className="text-slate-500">चयन हेतु क्लिक करें</span>
          </div>
          {results.map((res) => (
            <div
              key={res.id}
              onClick={() => {
                onSelectNode(res);
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {res.title}
                  </span>
                  {res.sourcePages && res.sourcePages.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 font-mono border border-amber-800/40">
                      p.{res.sourcePages[0]}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {res.description}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-400 text-center">
          कोई परिणाम नहीं मिला। कृपया अन्य ऐतिहासिक शब्द खोजें।
        </div>
      )}
    </div>
  );
};
