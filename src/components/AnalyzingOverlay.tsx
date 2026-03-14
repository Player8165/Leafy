import { motion } from "framer-motion";
import { useDiagnosticsContext } from "@/context/DiagnosticsContext";
import { Cpu, Cloud, Activity } from "lucide-react";

export const AnalyzingOverlay = () => {
    const { mode } = useDiagnosticsContext();
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="bg-card/90 backdrop-blur-md border border-primary/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden min-w-[300px]"
        >
            {/* Background scanning effect */}
            <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent ${mode === 'advanced' ? 'via-blue-500/10' : 'via-primary/5'} to-transparent pointer-events-none`}
            />

            {/* Flickering noise artifacts */}
            <motion.div 
                animate={{ opacity: [0, 0.1, 0, 0.2, 0] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute inset-0 bg-white/5 pointer-events-none"
            />

            <div className="flex flex-col gap-6 items-center text-center relative z-10">
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-muted-foreground/10"
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray="175"
                            initial={{ strokeDashoffset: 175 }}
                            animate={{ strokeDashoffset: [175, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={mode === 'advanced' ? 'text-blue-500' : 'text-primary'}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className={`w-6 h-6 ${mode === 'advanced' ? 'text-blue-500' : 'text-primary'} animate-pulse`} />
                    </div>
                </div>

                <div className="space-y-4 w-full">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {mode === 'advanced' ? (
                                <Cloud className="w-4 h-4 text-blue-400" />
                            ) : (
                                <Cpu className="w-4 h-4 text-primary" />
                            )}
                            <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic">
                                {mode === 'advanced' ? 'Groq AI Cluster' : 'Field Logic Processing'}
                            </h3>
                        </div>
                        <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest leading-relaxed">
                            {mode === 'advanced' 
                                ? 'Parsing Pathogen DNA & Spectroscopic data...' 
                                : 'Mapping Chlorophyll Disruption Patterns...'}
                        </p>
                    </div>

                    {/* Highly active flickering data bars */}
                    <div className="grid grid-cols-8 gap-1 h-6 px-4">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: "20%" }}
                                animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                                transition={{ 
                                    duration: 0.3 + (Math.random() * 0.5), 
                                    repeat: Infinity, 
                                    ease: "easeInOut",
                                    delay: i * 0.05
                                }}
                                className={`w-full rounded-full ${mode === 'advanced' ? 'bg-blue-500/40' : 'bg-primary/40'}`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center px-4 font-mono text-[8px] text-zinc-500 uppercase tracking-tighter">
                        <div className="flex gap-2">
                            <span>SENS: 98%</span>
                            <span>VAL: OK</span>
                        </div>
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                        >
                            DATA_SYNC_ACTIVE
                        </motion.span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
