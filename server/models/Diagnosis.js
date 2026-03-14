import mongoose from "mongoose";

const DiagnosisSchema = new mongoose.Schema(
    {
        commonName: { type: String, required: true },
        scientificName: { type: String, required: true },
        pathogen: { type: String, required: true },
        confidence: { type: Number, required: true, min: 0, max: 1 },
        status: {
            type: String,
            required: true,
            enum: ["healthy", "infected", "warning"],
        },
        spreadRisk: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"],
        },
        recommendedAction: { type: String, required: true },
        treatment: { type: String, required: true },
        description: { type: String, required: true },
        biologicalCycle: { type: String },
        favorableConditions: { type: String },
        imageUrl: { type: String, required: true },
        crop: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Diagnosis = mongoose.model("Diagnosis", DiagnosisSchema);
