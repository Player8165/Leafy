import { ScanLine, History, LayoutGrid, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
    { path: "/", icon: ScanLine, label: "Scan" },
    { path: "/history", icon: History, label: "Log" },
];

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-6 inset-x-4 z-[60] flex justify-center">
            <div className="flex items-center gap-1 bg-zinc-950/70 backdrop-blur-2xl border border-white/10 px-2 py-2 rounded-[2rem] shadow-2xl shadow-black/50">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className="relative flex flex-col items-center justify-center w-20 h-14 transition-all"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-bg"
                                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`w-5 h-5 mb-0.5 z-10 transition-all ${isActive ? "text-primary scale-110" : "text-zinc-500"}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest z-10 transition-all ${isActive ? "text-primary" : "text-zinc-500"}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
