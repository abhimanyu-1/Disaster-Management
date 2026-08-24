import { useState, useEffect } from 'react';
import Header from './components/Header';
import MissionControl from './components/MissionControl';
import ImageViewer from './components/ImageViewer';
import CrisisSeverityIndex from './components/CrisisSeverityIndex';
import AgentPipeline from './components/AgentPipeline';
import { api } from './services/api';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ online: false, latency: null, error: null });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const health = await api.checkHealth();
      setBackendStatus(health);
    } catch {
      setBackendStatus({ online: false, latency: null, error: 'Connection failed' });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runInitialCheck = async () => {
      const health = await api.checkHealth();
      if (isMounted) setBackendStatus(health);
    };

    runInitialCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnalyze = async (payload) => {
    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const result = await api.createAssessment(payload);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setInferenceTime(elapsed);
      setCurrentAssessment(result);
      addToast('success', `Assessment complete for ${payload.asset_id}! Severity: ${result.assessment?.severity || 'Calculated'}`);
    } catch (err) {
      console.error('Assessment failed:', err);
      addToast('error', `Assessment failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationUpdated = async (newStatus) => {
    if (currentAssessment) {
      try {
        await api.updateVerification(currentAssessment.assessment_id, newStatus);
        setCurrentAssessment(prev => ({
          ...prev,
          final_decision: {
            ...prev.final_decision,
            status: newStatus
          }
        }));
        addToast('success', `HITL verification decision recorded: ${newStatus}`);
      } catch (err) {
        console.error('Failed to update verification:', err);
        addToast('error', `Failed to update status: ${err.message}`);
      }
    }
  };

  const handleImageReset = () => {
    setCurrentAssessment(null);
  };

  const handleSaveBBox = (newBoxes) => {
    if (currentAssessment && newBoxes) {
      setCurrentAssessment(prev => ({
        ...prev,
        vision: {
          ...prev.vision,
          bounding_boxes: newBoxes
        }
      }));
      addToast('success', 'HITL Override saved to assessment');
    }
  };

  return (
    <main className="min-h-screen bg-[#070B13] text-slate-100 p-3 sm:p-4 lg:p-5 font-sans selection:bg-orange-500 selection:text-white">
      <div className="mx-auto max-w-[1920px] space-y-4">
        
        {/* Header */}
        <Header 
          backendStatus={backendStatus}
          onRefresh={checkHealth}
          isRefreshing={isRefreshing}
          onStatusChange={setBackendStatus}
        />

        {/* 3-Column Mission Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Left Column: 01 Image Ingestion (Single File Upload) */}
          <div className="xl:col-span-3">
            <MissionControl 
              onAnalyze={handleAnalyze}
              isProcessing={isProcessing}
              imageFile={imageFile}
              setImageFile={setImageFile}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              onImageReset={handleImageReset}
            />
          </div>

          {/* Center Column: 02 Spatial Damage Localization Viewer */}
          <div className="xl:col-span-6 space-y-4">
            <ImageViewer 
              imageUrl={imagePreview}
              assessment={currentAssessment}
              isProcessing={isProcessing}
              onSaveBBox={handleSaveBBox}
            />

            {/* Bottom Multi-Agent Telemetry Log */}
            <AgentPipeline assessment={currentAssessment} />
          </div>

          {/* Right Column: 03 Crisis Severity Index & HITL Actions */}
          <div className="xl:col-span-3">
            <CrisisSeverityIndex 
              assessment={currentAssessment}
              inferenceTime={inferenceTime}
              onVerificationUpdated={handleVerificationUpdated}
            />
          </div>

        </div>

      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-mono">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-start justify-between gap-3 text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/60 text-rose-200'
                : 'bg-blue-950/95 border-blue-500/60 text-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <span className="font-medium leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
