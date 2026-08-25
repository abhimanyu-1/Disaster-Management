import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Zap, 
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function MissionControl({ 
  onAnalyze, 
  isProcessing,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  onImageReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assetId, setAssetId] = useState('ASSET-' + Math.floor(1000 + Math.random() * 9000));
  const [lat, setLat] = useState('19.4326');
  const [lon, setLon] = useState('-99.1332');
  const [claimAmount, setClaimAmount] = useState('500000');
  const [claimDesc, setClaimDesc] = useState('Automated imagery disaster damage analysis');
  const [fieldReport, setFieldReport] = useState('First responder aerial reconnaissance');

  const fileInputRef = useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onImageReset) onImageReset();
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Auto-generate asset ID based on filename if needed
      setAssetId(file.name.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 16));
    }
  };

  const [uploadError, setUploadError] = useState(null);

  const handleClearImage = (e) => {
    e.stopPropagation();
    if (onImageReset) onImageReset();
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!imagePreview && !imageFile) {
      setUploadError('Please select or upload a disaster image first.');
      return;
    }

    let finalImagePath = imagePreview;
    if (imageFile) {
      finalImagePath = await fileToBase64(imageFile);
    }

    const payload = {
      asset_id: assetId.trim() || 'ASSET-001',
      lat: parseFloat(lat) || 0.0,
      lon: parseFloat(lon) || 0.0,
      image_path: finalImagePath,
      claim_desc: claimDesc.trim() || 'Disaster image assessment',
      claim_amount: parseFloat(claimAmount) || 0.0,
      field_report: fieldReport.trim() || 'Reconnaissance optical survey'
    };

    onAnalyze(payload);
  };

  return (
    <aside className="rounded-2xl border border-slate-800 bg-[#0E1626]/90 p-5 shadow-2xl flex flex-col space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
          <h2 className="font-bold uppercase tracking-wider text-slate-100 text-sm">
            01 Image Ingestion
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 bg-[#080D18] border border-slate-800 px-2 py-0.5 rounded">
          Single File
        </span>
      </div>

      {/* Main Single Image Upload Zone */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
            imageFile 
              ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' 
              : 'border-slate-700 hover:border-orange-500 bg-[#080D18] hover:bg-slate-900/60'
          }`}
        >
          {imagePreview ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-700 shadow-inner group">
              <img 
                src={imagePreview} 
                alt="Selected disaster preview" 
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition p-3 text-center">
                <UploadCloud className="h-6 w-6 text-orange-400 mb-1" />
                <span className="text-xs text-white font-bold">
                  Click to choose a different image
                </span>
                <span className="text-[10px] text-slate-300">
                  Replaces active file
                </span>
              </div>

              {imageFile && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  title="Clear file"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Drop your disaster image here, or <span className="text-orange-400 underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WebP (Satellite, Drone, Aerial, or Ground)
                </p>
              </div>
            </div>
          )}

          {/* Upload confirmation badge */}
          {imageFile && (
            <div className="w-full flex items-center justify-between p-2 rounded-xl bg-[#080D18] border border-emerald-500/40 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 truncate">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{imageFile.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                {(imageFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}
        </div>

        {/* Upload error banner */}
        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[11px] text-center font-bold">
            ⚠️ {uploadError}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-black tracking-wide text-xs shadow-xl shadow-orange-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'ANALYZING VIA MULTI-AGENT ENGINE...' : 'EXECUTE ASSESSMENT'}</span>
        </button>

        {/* Optional Collapsible Advanced Parameters */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Advanced Geolocation & Metadata (Optional)</span>
            </span>
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-[#080D18] border border-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 block">Asset Tag</label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 block">Lat</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 block">Lon</label>
                  <input
                    type="number"
                    step="any"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 block">Claim Estimate ($)</label>
                <input
                  type="number"
                  step="any"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

      </form>

    </aside>
  );
}
