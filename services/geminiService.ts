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

    let jsonStr = response.text?.trim() || '';
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

export const generateExperienceImage = async (title: string, description: string, location: string): Promise<string> => {
  const prompt = `Generate a beautiful, high-quality image for a travel experience with the following details:
  Title: ${title}
  Description: ${description}
  Location: ${location}
  
  The image should be vibrant, inviting, and capture the essence of this local experience. It should be suitable for use as a thumbnail in a travel platform.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }]
    });

    // For now, we'll return a placeholder URL since Gemini doesn't generate actual images
    // In a real implementation, you would use a service like DALL-E, Midjourney, or Stable Diffusion
    const imagePrompt = response.text?.trim() || '';
    
    // Generate a unique placeholder image URL based on the content
    const hash = btoa(encodeURIComponent(title + description + location)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `https://picsum.photos/400/300?random=${hash}`;
    
  } catch (error) {
    console.error("Failed to generate experience image:", error);
    // Return a default placeholder image
    return "https://picsum.photos/400/300?random=default";
  }
};