export interface DiagnosisResult {
    id: string;
    commonName: string;
    scientificName: string;
    pathogen: string;
    confidence: number;
    status: "healthy" | "infected" | "warning";
    spreadRisk: "Low" | "Medium" | "High";
    recommendedAction: string;
    treatment: string;
    description: string;
    biologicalCycle: string;
    favorableConditions: string;
    imageUrl: string;
    timestamp: Date;
    crop: string;
}

export type AnalysisState = "idle" | "capturing" | "analyzing" | "complete";
