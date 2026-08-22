import { 
  Building2, 
  Flame, 
  AlertTriangle, 
  FileWarning, 
  UserCheck 
} from 'lucide-react';

export default function MetricsBar({ stats, isLoading }) {
  const metrics = [
    {
      id: 'affected',
      label: 'Monitored Assets',
      value: stats?.affected_assets ?? 0,
      subtext: 'In database registry',
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-950/30 border-blue-500/30',
      glow: 'hover:border-blue-500/60'
    },
    {
      id: 'critical',
      label: 'Critical Priority',
      value: stats?.critical ?? 0,
      subtext: 'Immediate dispatch required',
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-950/30 border-rose-500/40',
      glow: 'hover:border-rose-500/70'
    },
    {
      id: 'high',
      label: 'High Priority',
      value: stats?.high_priority ?? 0,
      subtext: 'Urgent relief needed',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-950/25 border-amber-500/30',
      glow: 'hover:border-amber-500/60'
    },
    {
      id: 'claims',
      label: 'Claims Flagged',
      value: stats?.claims_flagged ?? 0,
      subtext: 'High fraud/discrepancy risk',
      icon: FileWarning,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30 border-purple-500/30',
      glow: 'hover:border-purple-500/60'
    },
    {
      id: 'reviews',
      label: 'Human Review Pending',
      value: stats?.human_reviews ?? 0,
      subtext: 'HITL action requested',
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30 border-emerald-500/30',
      glow: 'hover:border-emerald-500/60'
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div 
            key={m.id} 
            className={`rounded-2xl border ${m.bg} p-4 transition-all duration-300 ${m.glow} shadow-lg shadow-black/20 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {m.label}
              </span>
              <div className={`rounded-xl p-2 bg-slate-950/60 ${m.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            
            <div className="mt-3">
              <p className={`text-2xl md:text-3xl font-black tracking-tight ${m.color}`}>
                {isLoading ? (
                  <span className="inline-block h-8 w-12 rounded-lg bg-slate-800 animate-pulse"></span>
                ) : (
                  m.value
                )}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400 truncate">
                {m.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
