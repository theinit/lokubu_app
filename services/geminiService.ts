import { GoogleGenAI } from "@google/genai";
import { AITravelPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTravelPlan = async (userInput: string): Promise<AITravelPlan> => {
  const prompt = `You are an expert travel planner for a collaborative tourism platform. A user wants a travel plan based on their interests. Based on the following prompt, generate a 3-day travel itinerary. For each day, provide a title, a short description, and 3-4 suggested activities with details. Respond ONLY with a valid JSON object in the following format: \`{ "title": "Trip to [Location]", "itinerary": [ { "day": 1, "title": "Day 1 Title", "description": "...", "activities": [ {"name": "Activity 1", "description": "..."} ] } ] }\`. User prompt: "${userInput}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr) as AITravelPlan;

    // Basic validation to ensure the structure is as expected
    if (parsedData && parsedData.title && Array.isArray(parsedData.itinerary)) {
      return parsedData;
    } else {
      throw new Error("Invalid data structure received from API.");
    }
  } catch (error) {
    console.error("Failed to generate travel plan:", error);
    if (error instanceof Error) {
        throw new Error(`There was an issue generating your travel plan: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the travel plan.");
  }
};