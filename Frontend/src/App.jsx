import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Satellite, 
  AlertTriangle, 
  CheckCircle, 
  Home, 
  ChevronDown,
  Activity,
  MapPin,
  Clock,
  ShieldAlert
} from 'lucide-react';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [demoPair, setDemoPair] = useState('earthquake');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessment, setAssessment] = useState(null);
  
  const imageInputRef = useRef(null);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const getBoxStyle = (bbox) => {
    if (!bbox || bbox.length !== 4) return { display: 'none' };
    const [ymin, xmin, ymax, xmax] = bbox;
    if (ymin === 0 && xmax === 0) return { display: 'none' };
    return {
      top: `${(ymin / 1000) * 100}%`,
      left: `${(xmin / 1000) * 100}%`,
      height: `${((ymax - ymin) / 1000) * 100}%`,
      width: `${((xmax - xmin) / 1000) * 100}%`
    };
  };

  const demoUrls = {
    "earthquake": "https://images.unsplash.com/photo-1541888079813-20703f848b8c?q=80&w=800&auto=format&fit=crop",
    "flood": "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800&auto=format&fit=crop",
    "hurricane": "https://images.unsplash.com/photo-1584985220464-8390497de283?q=80&w=800&auto=format&fit=crop",
    "wildfire": "https://images.unsplash.com/photo-1601584347783-f368c85770c0?q=80&w=800&auto=format&fit=crop"
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      let base64Image = null;
      if (imageFile) {
        base64Image = await fileToBase64(imageFile);
      }
      
      // In a real app we'd upload images, but here we pass the path or base64 data
      const response = await fetch('http://localhost:8000/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: "DEMO-" + Math.floor(Math.random() * 10000),
          lat: 19.4326,
          lon: -99.1332,
          image_path: base64Image || demoUrls[demoPair],
          claim_desc: "Visual destruction",
          claim_amount: 500000,
          field_report: "Area unapproachable"
        })
      });
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      console.error(err);
    }
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-diq-bg text-slate-100">
      <div className="mx-auto max-w-[1920px] px-4 py-4">
        
        {/* Header */}
        <header className="mb-4 border-b border-diq-line/60 pb-4">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex shrink-0 items-center gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Disaster</h1>
                  <h1 className="text-3xl font-black tracking-tight text-diq-orange md:text-4xl">Management</h1>
                </div>
                <p className="mt-1.5 whitespace-nowrap text-[13px] font-black uppercase tracking-[0.18em] text-slate-300">
                  See damage. <span className="text-diq-orange">Prioritize relief.</span> <span className="text-red-400">Save lives.</span>
                </p>
              </div>
            </div>
            
            <div className="grid flex-1 gap-8 sm:grid-cols-2 2xl:max-w-[760px]">
              <div className="border-l border-diq-line/60 px-6 py-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Dataset</p>
                <p className="mt-1.5 flex items-center gap-2 whitespace-nowrap text-lg font-semibold text-white">
                  <span className="rounded bg-green-500 px-1.5 py-0.5 text-[11px] text-white font-bold">C</span>Global Disaster Imagery
                </p>
              </div>
              <div className="border-l border-diq-line/60 px-6 py-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Status</p>
                <span className="mt-1.5 inline-flex rounded border px-3 py-1 text-sm font-black uppercase tracking-[0.12em] border-blue-500/70 bg-blue-950/40 text-blue-300">
                  Connected
                </span>
                <p className="mt-1.5 whitespace-nowrap text-xs text-slate-500">API: localhost:8000</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
          
          {/* Left Panel: Mission Control */}
          <aside className="overflow-hidden rounded-xl border border-diq-line/70 bg-diq-panel/55 shadow-2xl shadow-black/20">
            <div className="border-b border-diq-line/60 bg-slate-950/30 px-4 py-3">
              <h2 className="font-label text-xs uppercase tracking-[0.18em] text-slate-200">Mission Control</h2>
            </div>
            
            <div className="space-y-3.5 p-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-300">1</span>
                  <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-300">Upload Imagery</p>
                </div>
                
                <div className="rounded-2xl border border-dashed border-blue-500/35 bg-slate-950/30 p-3">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-diq-line/70 bg-slate-950/70 text-slate-400">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="mt-3 max-w-[190px] text-sm font-semibold leading-5 text-slate-200">Drag & drop disaster image here</p>
                    <div className="my-3 h-px w-full bg-diq-line/40"></div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="space-y-1.5">
                      <label className="block font-label text-[9px] uppercase tracking-[0.18em] text-slate-500">Disaster Image</label>
                      <button onClick={() => imageInputRef.current?.click()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-diq-line/70 bg-slate-950/50 px-2.5 py-2 text-xs transition hover:border-diq-orange/70 hover:bg-slate-900/70">
                        <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-100">Browse</span>
                        <span className="min-w-0 truncate text-slate-500">{imageFile ? imageFile.name : 'No file selected'}</span>
                      </button>
                      <input ref={imageInputRef} type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <select 
                  value={demoPair} 
                  onChange={(e) => setDemoPair(e.target.value)}
                  className="w-full rounded-xl border border-diq-line/70 bg-slate-950/60 px-3 py-3 text-sm text-slate-100 transition hover:border-diq-line focus:outline-none focus:ring-1 focus:ring-diq-orange"
                >
                  <option value="earthquake">Earthquake</option>
                  <option value="flood">Flood</option>
                  <option value="hurricane">Hurricane</option>
                  <option value="wildfire">Wildfire</option>
                </select>
                
                <button 
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-diq-orange px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-950/40 transition hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Activity className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  {isProcessing ? 'Analyzing...' : '⌘ Analyze Damage'}
                </button>
              </div>
            </div>
          </aside>

          {/* Center Panel: Visualization */}
          <section className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-blue-500/35 bg-diq-panel/45 shadow-2xl shadow-black/20">
              <div className="min-h-[700px] xl:min-h-[800px]">
                
                {/* Single Image & Overlay */}
                <div className="relative overflow-hidden bg-slate-950 h-full w-full">
                  <div className="absolute left-4 top-4 z-20 rounded bg-blue-950/90 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-black/30">
                    Disaster AI Damage Overlay
                  </div>
                  <div className="flex h-full items-center justify-center bg-slate-950/35">
                    {assessment ? (
                      <div className="relative h-full w-full">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : demoUrls[demoPair]} 
                          alt="Disaster Image" 
                          className="h-full w-full object-contain"
                        />
                        {assessment.vision.damage_detected && assessment.vision.bounding_box && (
                          <div 
                            className="absolute border-[3px] border-red-500 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-700 ease-in-out"
                            style={getBoxStyle(assessment.vision.bounding_box)}
                          >
                            <span className="absolute -top-7 left-[-3px] bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg whitespace-nowrap">
                              {assessment.vision.damage_type} DETECTED
                            </span>
                            <span className="absolute -bottom-6 right-[-3px] bg-red-950/80 px-2 py-0.5 text-[9px] font-bold uppercase text-red-400 border border-red-500/50 whitespace-nowrap">
                              {(assessment.vision.confidence * 100).toFixed(0)}% CONFIDENCE
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-diq-line/70 bg-slate-950/70 text-xl text-slate-500">◇</div>
                        <p className="mt-4 font-label text-xs uppercase tracking-[0.18em] text-slate-500">Awaiting Imagery</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute right-4 top-4 z-20 rounded-xl border border-diq-line/70 bg-slate-950/90 p-4 shadow-2xl shadow-black/40 backdrop-blur">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-white">Damage Legend</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-green-400"></span><span className="text-xs font-medium text-slate-200">No Damage</span></div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-yellow-400"></span><span className="text-xs font-medium text-slate-200">Minor Damage</span></div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-orange-500"></span><span className="text-xs font-medium text-slate-200">Major Damage</span></div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500"></span><span className="text-xs font-medium text-slate-200">Destroyed</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Brief */}
            <section className="rounded-xl border border-blue-500/35 bg-diq-panel/55 shadow-2xl shadow-black/20">
              <div className="border-b border-diq-line/60 bg-slate-950/30 px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="font-label text-xs uppercase tracking-[0.18em] text-diq-orange">AI Situation Brief</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-white">Emergency Response Summary</h3>
                    <p className="mt-1 text-sm text-slate-500">Determined from Multi-Agent orchestration.</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {assessment ? (
                  <div className="rounded-xl border border-diq-line/50 bg-slate-950/30 p-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 border-b border-diq-line/60 pb-2">Vision & Context</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li><span className="font-semibold text-slate-400">Damage Type:</span> {assessment.vision.damage_type.toUpperCase()}</li>
                          <li><span className="font-semibold text-slate-400">Vision Confidence:</span> {(assessment.vision.confidence * 100).toFixed(0)}%</li>

                          <li><span className="font-semibold text-slate-400">Pop. Affected:</span> {assessment.geo_context.population_affected}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 border-b border-diq-line/60 pb-2">Final Recommendation</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li><span className="font-semibold text-slate-400">Overall Severity:</span> <span className="text-red-400 font-bold">{assessment.assessment.severity}</span></li>
                          <li><span className="font-semibold text-slate-400">Claim Risk:</span> {assessment.claim_analysis.risk}</li>
                          <li><span className="font-semibold text-slate-400">Verification Required:</span> {assessment.verification.required ? 'YES' : 'NO'}</li>
                          <li>
                            <span className="font-semibold text-slate-400">Action:</span> 
                            <span className="ml-2 inline-flex items-center rounded-md bg-blue-900/40 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                              {assessment.final_decision.recommended_action.replace('_', ' ')}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-diq-line/50 bg-slate-950/30 p-5">
                    <div>
                      <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-500">Awaiting analysis</p>
                      <h4 className="mt-2 text-xl font-black text-white">No emergency brief generated yet</h4>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Run damage analysis to generate an executive summary, response priorities, and field recommendations.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </section>

          {/* Right Panel: Analytics */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-blue-500/35 bg-diq-panel/55 p-4 shadow-2xl shadow-black/20">
              <h2 className="font-label text-xs uppercase tracking-[0.18em] text-slate-200">Damage Summary</h2>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-green-500/70 bg-green-950/25 p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-green-300">No Damage</p>
                      <p className="mt-2 text-3xl font-black leading-none text-green-300">{assessment && assessment.assessment.severity === 'LOW' && !assessment.vision.damage_detected ? '1' : '0'}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-300" />
                  </div>
                </div>
                
                <div className="rounded-xl border border-yellow-500/70 bg-yellow-950/15 p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-yellow-300">Minor Damage</p>
                      <p className="mt-2 text-3xl font-black leading-none text-yellow-300">{assessment && assessment.assessment.severity === 'LOW' && assessment.vision.damage_detected ? '1' : '0'}</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-yellow-300" />
                  </div>
                </div>
                
                <div className="rounded-xl border border-orange-500/70 bg-orange-950/20 p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-orange-300">Major Damage</p>
                      <p className="mt-2 text-3xl font-black leading-none text-orange-300">{assessment && assessment.assessment.severity === 'MEDIUM' ? '1' : '0'}</p>
                    </div>
                    <Home className="h-5 w-5 text-orange-300" />
                  </div>
                </div>
                
                <div className="rounded-xl border border-red-500/70 bg-red-950/25 p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-red-300">Destroyed</p>
                      <p className="mt-2 text-3xl font-black leading-none text-red-300">{assessment && assessment.assessment.severity === 'HIGH' ? '1' : '0'}</p>
                    </div>
                    <ShieldAlert className="h-5 w-5 text-red-300" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-diq-line/60 bg-slate-950/35 p-4 text-center">
                  <p className="text-xs text-slate-400">Priority Level</p>
                  <p className="mt-1 text-xl font-black text-white">{assessment ? assessment.priority.level : '—'}</p>
                </div>
                <div className="rounded-xl border border-diq-line/60 bg-slate-950/35 p-4 text-center">
                  <p className="text-xs text-slate-400">Priority Score</p>
                  <p className="mt-1 text-2xl font-black text-white">{assessment ? assessment.priority.score.toFixed(2) : '—'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/35 bg-diq-panel/55 shadow-2xl shadow-black/20">
              <div className="border-b border-diq-line/60 bg-slate-950/30 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-label text-xs uppercase tracking-[0.18em] text-slate-200">Priority Zones</h3>
                  <span className="rounded border border-diq-line/50 bg-slate-950/60 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Live</span>
                </div>
              </div>
              <div className="p-4">
                <div className="overflow-hidden rounded-xl border border-diq-line/50 bg-slate-950/35">
                  <div className="grid grid-cols-[56px_1fr_95px] border-b border-diq-line/50 bg-slate-950/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <span>Zone</span>
                    <span>Threat</span>
                    <span className="text-right">Priority</span>
                  </div>
                  <div className="divide-y divide-diq-line/40">
                    {assessment ? (
                      <div className="grid grid-cols-[56px_1fr_95px] items-center gap-3 px-3 py-3 bg-red-900/10">
                        <div className="h-7 w-7 rounded-lg bg-red-500 flex items-center justify-center font-bold text-xs">1</div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase">{assessment.assessment.severity} RISK</div>
                          <div className="mt-1 text-[10px] text-slate-400">Affected: {assessment.geo_context.population_affected}</div>
                        </div>
                        <div className="ml-auto px-2 py-1 text-[10px] rounded-md bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                          {assessment.priority.level}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-[56px_1fr_95px] items-center gap-3 px-3 py-3">
                        <div className="h-7 w-7 rounded-lg bg-diq-line/25"></div>
                        <div><div className="h-3 w-20 rounded bg-diq-line/25"></div><div className="mt-2 h-2 w-32 rounded bg-diq-line/15"></div></div>
                        <div className="ml-auto h-6 w-16 rounded-md bg-diq-line/20"></div>
                      </div>
                    )}
                  </div>
                </div>
                {!assessment && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-500">Ranked response zones will appear here after Disaster Management analyzes the before/after imagery.</p>
                )}
              </div>
            </div>
          </aside>
          
        </section>

        <footer className="mt-4 flex flex-col items-center justify-between gap-2 pb-2 text-xs text-slate-500 md:flex-row">
          <span></span>
        </footer>
        
      </div>
    </main>
  );
}

export default App;
