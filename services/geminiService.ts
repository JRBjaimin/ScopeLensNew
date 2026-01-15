import { ProjectData } from "../types";

const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "VITE_GEMINI_API_KEY is not set. Please add your Gemini API key to .env file"
  );
  throw new Error(
    "Gemini API key is required. Please set VITE_GEMINI_API_KEY in your .env file"
  );
}

// Validate API key format (Gemini API keys usually start with AIza)
if (apiKey && !apiKey.startsWith("AIza") && apiKey !== "your_api_key_here") {
  console.warn(
    "API key format may be incorrect. Gemini API keys typically start with 'AIza'"
  );
}

// Helper function to get available models
const getAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      console.warn("Could not list models, will use defaults");
      return [];
    }

    const data = await response.json();
    const models = data.models || [];

    // Filter models that support generateContent
    const availableModels = models
      .filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: any) => m.name?.replace("models/", "") || m.name)
      .filter(Boolean);

    console.log("Available models:", availableModels);
    return availableModels;
  } catch (error) {
    console.warn("Error listing models:", error);
    return [];
  }
};

export const parseFileWithGemini = async (
  fileBase64: string,
  mimeType: string,
  fileName: string
): Promise<ProjectData> => {
  // Get available models first
  const availableModels = await getAvailableModels();

  // Fallback models if listing fails
  const fallbackModels = [
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
  ];

  // Use available models if found, otherwise use fallbacks
  const modelsToTry =
    availableModels.length > 0 ? availableModels : fallbackModels;

  const prompt = `Extract project milestone data from the provided document. 
Return a JSON object strictly following this schema:
- milestones: array of objects with { milestone: string, title: string, scope: string, tasks: array of strings, exclusions: array of strings, estimatedHours: number, priceEstimate: number }
- totalBallpark: (optional) object with { hours: number, price: number }

Guidelines for Extraction:
1. 'milestone': Extract the exact text from the FIRST column of the milestone table (usually IDs like "Milestone 1", "M1", etc).
2. 'title': Extract the exact text from the SECOND column of the milestone table (the descriptive name/title of that phase).
3. 'scope': Detailed description text for the work phase.
4. 'tasks': Specific itemized tasks.
5. 'exclusions': Items explicitly listed as out of scope.
6. 'estimatedHours' & 'priceEstimate': Numerical values only.`;

  let lastError: any = null;

  // Try each model until one works using REST API
  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}`);

      // Use REST API directly for better compatibility
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: fileBase64,
                  mimeType: mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              milestones: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    milestone: { type: "STRING" },
                    title: { type: "STRING" },
                    scope: { type: "STRING" },
                    tasks: { type: "ARRAY", items: { type: "STRING" } },
                    exclusions: { type: "ARRAY", items: { type: "STRING" } },
                    estimatedHours: { type: "NUMBER" },
                    priceEstimate: { type: "NUMBER" },
                  },
                  required: [
                    "milestone",
                    "title",
                    "scope",
                    "tasks",
                    "exclusions",
                    "estimatedHours",
                    "priceEstimate",
                  ],
                },
              },
              totalBallpark: {
                type: "OBJECT",
                properties: {
                  hours: { type: "NUMBER" },
                  price: { type: "NUMBER" },
                },
              },
            },
            required: ["milestones"],
          },
        },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const responseData = await response.json();
      const text =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsedJson = JSON.parse(text || "{}");

      return {
        fileName,
        uploadDate: new Date().toISOString(),
        milestones: parsedJson.milestones.map((m: any, idx: number) => ({
          ...m,
          id: `m-${idx}`,
        })),
        totalBallpark: parsedJson.totalBallpark,
      };
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model
      continue;
    }
  }

  // If all models failed, throw the last error
  console.error("All models failed. Last error:", lastError);
  throw new Error(
    `Failed to parse file with any available model: ${
      lastError?.message || "Unknown error"
    }`
  );
};
