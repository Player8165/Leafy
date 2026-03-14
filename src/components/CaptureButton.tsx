import { motion } from "framer-motion";

interface CaptureButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const CaptureButton = ({ onClick, disabled }: CaptureButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: 0.92 }}
            className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale"
        >
            {/* Outer Ring Animation */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Glowing Ring */}
            <div className="absolute inset-2 rounded-full border-2 border-primary/40 shadow-[0_0_15px_hsla(var(--primary),0.2)]" />

            {/* Main Shutter Button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl group-active:bg-zinc-200 transition-colors"
                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
            >
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                </div>
            </motion.div>

            {/* Aperture Blades Simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-active:opacity-100 transition-opacity">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-black/10 rotate-45" />
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-black/10 -rotate-45" />
            </div>
        </motion.button>
    );
};
