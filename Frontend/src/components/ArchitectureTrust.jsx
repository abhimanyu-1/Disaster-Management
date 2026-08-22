import { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  Database, 
  Lock, 
  Cpu, 
  Radio, 
  WifiOff, 
  RefreshCw, 
  ArrowRight, 
  FileCheck, 
  UserCheck, 
  DollarSign, 
  Layers,
  Terminal,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function ArchitectureTrust() {
  const [activeModelProvider, setActiveModelProvider] = useState('gemini'); // 'gemini' | 'local_onnx' | 'mock_adapter'
  const [selectedPipelineNode, setSelectedPipelineNode] = useState('local_processing');

  const pipelineNodes = [
    {
      id: 'ingestion',
      name: '1. Ingestion',
      subtitle: 'Imagery & Field Telemetry',
      icon: Radio,
      desc: 'Local buffering of raw nadir satellite passes, UAV drone feeds, and field responder GPS logs.',
      boundary: 'External Adapter Zone',
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300'
    },
    {
      id: 'local_processing',
      name: '2. Private Inference',
      subtitle: 'Multi-Agent Pipeline',
      icon: Cpu,
      desc: 'Zero-cloud egress option. Multimodal feature extraction, change detection, and spatial bbox projection inside restricted network.',
      boundary: 'Restricted Airgap Zone',
      color: 'border-orange-500/50 bg-orange-950/20 text-orange-300'
    },
    {
      id: 'geo_store',
      name: '3. Geospatial Store',
      subtitle: 'Local SQLite & Vectors',
      icon: Database,
      desc: 'Encrypted local SQLite audit database and vector GIS indices. No external telemetry leaks.',
      boundary: 'Restricted Airgap Zone',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
    },
    {
      id: 'api_layer',
      name: '4. REST Gateway',
      subtitle: 'FastAPI Internal API',
      icon: Terminal,
      desc: 'Local microservices hosting assessment orchestration, claim triage, and real-time audit event logging.',
      boundary: 'Secure On-Prem Boundary',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300'
    },
    {
      id: 'ui_command',
      name: '5. EOC Frontend',
      subtitle: 'DisasterIQ UI',
      icon: Layers,
      desc: 'Client-side tactical command dashboard with offline caching, high-FPS canvas map, and dual-optical viewers.',
      boundary: 'Local Workstation',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300'
    },
    {
      id: 'hitl_verification',
      name: '6. Human Verification',
      subtitle: 'Operator in the Loop',
      icon: UserCheck,
      desc: 'Strict Human-in-the-Loop review for low-confidence or high-risk assessments before relief disbursement.',
      boundary: 'Human Authority Zone',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
    },
    {
      id: 'claims_dispatch',
      name: '7. Claims & Relief',
      subtitle: 'Financial & Resource Auth',
      icon: DollarSign,
      desc: 'Automated claim fraud scoring, emergency aid tranche authorization, and official audit manifest generation.',
      boundary: 'Enterprise Relief Core',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300'
    }
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Top Architecture Summary Banner */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Restricted Data Isolation & Trust Boundaries
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-[10px]">
                Zero Citizen PII Egress
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-3xl">
              All incident evidence, policyholder dossiers, geospatial coordinates, and drone reconnaissance telemetry remain locked inside the local on-prem security perimeter. External adapters and model backends communicate strictly through non-retaining zero-data-retention APIs.
            </p>
          </div>
        </div>

        {/* Model Provider Switcher */}
        <div className="rounded-xl border border-slate-800 bg-[#080D18] p-2.5 shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
            Model Backend Abstraction:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveModelProvider('gemini')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                activeModelProvider === 'gemini'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Gemini 2.5 Flash
            </button>
            <button
              onClick={() => setActiveModelProvider('local_onnx')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                activeModelProvider === 'local_onnx'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Local ONNX / TensorRT
            </button>
            <button
              onClick={() => setActiveModelProvider('mock_adapter')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                activeModelProvider === 'mock_adapter'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Synthetic Benchmark Stub
            </button>
          </div>
        </div>
      </div>

      {/* Main End-to-End Pipeline Visualization Box */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-5 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-orange-400" />
            <h3 className="font-bold text-white uppercase text-xs">
              End-to-End Disaster Dataflow Pipeline
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Click any stage below to inspect isolation controls
          </span>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
          {pipelineNodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedPipelineNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedPipelineNode(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${node.color} ${
                  isSelected ? 'ring-2 ring-orange-500 shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase opacity-80">{node.name}</span>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-slate-100 text-[11px] leading-tight">
                    {node.subtitle}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/50">
                  <span className="text-[9px] font-mono text-slate-400 block truncate">
                    {node.boundary}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Inspector */}
        {selectedPipelineNode && (
          <div className="mt-4 p-4 rounded-xl bg-[#080D18] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase text-xs">
                  Active Node Detail: {pipelineNodes.find(n => n.id === selectedPipelineNode)?.name} - {pipelineNodes.find(n => n.id === selectedPipelineNode)?.subtitle}
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-950 border border-orange-500/40 text-orange-300 text-[10px]">
                  {pipelineNodes.find(n => n.id === selectedPipelineNode)?.boundary}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {pipelineNodes.find(n => n.id === selectedPipelineNode)?.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="h-4 w-4" />
                Air-Gapped Validated
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 4 Architectural Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Pillar 1: Restricted Data Boundary */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="h-4 w-4" />
            <h4 className="font-bold text-white uppercase text-xs">1. Data Boundary</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Policyholder records, citizen coordinates, and damage loss figures remain within on-prem SQLite. All external payloads are sanitized before ingestion.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400 font-bold">
            <span>PII Enclave:</span>
            <span>RESTRICTED</span>
          </div>
        </div>

        {/* Pillar 2: Local / On-Prem Inference */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-orange-400">
            <HardDrive className="h-4 w-4" />
            <h4 className="font-bold text-white uppercase text-xs">2. Local Inference</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Modular multi-agent runtime designed to execute locally with PyTorch/TensorRT or zero-retention cloud vision endpoints.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-orange-400 font-bold">
            <span>Latency SLA:</span>
            <span>&lt; 700ms</span>
          </div>
        </div>

        {/* Pillar 3: Offline Synchronization */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <WifiOff className="h-4 w-4" />
            <h4 className="font-bold text-white uppercase text-xs">3. Offline Resilience</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Field units can queue assessments, photos, and verifications in local storage. Automatic reconciliation triggers upon gateway reconnect.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-cyan-400 font-bold">
            <span>Queue Engine:</span>
            <span>Active FIFO</span>
          </div>
        </div>

        {/* Pillar 4: Modular Feed Adapters */}
        <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Radio className="h-4 w-4" />
            <h4 className="font-bold text-white uppercase text-xs">4. Pluggable Adapters</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Standardized ingestion contracts for USGS, Copernicus Sentinel-2, Maxar, NOAA, and drone feeds with automatic format normalization.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-purple-400 font-bold">
            <span>Adapter Standard:</span>
            <span>STAC / GeoJSON</span>
          </div>
        </div>

      </div>

    </div>
  );
}
