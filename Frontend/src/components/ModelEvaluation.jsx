import { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Cpu,
  Info
} from 'lucide-react';
import { MODEL_EVALUATION_METRICS } from '../data/sampleDatasets';

export default function ModelEvaluation() {
  const [selectedCell, setSelectedCell] = useState(null);
  const metrics = MODEL_EVALUATION_METRICS;

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Prominent Data Isolation Banner */}
      <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-4 shadow-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase text-xs">
              Evaluation & Benchmark Mode: Ground-Truth Validation Data
            </span>
            <span className="px-2 py-0.2 rounded bg-blue-900/60 border border-blue-400/40 text-blue-200 text-[10px]">
              N=250 Annotated Dataset
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            This module displays authoritatively labeled evaluation benchmark results (precision, recall, confusion matrix, calibration) calculated against the Maxar/xView2 ground-truth test suite. This evaluation environment is strictly separated from operational field feeds.
          </p>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Precision</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {(metrics.overall_metrics.precision * 100).toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Low False Positives</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Recall</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {(metrics.overall_metrics.recall * 100).toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Damage Capture Rate</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">F1-Score</span>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {(metrics.overall_metrics.f1_score * 100).toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Harmonic Mean</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">mAP @ 0.50</span>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {(metrics.overall_metrics.mAP_50 * 100).toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Spatial Localization</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Accuracy</span>
          <p className="text-2xl font-bold text-white mt-1">
            {(metrics.overall_metrics.accuracy * 100).toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Overall Classes</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Latency</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {metrics.overall_metrics.avg_latency_ms}ms
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Multi-Agent Chain</p>
        </div>
      </div>

      {/* Main Analysis Grid (Confusion Matrix + Calibration & Latency) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Multi-Class Confusion Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white uppercase text-xs">
                Multi-Class Confusion Matrix (Predicted vs Actual)
              </h3>
              <p className="text-[10px] text-slate-400">
                Click any cell to inspect true positives, false positives and cross-class leakages
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">N=250 Test Instances</span>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[10px] text-slate-500 uppercase">Actual \ Pred</th>
                  {metrics.confusion_matrix.classes.map((cls, idx) => (
                    <th key={idx} className="p-2 text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">
                      {cls}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusion_matrix.matrix.map((row, rowIdx) => {
                  const actualClass = metrics.confusion_matrix.classes[rowIdx];
                  return (
                    <tr key={rowIdx} className="border-t border-slate-800/60">
                      <td className="p-2 text-left font-bold text-slate-300 text-[10px] whitespace-nowrap">
                        {actualClass}
                      </td>
                      {row.map((val, colIdx) => {
                        const isDiagonal = rowIdx === colIdx;
                        const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;

                        return (
                          <td 
                            key={colIdx}
                            onClick={() => setSelectedCell({
                              row: rowIdx,
                              col: colIdx,
                              actual: actualClass,
                              pred: metrics.confusion_matrix.classes[colIdx],
                              count: val
                            })}
                            className={`p-2 transition cursor-pointer font-bold ${
                              isSelected ? 'ring-2 ring-orange-500 scale-110 z-10' : ''
                            } ${
                              isDiagonal
                                ? val > 30 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-950/40 text-emerald-400'
                                : val > 0 ? 'bg-rose-950/50 text-rose-300' : 'bg-[#080D18]/50 text-slate-600'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cell Inspector Drawer */}
          {selectedCell && (
            <div className="p-3 rounded-lg bg-[#080D18] border border-slate-800 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-slate-400">Selected Cell: </span>
                <span className="text-white font-bold">Actual [{selectedCell.actual}] → Predicted [{selectedCell.pred}]</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {selectedCell.row === selectedCell.col 
                    ? `✓ Correctly Classified: ${selectedCell.count} instances` 
                    : `⚠️ Classification Discrepancy: ${selectedCell.count} instances`}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* False Positive & Negative Insights */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
            <div className="p-2.5 rounded bg-[#080D18] border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold uppercase block">Known False Positive Drivers:</span>
              <p className="text-slate-400 leading-relaxed">
                Roof solar reflections & deep triangular building shadows at low sun angles (resolved via baseline subtraction).
              </p>
            </div>
            <div className="p-2.5 rounded bg-[#080D18] border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold uppercase block">Known False Negative Drivers:</span>
              <p className="text-slate-400 leading-relaxed">
                Internal ground-floor damage obscured by intact roof shells during low-angle flood water inundation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Confidence Calibration & Latency Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-4">
          
          {/* Confidence Calibration Curve (Reliability Diagram) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white uppercase text-xs">
                Confidence Calibration Curve
              </h3>
              <span className="text-[10px] text-slate-500">ECE: 0.024 (Well Calibrated)</span>
            </div>

            <div className="space-y-2">
              {metrics.calibration_curve.map((bin, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">Bin {bin.bin}</span>
                    <span className="text-slate-300 font-bold">
                      Conf: {(bin.confidence * 100).toFixed(0)}% vs Acc: {(bin.accuracy * 100).toFixed(0)}% ({bin.count} items)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div 
                      className="bg-blue-500 h-full rounded-l-full" 
                      style={{ width: `${bin.confidence * 100}%` }}
                    />
                    <div 
                      className="bg-emerald-500 h-full opacity-80" 
                      style={{ width: `${Math.abs(bin.accuracy - bin.confidence) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latency Breakdown Bar Chart */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase text-xs">
                Multi-Agent Latency Profile
              </h3>
              <span className="text-[10px] text-orange-400 font-bold">
                {metrics.latency_breakdown.total_pipeline_ms}ms Total
              </span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">1. Image Tiling & Preprocessing:</span>
                <span className="text-slate-200 font-bold">{metrics.latency_breakdown.tiling_preprocessing_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">2. Gemini/Vision Model Inference:</span>
                <span className="text-orange-400 font-bold">{metrics.latency_breakdown.vision_inference_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">3. GIS Criticality & Geo Spatial:</span>
                <span className="text-slate-200 font-bold">{metrics.latency_breakdown.geospatial_gis_lookup_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">4. Fraud & Claim Consistency Agent:</span>
                <span className="text-purple-400 font-bold">{metrics.latency_breakdown.claim_consistency_engine_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">5. Priority Triage & Decision:</span>
                <span className="text-slate-200 font-bold">{metrics.latency_breakdown.priority_triage_ms}ms</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
