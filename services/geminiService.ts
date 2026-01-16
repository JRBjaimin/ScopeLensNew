import { ProjectData } from "../types";

const getApiKey = (): string | null => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    null
  );
};

// Validate API key format (Gemini API keys usually start with AIza)
const validateApiKey = (key: string | null): boolean => {
  if (!key) return false;
  if (key === "your_api_key_here") return false;
  if (!key.startsWith("AIza")) {
    console.warn(
      "API key format may be incorrect. Gemini API keys typically start with 'AIza'"
    );
  }
  return true;
};

// Helper function to get available models
const getAvailableModels = async (apiKey: string): Promise<string[]> => {
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
  // Get API key
  const apiKey = getApiKey();

  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Error(
      "Gemini API key is required. Please set VITE_GEMINI_API_KEY in your environment variables. " +
        "For Vercel: Go to Project Settings > Environment Variables and add VITE_GEMINI_API_KEY"
    );
  }

  // Get available models first
  const availableModels = await getAvailableModels(apiKey);

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
- columnHeaders: (optional) array of strings representing the detected column headers from the milestone table (e.g., ["Milestone", "Title", "Scope", "Tasks", "Hours", "Price"])

Guidelines for Extraction:
1. 'milestone': ALWAYS extract the exact text from the FIRST column of the milestone table (usually IDs like "Milestone 1", "M1", etc). This is mandatory for all rows.
2. 'title': Extract the exact text from the SECOND column ONLY if:
   - The second column header is "Title" or contains "Title" (case-insensitive, e.g., "Title", "title", "TITEL", "Project Title", "Milestone Title", etc.)
   - AND the cell has actual data (not empty/null)
   - If the second column header is NOT "Title" or the cell is empty, set 'title' to an empty string ""
3. 'scope': Detailed description text for the work phase.
4. 'tasks': Specific itemized tasks.
5. 'exclusions': Items explicitly listed as out of scope.
6. 'estimatedHours' & 'priceEstimate': Numerical values only.
7. 'columnHeaders': (optional) Extract the actual column headers from the milestone table as an array of strings. The first element should be the header of the first column (e.g., "Milestone", "Phase", "M1", etc.).

Important: Always extract 'milestone' from column 1. Only extract 'title' from column 2 if the column header indicates it's a title column and the cell has data. Include 'columnHeaders' array if you can identify the table headers.`;

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
              columnHeaders: {
                type: "ARRAY",
                items: { type: "STRING" },
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
        columnHeaders: parsedJson.columnHeaders || [],
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
