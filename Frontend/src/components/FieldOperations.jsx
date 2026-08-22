import { useState } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  WifiOff, 
  RefreshCw, 
  PlusCircle, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { PRECONFIGURED_SCENARIOS } from '../data/sampleDatasets';

export default function FieldOperations({ 
  offlineQueue, 
  isOfflineMode, 
  onAddOfflineRecord, 
  onSyncOfflineQueue,
  onInspectInRecon 
}) {
  const [selectedReport, setSelectedReport] = useState(PRECONFIGURED_SCENARIOS[0]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newReport, setNewReport] = useState({
    asset_id: 'FIELD-INSP-901',
    responder_name: 'Lt. Jennifer Clark (Rescue Unit 4)',
    lat: 19.4340,
    lon: -99.1350,
    structural_integrity: 'MAJOR STRUCTURAL COMPROMISE',
    notes: 'Ground reconnaissance verified severe cracking in main pillar.'
  });

  const handleCreateReport = (e) => {
    e.preventDefault();
    const record = {
      id: `field_${Date.now()}`,
      code: `#F-${Math.floor(1000 + Math.random() * 9000)}`,
      label: `FIELD LOG: ${newReport.asset_id}`,
      asset_id: newReport.asset_id,
      responder_name: newReport.responder_name,
      lat: parseFloat(newReport.lat),
      lon: parseFloat(newReport.lon),
      gps_accuracy: '±1.1m',
      structural_integrity: newReport.structural_integrity,
      field_report: newReport.notes,
      postImage: '/samples/mexico_post.jpg',
      preImage: '/samples/mexico_pre.jpg',
      sync_status: isOfflineMode ? 'PENDING_OFFLINE' : 'SYNCED',
      timestamp: new Date().toLocaleTimeString(),
      ground_truth_severity: 'HIGH'
    };

    onAddOfflineRecord(record);
    setShowSubmitModal(false);
  };

  const allReports = [...(offlineQueue || []), ...PRECONFIGURED_SCENARIOS];

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Header & Offline Buffer Status Strip */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Field Responder Operations & Evidence Log
            </h2>
            <p className="text-[11px] text-slate-400">
              On-ground responder reports, structural integrity audits & local offline buffer sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOfflineMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold animate-pulse">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline Resilience Active</span>
            </div>
          )}

          {offlineQueue?.length > 0 && (
            <button
              onClick={onSyncOfflineQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition shadow cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync {offlineQueue.length} Pending Records</span>
            </button>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-orange-400" />
            <span>Submit Field Report</span>
          </button>
        </div>
      </div>

      {/* Main Field Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Field Reports Table (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              Ground Reconnaissance Reports ({allReports.length})
            </span>
            <span className="text-[10px] text-slate-500">Live Field Log</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {allReports.map((report) => {
              const isSelected = selectedReport.asset_id === report.asset_id;
              const isPending = report.sync_status === 'PENDING_OFFLINE';

              return (
                <div
                  key={report.id || report.asset_id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-orange-500 bg-slate-900/90 ring-1 ring-orange-500/50 shadow-lg'
                      : 'border-slate-800/80 bg-[#080D18]/70 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{report.asset_id}</span>
                        {isPending ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 border border-amber-500/60 text-amber-400 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> Pending Sync
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Synced
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{report.responder_name}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-orange-400">
                      {report.structural_integrity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-[#080D18] p-2 rounded border border-slate-800/60">
                    {report.field_report}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {report.lat.toFixed(4)}°N, {report.lon.toFixed(4)}°W ({report.gps_accuracy})
                    </span>
                    <span>Verified by Ground USAR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Field Report Detail & Photos (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase">Field Dossier</span>
                <h3 className="text-sm font-bold text-white">{selectedReport.asset_id}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/50 text-blue-300 text-[10px] font-bold">
                {selectedReport.code}
              </span>
            </div>

            {/* Field Ground Truth Photo */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Ground Evidence Capture</span>
              <div className="relative h-44 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={selectedReport.postImage}
                  alt="Ground Evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#080D18]/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] text-slate-200">
                  GPS: {selectedReport.lat.toFixed(4)}, {selectedReport.lon.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="space-y-2 text-[11px]">
              <div className="bg-[#080D18] p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lead Responder:</span>
                  <span className="text-slate-200 font-bold">{selectedReport.responder_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Accuracy:</span>
                  <span className="text-emerald-400 font-bold">{selectedReport.gps_accuracy} (RTK Fix)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Structural Status:</span>
                  <span className="text-rose-400 font-bold">{selectedReport.structural_integrity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Database Sync:</span>
                  <span className="text-white font-bold">{selectedReport.sync_status}</span>
                </div>
              </div>

              {/* Complete Ground Narrative */}
              <div className="bg-[#080D18] p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase block">Field Inspector Notes:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedReport.field_report}
                </p>
              </div>
            </div>
          </div>

          {/* Action to Cross-Reference in Optical Recon */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => onInspectInRecon && onInspectInRecon(selectedReport)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 py-2.5 text-xs font-bold text-white transition shadow cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Cross-Reference Satellite Feeds in Optical Recon</span>
            </button>
          </div>

        </div>

      </div>

      {/* Submit New Field Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-700 bg-[#0E1626] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">Submit Ground Field Report</h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Asset ID</label>
                <input
                  type="text"
                  required
                  value={newReport.asset_id}
                  onChange={(e) => setNewReport({ ...newReport, asset_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Responder Officer</label>
                <input
                  type="text"
                  required
                  value={newReport.responder_name}
                  onChange={(e) => setNewReport({ ...newReport, responder_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newReport.lat}
                    onChange={(e) => setNewReport({ ...newReport, lat: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newReport.lon}
                    onChange={(e) => setNewReport({ ...newReport, lon: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Structural Verdict</label>
                <select
                  value={newReport.structural_integrity}
                  onChange={(e) => setNewReport({ ...newReport, structural_integrity: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-3 py-1.5 text-xs text-white"
                >
                  <option value="TOTAL COLLAPSE / CONDEMNED">TOTAL COLLAPSE / CONDEMNED</option>
                  <option value="MAJOR STRUCTURAL COMPROMISE">MAJOR STRUCTURAL COMPROMISE</option>
                  <option value="WATER INUNDATED / EVACUATED">WATER INUNDATED / EVACUATED</option>
                  <option value="MINOR REPAIRABLE DAMAGE">MINOR REPAIRABLE DAMAGE</option>
                  <option value="SOUND / NO DAMAGE">SOUND / NO DAMAGE</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Field Narrative</label>
                <textarea
                  rows={3}
                  required
                  value={newReport.notes}
                  onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#080D18] px-3 py-1.5 text-xs text-white resize-none"
                  placeholder="Enter detailed ground assessment..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  {isOfflineMode ? 'Queue Offline' : 'Submit & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
