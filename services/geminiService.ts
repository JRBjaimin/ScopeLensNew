
import { GoogleGenAI, Type } from "@google/genai";
import { MilestoneEntry, ProjectData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseFileWithGemini = async (
  fileBase64: string,
  mimeType: string,
  fileName: string
): Promise<ProjectData> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType,
          },
        },
        {
          text: `Extract project milestone data from the provided document. 
          Return a JSON object strictly following this schema:
          - milestones: array of objects with { milestone: string, title: string, scope: string, tasks: array of strings, exclusions: array of strings, estimatedHours: number, priceEstimate: number }
          - totalBallpark: (optional) object with { hours: number, price: number }
          
          Guidelines for Extraction:
          1. 'milestone': Extract the exact text from the FIRST column of the milestone table (usually IDs like "Milestone 1", "M1", etc).
          2. 'title': Extract the exact text from the SECOND column of the milestone table (the descriptive name/title of that phase).
          3. 'scope': Detailed description text for the work phase.
          4. 'tasks': Specific itemized tasks.
          5. 'exclusions': Items explicitly listed as out of scope.
          6. 'estimatedHours' & 'priceEstimate': Numerical values only.
          `
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                milestone: { type: Type.STRING },
                title: { type: Type.STRING },
                scope: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                exclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedHours: { type: Type.NUMBER },
                priceEstimate: { type: Type.NUMBER },
              },
              required: ["milestone", "title", "scope", "tasks", "exclusions", "estimatedHours", "priceEstimate"],
            },
          },
          totalBallpark: {
            type: Type.OBJECT,
            properties: {
              hours: { type: Type.NUMBER },
              price: { type: Type.NUMBER },
            },
          },
        },
        required: ["milestones"],
      },
    },
  });

  const parsedJson = JSON.parse(response.text || "{}");
  
  return {
    fileName,
    uploadDate: new Date().toISOString(),
    milestones: parsedJson.milestones.map((m: any, idx: number) => ({
      ...m,
      id: `m-${idx}`
    })),
    totalBallpark: parsedJson.totalBallpark,
  };
};
