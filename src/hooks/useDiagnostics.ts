import { useState, useCallback, useEffect } from "react";
import { DiagnosisResult, AnalysisState } from "@/types/diagnosis";
import { AiInferenceService } from "@/lib/ai";

const API_BASE = (import.meta.env.VITE_API_URL || "") + "/api";

type AnalysisMode = "standard" | "advanced";

async function saveDiagnosisToServer(result: DiagnosisResult): Promise<DiagnosisResult | null> {
    try {
        const res = await fetch(`${API_BASE}/diagnoses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result),
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

async function fetchHistoryFromServer(): Promise<DiagnosisResult[]> {
    try {
        const res = await fetch(`${API_BASE}/diagnoses`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((d: any) => ({
            ...d,
            id: d._id ?? d.id,
            timestamp: new Date(d.timestamp),
        }));
    } catch {
        return [];
    }
}

async function analyzeWithCloud(imageUrl: string): Promise<DiagnosisResult | null> {
    try {
        const res = await fetch(`${API_BASE}/diagnoses/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Cloud failure");
        }
        const data = await res.json();
        return {
            ...data,
            id: data._id ?? data.id,
            timestamp: new Date(data.timestamp),
        };
    } catch (error) {
        console.error("Cloud Analytics Error:", error);
        throw error;
    }
}

export function useDiagnostics() {
    const [state, setState] = useState<AnalysisState>("idle");
    const [mode, setMode] = useState<AnalysisMode>("standard");
    const [currentResult, setCurrentResult] = useState<DiagnosisResult | null>(null);
    const [history, setHistory] = useState<DiagnosisResult[]>([]);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistoryFromServer().then(serverHistory => {
            if (serverHistory.length > 0) setHistory(serverHistory);
        });
    }, []);

    const analyzeImage = useCallback(async (imageUrl: string, forcedMode?: AnalysisMode) => {
        setCapturedImage(imageUrl);
        setState("analyzing");
        setError(null);
        
        const activeMode = forcedMode || mode;

        try {
            // Simulated delay for 'Neural Processing' immersion
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (activeMode === "advanced") {
                // Cloud Analysis (Groq)
                const result = await analyzeWithCloud(imageUrl);
                if (!result) throw new Error("Cloud analysis returned no data");
                
                setCurrentResult(result);
                setHistory((prev) => [result, ...prev]);
                setState("complete");
            } else {
                // Local Analysis (TF.js)
                const img = new Image();
                img.src = imageUrl;
                await new Promise((resolve) => (img.onload = resolve));

                const aiResult = await AiInferenceService.analyze(img);

                const localResult: DiagnosisResult = {
                    id: crypto.randomUUID(),
                    imageUrl,
                    timestamp: new Date(),
                    commonName: aiResult.commonName!,
                    scientificName: aiResult.scientificName!,
                    pathogen: aiResult.pathogen!,
                    confidence: aiResult.confidence!,
                    status: aiResult.status!,
                    spreadRisk: aiResult.spreadRisk!,
                    recommendedAction: aiResult.recommendedAction!,
                    treatment: aiResult.treatment!,
                    description: aiResult.description!,
                    biologicalCycle: aiResult.biologicalCycle!,
                    favorableConditions: aiResult.favorableConditions!,
                    crop: aiResult.crop!,
                };

                const serverResult = await saveDiagnosisToServer(localResult);
                const result = serverResult ?? localResult;

                setCurrentResult(result);
                setHistory((prev) => [result, ...prev]);
                setState("complete");
            }
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Diagnostic engine failure");
            setState("idle");
        }
    }, [mode]);

    const translateCurrentResult = useCallback(async (targetLanguage: string, resultToTranslate?: DiagnosisResult) => {
        const target = resultToTranslate || currentResult;
        console.log("Translation requested for:", targetLanguage);
        
        if (!target) {
            console.warn("Translation aborted: No result to translate");
            return;
        }
        
        setState("analyzing");
        try {
            const res = await fetch(`${API_BASE}/diagnoses/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    diagnosisData: target,
                    targetLanguage
                }),
            });

            if (!res.ok) throw new Error("Translation failed");
            const translated = await res.json();
            
            const updatedResult = {
                ...translated,
                imageUrl: target.imageUrl,
                timestamp: target.timestamp,
                id: target.id
            };

            // Update state so the UI reflects the translation
            setCurrentResult(updatedResult);
            
            // If we are translating a history item, we don't necessarily want to 
            // overwrite the original in the database unless the user requested it,
            // but for now, we just update the local view state.
            
            setState("complete");
        } catch (err: any) {
            setError(err.message);
            setState("complete");
        }
    }, [currentResult]);

    const deleteDiagnosis = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/diagnoses/${id}`, { method: "DELETE" });
            if (res.ok) {
                setHistory(prev => prev.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }, []);

    const clearAllHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/diagnoses`, { method: "DELETE" });
            if (res.ok) {
                setHistory([]);
            }
        } catch (err) {
            console.error("Clear all failed:", err);
        }
    }, []);

    const reset = useCallback(() => {
        setState("idle");
        setCurrentResult(null);
        setCapturedImage(null);
        setError(null);
    }, []);

    const toggleMode = useCallback(() => {
        setMode(prev => prev === "standard" ? "advanced" : "standard");
    }, []);

    return { 
        state, 
        mode, 
        currentResult, 
        history, 
        capturedImage, 
        error,
        setError,
        analyzeImage,
        translateCurrentResult,
        deleteDiagnosis,
        clearAllHistory,
        reset,
        toggleMode 
    };
}
