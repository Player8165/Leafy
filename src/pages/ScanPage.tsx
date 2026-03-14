import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScanReticle } from "@/components/ScanReticle";
import { CaptureButton } from "@/components/CaptureButton";
import { AnalyzingOverlay } from "@/components/AnalyzingOverlay";
import { DiagnosticResultCard } from "@/components/DiagnosticResult";
import { TreatmentSheet } from "@/components/TreatmentSheet";
import { useDiagnosticsContext } from "@/context/DiagnosticsContext";
import { useEnvironmentalData } from "@/hooks/useEnvironmentalData";
import { Upload, Camera, Zap, ShieldAlert, Cloud, Cpu, AlertCircle, Sparkles, Image as ImageIcon, Crosshair, X, Check, ArrowRight, Activity, Thermometer, Droplets, Loader2 } from "lucide-react";

export default function ScanPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { state, mode, currentResult, analyzeImage, reset, capturedImage, toggleMode, error, setError } = useDiagnosticsContext();
    const env = useEnvironmentalData();
    
    const [showTreatment, setShowTreatment] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            setStream(null);
        }
        setIsCameraActive(false);
    }, [stream]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
                audio: false 
            });
            setStream(mediaStream);
            setIsCameraActive(true);
            setPreviewImage(null);
        } catch (err) {
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setStream(fallbackStream);
                setIsCameraActive(true);
            } catch (fallbackErr) {
                setError("Camera access blocked. Please check permissions.");
            }
        }
    }, [setError]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
                setPreviewImage(dataUrl);
                stopCamera();
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const startAnalysis = () => {
        if (previewImage) {
            analyzeImage(previewImage);
            setPreviewImage(null);
        }
    };

    const clearPreview = () => {
        setPreviewImage(null);
        reset();
    };

    return (
        <div className={`min-h-screen bg-background flex flex-col transition-colors duration-700 ${mode === 'advanced' ? 'cloud-mode' : ''}`}>
            {/* Header HUD */}
            <header className="px-6 pt-10 pb-4 flex justify-between items-start z-20">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${mode === 'advanced' ? 'bg-blue-500 animate-pulse' : 'bg-primary'}`} />
                        <h1 className="text-2xl font-black tracking-tight text-white uppercase italic text-gradient">Leafy</h1>
                    </div>
                    <p className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">AI Diagnostic Node</p>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all glass-panel ${
                        mode === 'advanced' 
                        ? 'border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'border-white/5 text-zinc-500'
                    }`}
                >
                    {mode === 'advanced' ? <Cloud className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {mode === 'advanced' ? 'Advanced' : 'Standard'}
                    </span>
                </motion.button>
            </header>

            <main className="flex-1 flex flex-col px-6 gap-6 relative z-10 pb-32">
                <AnimatePresence mode="wait">
                    {/* IDLE STATE: Selection Menu */}
                    {state === "idle" && !isCameraActive && !previewImage && !currentResult && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <motion.div 
                                onClick={() => fileInputRef.current?.click()}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 min-h-[300px] rounded-[3.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-8 text-center group cursor-pointer relative overflow-hidden transition-all hover:bg-white/[0.04] shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_hsla(var(--primary),0.2)]">
                                    <ImageIcon className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black mb-2 text-white italic uppercase tracking-tighter">Diagnostic Upload</h2>
                                <p className="text-muted-foreground text-xs max-w-[220px] leading-relaxed mb-10">
                                    Import high-fidelity crop imagery for <span className="text-primary font-bold">pathogen extraction</span>
                                </p>
                                <div className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl">
                                    Browse Specimen
                                </div>
                            </motion.div>

                            {/* Replaced Smart Meta with Full-Width Camera Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={startCamera}
                                className="p-8 rounded-[2.5rem] glass-panel flex items-center gap-6 group border border-white/5 active:bg-white/5 transition-colors"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-primary/20 transition-all">
                                    <Camera className="w-6 h-6 text-zinc-500 group-hover:text-primary" />
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Scan</span>
                                    <h3 className="text-lg font-bold text-white uppercase italic">Initialize Viewfinder</h3>
                                </div>
                                <div className="ml-auto w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 text-zinc-700" />
                                </div>
                            </motion.button>

                            {/* Dynamic System Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 glass-panel rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                                    <Activity className="w-4 h-4 text-primary/40" />
                                    <span className="text-[8px] font-black text-zinc-600 uppercase">GPU: Active</span>
                                </div>
                                <div className="p-4 glass-panel rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                                    <Thermometer className="w-4 h-4 text-blue-500/40" />
                                    <span className="text-[8px] font-black text-zinc-600 uppercase">
                                        {env.loading ? <Loader2 className="w-2 h-2 animate-spin" /> : `Temp: ${env.temp.toFixed(1)}°C`}
                                    </span>
                                </div>
                                <div className="p-4 glass-panel rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                                    <Droplets className="w-4 h-4 text-cyan-500/40" />
                                    <span className="text-[8px] font-black text-zinc-600 uppercase">
                                        {env.loading ? <Loader2 className="w-2 h-2 animate-spin" /> : `Humi: ${env.humidity.toFixed(0)}%`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PREVIEW STATE */}
                    {previewImage && state === "idle" && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="flex-1 relative rounded-[3.5rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-zinc-900 group">
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                
                                {/* TOP ACTIONS */}
                                <div className="absolute top-8 left-8 z-50">
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={clearPreview}
                                        className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white backdrop-blur-3xl shadow-2xl border-2 border-white/40"
                                    >
                                        <X className="w-8 h-8" />
                                    </motion.button>
                                </div>

                                {/* BOTTOM ACTIONS */}
                                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Ready for Analysis</span>
                                        <h3 className="text-2xl font-black text-white uppercase italic">Confirm Data?</h3>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startAnalysis}
                                        className="px-12 py-5 bg-primary text-primary-foreground rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_50px_hsla(var(--primary),0.3)] flex items-center gap-3"
                                    >
                                        <Check className="w-5 h-5" />
                                        Start Process
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CAMERA STATE */}
                    {isCameraActive && (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black flex flex-col"
                        >
                            <div className="flex-1 relative overflow-hidden">
                                <video
                                    ref={(el) => { if (el && stream) el.srcObject = stream; }}
                                    autoPlay playsInline muted
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <ScanReticle isActive={true} />
                                <div className="absolute top-14 right-8 z-[200]">
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            stopCamera();
                                        }}
                                        className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white backdrop-blur-3xl shadow-2xl border-2 border-white/40 active:bg-white/20"
                                    >
                                        <X className="w-8 h-8" />
                                    </motion.button>
                                </div>
                            </div>
                            <div className="h-64 bg-zinc-950 flex flex-col items-center justify-center p-8 gap-6">
                                <CaptureButton onClick={handleCapture} />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Stable Capture Active</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ANALYZING STATE */}
                    {state === "analyzing" && (
                        <motion.div key="analyzing" className="flex-1 flex items-center justify-center">
                            <AnalyzingOverlay />
                        </motion.div>
                    )}

                    {/* COMPLETE STATE */}
                    {state === "complete" && currentResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="relative rounded-[3.5rem] overflow-hidden aspect-square shadow-2xl border-[6px] border-card bg-zinc-900 group">
                                <img src={capturedImage!} alt="Final Sample" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <DiagnosticResultCard
                                        result={currentResult}
                                        onClose={clearPreview}
                                        onViewProtocol={() => setShowTreatment(true)}
                                    />
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={clearPreview}
                                className="w-full py-5 glass-panel rounded-2xl flex items-center justify-center gap-3 active:bg-white/5 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Scan New Specimen</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <TreatmentSheet result={currentResult} isOpen={showTreatment} onClose={() => setShowTreatment(false)} />
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
