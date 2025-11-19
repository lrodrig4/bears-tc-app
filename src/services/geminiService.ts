import { GoogleGenAI, Type } from "@google/genai";
import { ParsedWorkout } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseWorkoutWithAI = async (
  rawText: string, 
  context?: { phase: string, focus: string, fatigue: string }
): Promise<ParsedWorkout> => {
  try {
    const model = "gemini-2.5-flash";
    let promptContext = "";
    if (context) {
        promptContext = `CONTEXT: Phase: ${context.phase}, Focus: ${context.focus}, Fatigue: ${context.fatigue}. Adjust accordingly.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: `Expert XC coach. Input: "${rawText}". ${promptContext}. 
      Task: Parse specific workout OR Generate new one.
      Map terms: Recovery, Foundation, Steady, Tempo, Lactate Threshold, CV, 5K Race, 3200m Race, 1600m Race.
      Output JSON matching schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  distance: { type: Type.NUMBER },
                  unit: { type: Type.STRING, enum: ["m", "km", "mi"] },
                  reps: { type: Type.NUMBER },
                  zone: { type: Type.STRING, enum: ["Recovery", "Foundation", "Steady", "Tempo", "Lactate Threshold", "CV", "5K Race", "3200m Race", "1600m Race", "800m Race", "400m Race"] },
                  recovery: { type: Type.STRING }
                },
                required: ["distance", "unit", "reps", "zone"]
              }
            }
          },
          required: ["title", "description", "items"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ParsedWorkout;
    }
    throw new Error("No response");
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

export const getCoachAdvice = async (workout: ParsedWorkout, pr: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Coach advice for 5k PR ${pr}. Workout: ${workout.title}. Short punchy tip <50 words.`,
    });
    return response.text || "Run hard!";
  } catch (e) {
    return "Run hard!";
  }
};