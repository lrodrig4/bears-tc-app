
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
        promptContext = `
        CONTEXT:
        - Training Phase: ${context.phase}
        - Workout Focus: ${context.focus}
        - Team Fatigue Level: ${context.fatigue}
        
        INSTRUCTION: Adjust the generated workout intensity and volume based on the fatigue level and phase. 
        If fatigue is 'High', reduce volume or intensity. 
        If phase is 'Taper', keep intensity high but volume low.
        `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: `You are an expert high school cross country and track coach.
      
      User Input: "${rawText}"
      
      ${promptContext}

      Task:
      1. If the input is a specific workout description (e.g. "5x1k @ T"), PARSE it into structured intervals.
      2. If the input is a request (e.g. "Create a 5k specific workout"), GENERATE a new appropriate workout based on the CONTEXT provided.

      Map terminology to these Zones:
      - "Recovery", "Warmup" -> "Recovery"
      - "Easy", "Base" -> "Foundation"
      - "Steady" -> "Steady"
      - "Tempo" -> "Tempo"
      - "Threshold", "CV" -> "Lactate Threshold" or "CV"
      - "Interval", "Hard", "VO2" -> "5K Race"
      - "Speed", "Rep" -> "1600m Race" or faster.

      Output must be JSON matching the schema.
      For generated workouts, give a catchy title and motivating description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short catchy title for the workout" },
            description: { type: Type.STRING, description: "A 1-sentence motivating summary or focus of the session" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  distance: { type: Type.NUMBER, description: "Distance value (e.g., 400, 1, 2)" },
                  unit: { type: Type.STRING, enum: ["m", "km", "mi"], description: "Unit of distance" },
                  reps: { type: Type.NUMBER, description: "Number of repetitions" },
                  zone: { 
                    type: Type.STRING, 
                    enum: [
                      "Recovery", 
                      "Foundation", 
                      "Steady", 
                      "Tempo", 
                      "Lactate Threshold", 
                      "CV", 
                      "5K Race",
                      "3200m Race",
                      "1600m Race",
                      "800m Race",
                      "400m Race"
                    ],
                    description: "The training intensity zone"
                  },
                  recovery: { type: Type.STRING, description: "Recovery instructions if present, e.g., '2 min rest'" }
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
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error parsing workout:", error);
    throw error;
  }
};

export const getCoachAdvice = async (workout: ParsedWorkout, pr: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `You are an elite high school running coach. The athlete has a 5k PR of ${pr}.
      The workout is: ${workout.title} - ${JSON.stringify(workout.items)}.
      Give a short, punchy paragraph of advice on how to execute this specific workout. Focus on pacing strategy and mental mindset. Keep it under 50 words.`,
    });
    return response.text || "Stay focused and hit your splits!";
  } catch (e) {
    return "Stay focused and run hard!";
  }
};
