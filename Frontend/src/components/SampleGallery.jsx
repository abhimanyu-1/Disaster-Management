import { CheckCircle, Sparkles } from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

export default function SampleGallery({ selectedId, onSelectSample }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-400" />
          <span>Disaster Sample Imagery</span>
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          {SAMPLE_DATASETS.length} datasets
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SAMPLE_DATASETS.map((sample) => {
          const isSelected = selectedId === sample.id;
          return (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer bg-slate-950/80 p-2 flex flex-col justify-between text-left ${
                isSelected
                  ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-950/50'
                  : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
              }`}
            >
              {/* Thumbnail with overlay */}
              <div className="relative h-20 w-full rounded-lg overflow-hidden bg-slate-900 mb-2">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  onError={(e) => {
                    if (sample.fallbackUrl && e.target.src !== sample.fallbackUrl) {
                      e.target.src = sample.fallbackUrl;
                    }
                  }}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${sample.badgeColor}`}>
                  {sample.category}
                </span>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-orange-600 rounded-full p-0.5 text-white shadow">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-orange-400 transition">
                  {sample.title}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {sample.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
