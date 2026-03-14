import { DiagnosisResult } from "@/types/diagnosis";
import { Leaf, Bug, AlertTriangle, ChevronRight, Binary, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusIcons = {
    healthy: Leaf,
    infected: Bug,
    warning: AlertTriangle,
};

const statusColors = {
    healthy: "text-primary bg-primary/10 border-primary/20",
    infected: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-warning bg-warning/10 border-warning/20",
};

export const HistoryCard = ({ 
    result, 
    onClick,
    onDelete 
}: { 
    result: DiagnosisResult; 
    onClick: () => void;
    onDelete?: () => void;
}) => {
    const Icon = statusIcons[result.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <button
                onClick={onClick}
                className="w-full text-left glass-panel border border-white/5 rounded-[2rem] p-4 shadow-xl active:scale-[0.99] transition-all hover:bg-white/[0.03]"
            >
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/5 relative">
                        <img 
                            src={result.imageUrl} 
                            alt="Specimen" 
                            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 right-2">
                            <div className="w-5 h-5 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                                <Binary className="w-2.5 h-2.5 text-white/40" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${statusColors[result.status]}`}>
                                <Icon className="w-2.5 h-2.5" />
                                {result.status}
                            </span>
                            <div className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{result.crop}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white truncate tracking-tight mb-1 group-hover:text-primary transition-colors italic uppercase">
                            {result.commonName}
                        </h3>

                        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono tabular-nums">{format(result.timestamp, "MMM d")}</span>
                                <span className="text-[9px] opacity-40">/</span>
                                <span className="font-mono text-zinc-600">{format(result.timestamp, "HH:mm")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-white/40 uppercase text-[9px] font-black tracking-tighter">Conf:</span>
                                <span className="font-black text-primary uppercase">{(result.confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 mr-10 bg-white/5 rounded-full text-zinc-600 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </button>

            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-zinc-700 hover:text-destructive active:scale-90 transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </motion.div>
    );
};
