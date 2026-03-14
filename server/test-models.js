import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const output = data.models ? data.models.map(m => m.name).join("\n") : JSON.stringify(data);
        fs.writeFileSync("models_list.txt", output);
        console.log("Models list written to models_list.txt");
    } catch (error) {
        fs.writeFileSync("models_list.txt", "Error: " + error.message);
    }
}

listModels();
