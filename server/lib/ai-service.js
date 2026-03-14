import dotenv from "dotenv";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─────────────────────────────────────────────────────────────────────────────
// Vision Model: meta-llama/llama-4-scout-17b-16e-instruct
//   - Official Groq replacement for both llama-3.2-11b and 90b vision models
//   - Supports image_url in multimodal content
//   - Source: https://console.groq.com/docs/vision
//
// Translation Model: llama-3.3-70b-versatile
//   - Current stable Groq text model, high quota, best multilingual accuracy
// ─────────────────────────────────────────────────────────────────────────────

const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const TRANSLATION_MODEL = "llama-3.3-70b-versatile";

const DIAGNOSIS_PROMPT = `You are an expert agricultural pathologist AI.
Analyze the provided crop leaf image carefully.

STRICT RULES:
- Only confirm a disease/health status if your confidence is >= 0.90 (90%).
- If confidence is below 0.90, use "Inconclusive" as the commonName.
- Return ONLY a raw JSON object — no markdown, no explanation, no code fences.

Required JSON structure:
{
  "commonName": "Disease common name, or 'Healthy', or 'Inconclusive'",
  "scientificName": "Latin/scientific name of the pathogen or 'N/A'",
  "pathogen": "Pathogen type: Fungi | Virus | Bacteria | Pest | Physiological | N/A",
  "confidence": 0.95,
  "status": "healthy",
  "spreadRisk": "Low",
  "recommendedAction": "Immediate action the farmer should take",
  "treatment": "Detailed agricultural treatment protocol",
  "description": "Clinical description of visible symptoms",
  "biologicalCycle": "How the pathogen reproduces and spreads in the field",
  "favorableConditions": "Environmental conditions that trigger this disease",
  "crop": "Type of crop in the image"
}

Valid enum values:
- status: "healthy" | "infected" | "warning"
- spreadRisk: "Low" | "Medium" | "High"`;

// ─────────────────────────────────────────────────────────────────────────────
// Internal: POST request helper for Groq API
// ─────────────────────────────────────────────────────────────────────────────
async function groqPost(payload) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("[GROQ-SERVICE] Missing API Key");
        throw new Error("GROQ_API_KEY environment variable is not set.");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errMsg = `Groq API Error (${response.status})`;
        try {
            const errBody = await response.json();
            console.error("[GROQ-SERVICE] API Response Error:", JSON.stringify(errBody, null, 2));
            errMsg = errBody?.error?.message || errMsg;
        } catch (_) { /* ignore parse errors */ }
        throw new Error(errMsg);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || content.trim() === "") {
        console.error("[GROQ-SERVICE] Received empty content from model");
        throw new Error("Groq returned an empty response. The image may be unclear or unsupported.");
    }

    return content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Extract clean JSON from a model response string
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON(rawText) {
    // Strip markdown code fences if the model wraps the JSON
    const stripped = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

    // Find outermost { ... }
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("No valid JSON object found in the AI response.");
    }

    const jsonStr = stripped.slice(start, end + 1);
    return JSON.parse(jsonStr);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Analyze a crop image
// Accepts base64 (with or without data URI prefix)
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeImage(base64Image) {
    // Strip data URI prefix if present, then reconstruct a valid data URL
    const base64Data = base64Image.includes(",")
        ? base64Image.split(",")[1]
        : base64Image;

    const dataUrl = `data:image/jpeg;base64,${base64Data}`;

    const payload = {
        model: VISION_MODEL,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: DIAGNOSIS_PROMPT
                    },
                    {
                        type: "image_url",
                        image_url: { url: dataUrl }
                    }
                ]
            }
        ],
        // Do NOT use response_format json_object with vision model — it can conflict.
        // Instead we extract JSON manually which is more robust.
        temperature: 0.1,
        max_tokens: 1024
    };

    try {
        const raw = await groqPost(payload);
        return extractJSON(raw);
    } catch (error) {
        console.error("[AI-SERVICE] Image analysis failed:", error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Translate a diagnosis report into the target language
// ─────────────────────────────────────────────────────────────────────────────
export async function translateResult(diagnosisData, targetLanguage) {
    // Strip image payload — it would bloat the request for no reason
    const { imageUrl, _id, id, __v, timestamp, ...textData } = diagnosisData;

    const payload = {
        model: TRANSLATION_MODEL,
        messages: [
            {
                role: "system",
                content: `You are a professional agricultural translator specializing in ${targetLanguage}.
Translate ONLY the string values in the provided JSON object into ${targetLanguage}.
Do NOT translate or rename the JSON keys.
Do NOT add extra fields.
Return ONLY a valid JSON object with no markdown and no explanation.`
            },
            {
                role: "user",
                content: JSON.stringify(textData)
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2048
    };

    try {
        const raw = await groqPost(payload);
        return extractJSON(raw);
    } catch (error) {
        console.error("[AI-SERVICE] Translation failed:", error.message);
        throw error;
    }
}
