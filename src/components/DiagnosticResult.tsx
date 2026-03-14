import { motion } from "framer-motion";
import { DiagnosisResult } from "@/types/diagnosis";
import { Leaf, Bug, AlertTriangle, X, ChevronRight, Zap, Target } from "lucide-react";

interface DiagnosticResultProps {
    result: DiagnosisResult;
    onClose: () => void;
    onViewProtocol: () => void;
}

const statusConfig = {
    healthy: {
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        label: "System Clean",
        Icon: Leaf,
    },
    infected: {
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive/20",
        label: "Anomaly Detected",
        Icon: Bug,
    },
    warning: {
        color: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning/20",
        label: "Stress Alert",
        Icon: AlertTriangle,
    },
};

export const DiagnosticResultCard = ({ result, onClose, onViewProtocol }: DiagnosticResultProps) => {
    const config = statusConfig[result.status];
    const Icon = config.Icon;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.border} border`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>{config.label}</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight uppercase italic">{result.commonName}</h2>
                        <p className="text-xs font-mono text-zinc-500 mt-1">{result.scientificName}</p>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">AI Assurance</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">{(result.confidence * 100).toFixed(0)}%</span>
                        <Target className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Risk Vector</p>
                    <span className={`text-xl font-black uppercase ${result.spreadRisk === 'High' ? 'text-destructive' : 'text-primary'}`}>
                        {result.spreadRisk}
                    </span>
                </div>
            </div>

            {/* Quick Access Remedy Highlight */}
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Immediate Response</p>
                    <p className="text-sm font-bold text-white line-clamp-1">{result.recommendedAction}</p>
                </div>
            </div>

            <button
                onClick={onViewProtocol}
                className="w-full bg-white text-black group px-6 py-4 rounded-2xl flex items-center justify-between font-black active:scale-[0.98] transition-all hover:bg-zinc-200 shadow-xl"
            >
                <span className="text-sm uppercase tracking-widest">Open Analysis Protocol</span>
                <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </button>
        </motion.div>
    );
};
