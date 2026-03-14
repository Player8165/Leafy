import { motion } from "framer-motion";

export const ScanReticle = ({ isActive }: { isActive: boolean }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-64 h-64"
            >
                {/* Dynamic Corners */}
                {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                ].map((pos, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-8 h-8 border-primary/60 rounded-[4px] ${pos}`}
                        animate={isActive ? { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] } : {}}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}

                {/* Laser Scanning Line */}
                {isActive && (
                    <motion.div
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_hsla(var(--primary),0.8)]"
                    />
                )}

                {/* Digital Artifacts */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-primary/40 rounded-full" />
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-full h-[1px] bg-white/5"
                    />
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute h-full w-[1px] bg-white/5"
                    />
                </div>

                {/* Info Tags */}
                <div className="absolute -top-10 left-0">
                    <p className="text-[8px] font-mono text-primary/40 leading-none uppercase tracking-[0.2em]">Morphology Lock: Active</p>
                </div>
                <div className="absolute -bottom-10 right-0">
                    <p className="text-[8px] font-mono text-primary/40 leading-none uppercase tracking-[0.2em]">Sensor ID: CV-X80</p>
                </div>
            </motion.div>
        </div>
    );
};
