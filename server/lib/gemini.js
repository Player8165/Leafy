import dotenv from "dotenv";

dotenv.config();

/**
 * Analyze agricultural image using Groq Vision (Llama 3.2 11B Vision)
 */
export async function analyzeImageWithGemini(base64Image) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Groq API key not configured");
    }

    try {
        const base64Data = base64Image.split(",")[1] || base64Image;

        const payload = {
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this agricultural specimen image (specifically focus on crop leaf health).
                                STRICT REQUIREMENT: Only provide a positive diagnosis if your confidence is 0.90 (90%) or higher.
                                If confidence is below 0.90, return "Inconclusive" in the commonName field.
                                
                                Provide a detailed diagnosis in JSON format following this exact structure:
                                {
                                    "commonName": "Common name of the disease or 'Healthy' or 'Inconclusive'",
                                    "scientificName": "Latin/Scientific name",
                                    "pathogen": "Specific pathogen type (Fungi, Virus, Bacteria, etc.)",
                                    "confidence": 0.95,
                                    "status": "healthy" | "infected" | "warning",
                                    "spreadRisk": "Low" | "Medium" | "High",
                                    "recommendedAction": "Immediate steps to take",
                                    "treatment": "Detailed agricultural protocol",
                                    "description": "Biological description of symptoms",
                                    "biologicalCycle": "How the pathogen reproduces/spreads",
                                    "favorableConditions": "Weather/Environment that triggers this",
                                    "crop": "Type of crop identified"
                                }
                                Ensure the response is ONLY the valid JSON object.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Groq Vision Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Groq Analysis System Error:", error.message);
        throw error;
    }
}

/**
 * Translate diagnostic report using Groq (Llama 3.3 70B)
 */
export async function translateResult(diagnosisData, targetLanguage) {
    if (!process.env.GROQ_API_KEY) throw new Error("Groq API Key missing");
    
    try {
        const { imageUrl, ...textData } = diagnosisData;

        const payload = {
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a professional agricultural translator. Translate the values in the provided JSON to the target language. KEEP THE JSON KEYS UNCHANGED. Return ONLY the translated JSON."
                },
                {
                    role: "user",
                    content: `Translate to ${targetLanguage}: ${JSON.stringify(textData)}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Groq Translation Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("Groq Translation System Error:", error.message);
        throw error;
    }
}
