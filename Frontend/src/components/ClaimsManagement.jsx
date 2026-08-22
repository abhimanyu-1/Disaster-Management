import { useState } from 'react';
import { 
  DollarSign, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ShieldAlert,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { PRECONFIGURED_SCENARIOS } from '../data/sampleDatasets';

export default function ClaimsManagement({ onInspectInRecon }) {
  const [claimsList, setClaimsList] = useState(
    PRECONFIGURED_SCENARIOS.map(s => ({
      ...s,
      discrepancy_pct: Math.round(((s.claim_amount - s.estimated_damage) / (s.claim_amount || 1)) * 100),
    }))
  );
  const [selectedClaim, setSelectedClaim] = useState(claimsList[0]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const totalClaimed = claimsList.reduce((acc, c) => acc + (c.claim_amount || 0), 0);
  const totalEstimated = claimsList.reduce((acc, c) => acc + (c.estimated_damage || 0), 0);
  const highRiskCount = claimsList.filter(c => c.claim_risk === 'HIGH').length;

  const handleUpdateClaimStatus = (claimId, newStatus) => {
    setClaimsList(prev => prev.map(c => c.claim_id === claimId ? { ...c, claim_status: newStatus } : c));
    if (selectedClaim?.claim_id === claimId) {
      setSelectedClaim(prev => ({ ...prev, claim_status: newStatus }));
    }
  };

  const filteredClaims = claimsList.filter(c => {
    const matchRisk = riskFilter === 'ALL' || c.claim_risk === riskFilter;
    const matchStatus = statusFilter === 'ALL' || c.claim_status === statusFilter;
    return matchRisk && matchStatus;
  });

  const exportClaimsCSV = () => {
    const headers = ['Claim_ID', 'Asset_ID', 'Policy_Holder', 'Claim_Amount', 'Estimated_Damage', 'Risk_Tier', 'Status', 'Region'];
    const rows = filteredClaims.map(c => [
      c.claim_id, c.asset_id, `"${c.policy_holder}"`, c.claim_amount, c.estimated_damage, c.claim_risk, c.claim_status, `"${c.region}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `claims_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Top Executive Claims Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Claimed Value</span>
            <p className="text-xl font-bold text-white mt-1">${totalClaimed.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{claimsList.length} Active Dossiers</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">AI Verified Loss</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">${totalEstimated.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Satellite damage estimation</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Variance / Discrepancy</span>
            <p className="text-xl font-bold text-amber-400 mt-1">${(totalClaimed - totalEstimated).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Protected from over-claim</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Flagged Risk Dossiers</span>
            <p className="text-xl font-bold text-rose-400 mt-1">{highRiskCount} High Risk</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Evidence mismatch detected</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-orange-400" /> Filters:
          </span>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk (Fraud Flag)</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk (Consistent)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Claim Statuses</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="FIELD_INSPECTION">Field Inspection</option>
            <option value="AUTO_APPROVED">Approved / Fast-Track</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button
          onClick={exportClaimsCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-orange-400" />
          <span>Export Manifest (CSV)</span>
        </button>
      </div>

      {/* Claims Grid Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Claims Master Table (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              Active Insurance & Relief Claims ({filteredClaims.length})
            </span>
            <span className="text-[10px] text-slate-500">Live Triage Queue</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredClaims.map((claim) => {
              const isSelected = selectedClaim?.claim_id === claim.claim_id;
              const isHighRisk = claim.claim_risk === 'HIGH';

              return (
                <div
                  key={claim.claim_id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-orange-500 bg-slate-900/90 ring-1 ring-orange-500/50 shadow-lg'
                      : 'border-slate-800/80 bg-[#080D18]/70 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{claim.claim_id}</span>
                        <span className="text-slate-400">({claim.asset_id})</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-semibold mt-0.5">{claim.policy_holder}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        isHighRisk 
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60' 
                          : claim.claim_risk === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                      }`}>
                        {claim.claim_risk} RISK
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#080D18] p-2 rounded border border-slate-800/60 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Claimed:</span>
                      <span className="font-bold text-white">${claim.claim_amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">AI Verified:</span>
                      <span className="font-bold text-emerald-400">${claim.estimated_damage.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Status:</span>
                      <span className="font-bold text-orange-400 truncate block">{claim.claim_status}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {claim.claim_desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Claim Triage Details (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl space-y-4 flex flex-col justify-between">
          {selectedClaim ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase">Claim Audit Dossier</span>
                  <h3 className="text-sm font-bold text-white">{selectedClaim.claim_id}</h3>
                  <p className="text-[10px] text-slate-400">{selectedClaim.policy_holder}</p>
                </div>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold">
                  {selectedClaim.claim_status}
                </span>
              </div>

              {/* Satellite Evidence Comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={selectedClaim.preImage} alt="Pre-Disaster" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 px-1.5 py-0.2 rounded text-[8px] text-slate-300">
                    Pre-Event
                  </span>
                </div>
                <div className="relative h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={selectedClaim.postImage} alt="Post-Disaster" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 px-1.5 py-0.2 rounded text-[8px] text-orange-400 font-bold">
                    Post-Damage
                  </span>
                </div>
              </div>

              {/* Loss Comparison Breakdown */}
              <div className="bg-[#080D18] p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Claim Amount:</span>
                  <span className="font-bold text-white text-sm">${selectedClaim.claim_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">AI Calculated Loss:</span>
                  <span className="font-bold text-emerald-400 text-sm">${selectedClaim.estimated_damage.toLocaleString()}</span>
                </div>

                {/* Visual Loss Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>Evidence Alignment</span>
                    <span>{100 - Math.abs(selectedClaim.discrepancy_pct || 0)}% Matched</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedClaim.claim_risk === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, 100 - Math.abs(selectedClaim.discrepancy_pct || 0))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Narrative Breakdown */}
              <div className="bg-[#080D18] p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1.5">
                <span className="text-slate-500 uppercase font-bold block">Claim Description:</span>
                <p className="text-slate-300 leading-relaxed">{selectedClaim.claim_desc}</p>
                <span className="text-slate-500 uppercase font-bold block pt-1">Field Investigator Notes:</span>
                <p className="text-slate-400 leading-relaxed">{selectedClaim.field_report}</p>
              </div>

              {/* Triage Decision Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Adjudication Actions:</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    onClick={() => handleUpdateClaimStatus(selectedClaim.claim_id, 'AUTO_APPROVED')}
                    className="p-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleUpdateClaimStatus(selectedClaim.claim_id, 'FIELD_INSPECTION')}
                    className="p-2 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-500/60 text-blue-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleUpdateClaimStatus(selectedClaim.claim_id, 'REJECTED')}
                    className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/60 text-rose-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Reject</span>
                  </button>
                </div>

                <button
                  onClick={() => onInspectInRecon && onInspectInRecon(selectedClaim)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 py-1.5 text-[11px] text-slate-200 transition cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-orange-400" />
                  <span>Inspect Damage Overlays in Optical Recon</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Select a claim to review verification dossier
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
