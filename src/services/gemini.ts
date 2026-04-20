import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type DetectionResult = {
  category: "Hate Speech" | "Offensive Language" | "No Hate and Offensive";
  confidence: number;
  reasoning: string;
};

export async function detectHateSpeech(text: string): Promise<DetectionResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text for hate speech or offensive language:
    
    "${text}"
    
    Classify it into ONE of these categories:
    - Hate Speech: Language that attacks, threatens, or insults a group based on attributes like race, religion, sexual orientation, etc.
    - Offensive Language: Profanity or disrespectful language that doesn't necessarily target a protected group.
    - No Hate and Offensive: Neutral, positive, or clean language.
    
    Provide your answer in strict JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: ["Hate Speech", "Offensive Language", "No Hate and Offensive"],
            description: "The classification of the text.",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0 and 1.",
          },
          reasoning: {
            type: Type.STRING,
            description: "A brief one-sentence reason for this classification.",
          },
        },
        required: ["category", "confidence", "reasoning"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}") as DetectionResult;
  return result;
}
