import { HistoryCard } from "@/components/HistoryCard";
import { TreatmentSheet } from "@/components/TreatmentSheet";
import { useDiagnosticsContext } from "@/context/DiagnosticsContext";
import { DiagnosisResult } from "@/types/diagnosis";
import { useState } from "react";
import { Microscope, Database, ArrowLeft, Search, Trash2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
    const { history, deleteDiagnosis, clearAllHistory, reset } = useDiagnosticsContext();
    const [selected, setSelected] = useState<DiagnosisResult | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredHistory = history.filter(item => 
        item.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.crop.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClearAll = () => {
        if (window.confirm("CRITICAL: This will permanently wipe all diagnostic logs from the registry. Proceed?")) {
            clearAllHistory();
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Glossy Header Area */}
            <header className="px-6 pt-12 pb-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate("/")}
                        className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-zinc-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    
                    <div className="flex items-center gap-4">
                        {history.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-full text-destructive text-[9px] font-black uppercase tracking-widest hover:bg-destructive/20 transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear Archive
                            </motion.button>
                        )}
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Sync: OK</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">Field Registry</h1>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Historical Pathogen Ledger</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                        type="text"
                        placeholder="Filter by crop or disease..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-zinc-700"
                    />
                </div>
            </header>

            <div className="px-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredHistory.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[3rem] border-white/5"
                        >
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center border border-primary/20"
                                >
                                    <Database className="w-8 h-8 text-primary/40" />
                                </motion.div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                                    <Microscope className="w-3 h-3 text-zinc-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 italic uppercase">Registry Empty</h3>
                            <p className="text-xs text-zinc-500 max-w-[180px] leading-relaxed mb-8">
                                No diagnostic payloads have been committed to the archive.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/")}
                                className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/5"
                            >
                                Initialize Sensor
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredHistory.map((result, idx) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    layout
                                >
                                    <HistoryCard 
                                        result={result} 
                                        onClick={() => setSelected(result)} 
                                        onDelete={() => {
                                            if (window.confirm("Delete entry?")) deleteDiagnosis(result.id);
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <TreatmentSheet 
                result={selected} 
                isOpen={!!selected} 
                onClose={() => {
                    setSelected(null);
                    reset();
                }} 
            />
        </div>
    );
}
