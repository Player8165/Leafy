import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const apiKey = process.env.GROQ_API_KEY;
const model = "meta-llama/llama-4-scout-17b-16e-instruct";

async function test() {
    console.log("Testing Groq API...");
    console.log("Model:", model);
    
    if (!apiKey) {
        console.error("ERROR: GROQ_API_KEY is missing in .env");
        return;
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: "Say hello" }],
                max_tokens: 10
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("SUCCESS! Response:", data.choices[0].message.content);
        } else {
            console.log("FAILED!");
            console.log("Status:", response.status);
            console.log("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
    }
}

test();
