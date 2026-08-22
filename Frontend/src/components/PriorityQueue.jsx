import { useState } from 'react';
import { 
  ListOrdered, 
  Search, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';

export default function PriorityQueue({ 
  queue = [], 
  onSelectAssessment, 
  selectedAssessmentId, 
  isLoading 
}) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQueue = (queue || []).filter(item => {
    const matchesPriority = filter === 'ALL' || item.priority === filter;
    const matchesSearch = 
      (item.asset_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assessment_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-300 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <aside className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700/70 bg-slate-950/50 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Relief Priority Queue
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-900 text-orange-400 border border-slate-800 px-2 py-0.5 rounded">
          {queue.length} Active
        </span>
      </div>

      <div className="p-3.5 space-y-3 flex-1 flex flex-col overflow-hidden">
        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Asset or Assessment ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition whitespace-nowrap ${
                  filter === lvl 
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-slate-900/60 animate-pulse" />
              ))}
            </div>
          ) : filteredQueue.length > 0 ? (
            filteredQueue.map((item, index) => {
              const isSelected = selectedAssessmentId === item.assessment_id;
              return (
                <div
                  key={item.assessment_id || index}
                  onClick={() => onSelectAssessment && onSelectAssessment(item.assessment_id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected 
                      ? 'bg-slate-900 border-orange-500/80 shadow-lg shadow-orange-950/30' 
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-mono font-bold text-slate-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {item.asset_id}
                        </p>
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">
                        {item.assessment_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Score: {typeof item.score === 'number' ? item.score.toFixed(2) : item.score}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500">
              <AlertCircle className="h-6 w-6 mx-auto mb-1 text-slate-600" />
              <p className="text-xs font-medium">No queue items match filter</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
