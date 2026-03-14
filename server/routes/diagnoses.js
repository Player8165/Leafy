import express from "express";
import { Diagnosis } from "../models/Diagnosis.js";
import { analyzeImage, translateResult } from "../lib/ai-service.js";

const router = express.Router();


// GET /api/diagnoses — list all diagnoses, newest first
router.get("/", async (req, res) => {
    try {
        const diagnoses = await Diagnosis.find().sort({ timestamp: -1 });
        res.json(diagnoses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch diagnoses" });
    }
});

// GET /api/diagnoses/:id — get a single diagnosis
router.get("/:id", async (req, res) => {
    try {
        const diagnosis = await Diagnosis.findById(req.params.id);
        if (!diagnosis) return res.status(404).json({ error: "Not found" });
        res.json(diagnosis);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch diagnosis" });
    }
});

// POST /api/diagnoses — save a new diagnosis result
router.post("/", async (req, res) => {
    try {
        const {
            commonName,
            scientificName,
            pathogen,
            confidence,
            status,
            spreadRisk,
            recommendedAction,
            treatment,
            description,
            biologicalCycle,
            favorableConditions,
            imageUrl,
            crop,
            timestamp,
        } = req.body;

        const diagnosis = new Diagnosis({
            commonName,
            scientificName,
            pathogen,
            confidence,
            status,
            spreadRisk,
            recommendedAction,
            treatment,
            description,
            biologicalCycle,
            favorableConditions,
            imageUrl,
            crop,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        });

        const saved = await diagnosis.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to save diagnosis", detail: err.message });
    }
});

// POST /api/diagnoses/analyze — Advanced Groq Vision Diagnosis
router.post("/analyze", async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            console.error("Analysis blocked: No image data provided");
            return res.status(400).json({ error: "Image data (base64) required" });
        }

        console.log("-----------------------------------------");
        console.log(`[${new Date().toLocaleTimeString()}] ADVANCED ENGINE: Starting Analysis...`);
        
        const result = await analyzeImage(imageUrl);
        console.log(`[${new Date().toLocaleTimeString()}] ADVANCED ENGINE: Success - ${result.commonName}`);
        
        // Auto-save the cloud result to MongoDB
        const diagnosis = new Diagnosis({
            ...result,
            imageUrl,
            timestamp: new Date()
        });
        
        const saved = await diagnosis.save();
        console.log(`[${new Date().toLocaleTimeString()}] DATABASE: Entry saved (ID: ${saved._id})`);
        console.log("-----------------------------------------");
        
        res.json(saved);
    } catch (err) {
        console.error("-----------------------------------------");
        console.error(`[${new Date().toLocaleTimeString()}] ADVANCED ENGINE FAILURE:`, err.message);
        console.error("-----------------------------------------");
        res.status(500).json({ error: err.message || "Cloud analysis failed" });
    }
});

// POST /api/diagnoses/translate — Translate a result
router.post("/translate", async (req, res) => {
    try {
        const { diagnosisData, targetLanguage } = req.body;
        if (!diagnosisData || !targetLanguage) {
            return res.status(400).json({ error: "Data and language required" });
        }

        console.log(`[${new Date().toLocaleTimeString()}] TRANSLATION: Processing for ${targetLanguage}...`);
        console.log("Input Data Size:", JSON.stringify(diagnosisData).length);
        // Translation is now handled by Groq 70B
        const translated = await translateResult(diagnosisData, targetLanguage);
        
        console.log("Translation successful");
        res.json(translated);
    } catch (err) {
        console.error("Translation Route Error:", err.message);
        res.status(500).json({ error: err.message || "Translation failed" });
    }
});


// DELETE /api/diagnoses/:id — remove a diagnosis
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Diagnosis.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete diagnosis" });
    }
});

// DELETE /api/diagnoses — clear all diagnoses
router.delete("/", async (req, res) => {
    try {
        await Diagnosis.deleteMany({});
        res.json({ message: "All diagnoses cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to clear diagnoses" });
    }
});

export default router;
