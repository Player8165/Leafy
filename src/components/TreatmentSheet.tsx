import { motion, AnimatePresence } from "framer-motion";
import { DiagnosisResult } from "@/types/diagnosis";
import { X, FileText, AlertTriangle, Thermometer, Microscope, Zap, BookOpen, ClipboardCheck, Languages, Loader2 } from "lucide-react";
import { useDiagnosticsContext } from "@/context/DiagnosticsContext";
import { useState } from "react";

interface TreatmentSheetProps {
    result: DiagnosisResult | null;
    isOpen: boolean;
    onClose: () => void;
}

const languages = [
    { label: "English", value: "English" },
    { label: "Hindi", value: "Hindi" },
    { label: "Marathi", value: "Marathi" },
    { label: "Gujarati", value: "Gujarati" },
    { label: "Spanish", value: "Spanish" },
    { label: "French", value: "French" },
];

export const TreatmentSheet = ({ result, isOpen, onClose }: TreatmentSheetProps) => {
    const { translateCurrentResult, currentResult, state } = useDiagnosticsContext();
    const [isTranslating, setIsTranslating] = useState(false);

    // Use currentResult if it exists (for translated view), otherwise fallback to the prop result
    const activeResult = currentResult && (currentResult.id === result?.id || !currentResult.id) 
        ? currentResult 
        : result;

    if (!activeResult && !isOpen) return null;
    if (!activeResult) return null;

    const handleTranslate = async (lang: string) => {
        setIsTranslating(true);
        try {
            await translateCurrentResult(lang, result!);
        } catch (e) {
            console.error("Translation error:", e);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-md"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 250, damping: 30 }}
                        className="fixed inset-x-0 bottom-0 z-[70] bg-card rounded-t-[3rem] shadow-2xl max-h-[92vh] overflow-hidden flex flex-col border-t border-white/5"
                    >
                        {/* Pull Bar */}
                        <div className="w-16 h-1.5 bg-muted-foreground/10 rounded-full mx-auto my-4 flex-shrink-0" />

                        <div className="flex-1 overflow-y-auto px-8 pb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-[1.2rem] flex items-center justify-center">
                                        <ClipboardCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">Recovery Protocol</h2>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Biological Remediation Strategy</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Language Selector Overlay for Translation */}
                            <div className="mb-8 flex flex-wrap gap-2 items-center bg-white/5 p-4 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-2 mr-2 text-zinc-500">
                                    <Languages className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Language:</span>
                                </div>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        disabled={isTranslating}
                                        onClick={() => handleTranslate(lang.value)}
                                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all disabled:opacity-50"
                                    >
                                        {isTranslating && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-8">
                                {/* PRIMARY REMEDY SECTION - HIGHLIGHTED */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2.2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative p-6 bg-card border border-primary/20 rounded-[2rem]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap className="w-5 h-5 text-primary" />
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Immediate Action Required</h4>
                                        </div>
                                        <p className="text-xl font-bold text-foreground leading-tight mb-3">
                                            {activeResult.recommendedAction}
                                        </p>
                                        <div className="p-4 bg-primary/5 rounded-xl text-sm text-foreground/80 leading-relaxed border border-primary/10">
                                            {activeResult.treatment}
                                        </div>
                                    </div>
                                </div>

                                {/* TECHNICAL SPECS GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-secondary/30 rounded-[2rem] border border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Microscope className="w-4 h-4 text-muted-foreground" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pathogen Profile</h4>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">{activeResult.commonName}</h3>
                                        <p className="text-xs font-mono text-primary/60 italic">{activeResult.scientificName}</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-muted-foreground uppercase">Pathogen Type</span>
                                                <span className="font-bold text-foreground">{activeResult.pathogen}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-muted-foreground uppercase">Risk Factor</span>
                                                <span className={`font-bold ${activeResult.spreadRisk === 'High' ? 'text-destructive' : 'text-primary'}`}>{activeResult.spreadRisk}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-secondary/30 rounded-[2rem] border border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Thermometer className="w-4 h-4 text-muted-foreground" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Optimum Conditions</h4>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed text-foreground/70">
                                            {activeResult.favorableConditions}
                                        </p>
                                    </div>
                                </div>

                                {/* BIOLOGICAL CYCLE */}
                                <div className="p-6 bg-secondary/30 rounded-[2rem] border border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biological Life-Cycle</h4>
                                    </div>
                                    <p className="text-sm text-foreground/60 leading-relaxed indent-4">
                                        {activeResult.biologicalCycle}
                                    </p>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="p-6 bg-muted/20 rounded-[2rem]">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Extended Diagnostic Notes</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        "{activeResult.description}"
                                    </p>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
