import { createContext, useContext, ReactNode } from "react";
import { useDiagnostics } from "@/hooks/useDiagnostics";

type DiagnosticsContextType = ReturnType<typeof useDiagnostics>;

const DiagnosticsContext = createContext<DiagnosticsContextType | null>(null);

export function DiagnosticsProvider({ children }: { children: ReactNode }) {
    const diagnostics = useDiagnostics();
    return (
        <DiagnosticsContext.Provider value={diagnostics}>
            {children}
        </DiagnosticsContext.Provider>
    );
}

export function useDiagnosticsContext() {
    const ctx = useContext(DiagnosticsContext);
    if (!ctx) throw new Error("useDiagnosticsContext must be used within DiagnosticsProvider");
    return ctx;
}
