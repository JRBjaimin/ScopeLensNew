import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import { ProjectData } from "../types";

// Configure PDF.js worker - use local worker file from public folder
// Fallback to CDN if local file not available
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
} catch (error) {
  // Fallback to jsdelivr CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Client-side parser - Completely FREE, no API calls, no billing
 * Parses Excel and PDF files directly in the browser
 */
export const parseFileClientSide = async (file: File): Promise<ProjectData> => {
  const fileName = file.name;
  const fileType = file.type;

  if (
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  ) {
    return parseExcelFile(file);
  } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return parsePDFFile(file);
  } else {
    throw new Error(
      "Unsupported file type. Please upload Excel (.xlsx, .xls) or PDF files."
    );
  }
};

const parseExcelFile = async (file: File): Promise<ProjectData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        // Parse the data to extract milestones
        const milestones = extractMilestonesFromExcel(jsonData);

        // Calculate totals
        const totalHours = milestones.reduce(
          (sum, m) => sum + m.estimatedHours,
          0
        );
        const totalPrice = milestones.reduce(
          (sum, m) => sum + m.priceEstimate,
          0
        );

        resolve({
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          milestones,
          totalBallpark: {
            hours: totalHours,
            price: totalPrice,
          },
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const parsePDFFile = async (file: File): Promise<ProjectData> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure worker is configured
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
      }).promise;

      let fullText = "";

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      // Parse the extracted text to find milestones
      const milestones = extractMilestonesFromPDF(fullText);

      // Calculate totals
      const totalHours = milestones.reduce(
        (sum, m) => sum + m.estimatedHours,
        0
      );
      const totalPrice = milestones.reduce(
        (sum, m) => sum + m.priceEstimate,
        0
      );

      resolve({
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        milestones,
        totalBallpark: {
          hours: totalHours,
          price: totalPrice,
        },
      });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error("PDF parsing error:", errorMessage);

      // Provide helpful error message
      if (
        errorMessage.includes("worker") ||
        errorMessage.includes("Failed to fetch")
      ) {
        reject(
          new Error(
            "PDF worker failed to load. Please refresh the page and try again. " +
              "If the issue persists, the PDF file may be corrupted or encrypted."
          )
        );
      } else {
        reject(new Error(`Failed to parse PDF file: ${errorMessage}`));
      }
    }
  });
};

const extractMilestonesFromExcel = (data: any[][]): any[] => {
  const milestones: any[] = [];

  if (!data || data.length === 0) {
    return [];
  }

  // Find header row (look for common milestone table headers)
  let headerRowIndex = -1;
  const headerKeywords = [
    "milestone",
    "title",
    "scope",
    "task",
    "hour",
    "price",
    "cost",
    "estimate",
  ];

  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    const rowText = row.join(" ").toLowerCase();
    if (headerKeywords.some((keyword) => rowText.includes(keyword))) {
      headerRowIndex = i;
      break;
    }
  }

  // If no header found, assume first row is header
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headers = data[headerRowIndex] || [];

  // Find column indices
  const milestoneCol = findColumnIndex(headers, [
    "milestone",
    "m",
    "id",
    "phase",
  ]);
  const titleCol = findColumnIndex(headers, [
    "title",
    "name",
    "description",
    "phase name",
  ]);
  const scopeCol = findColumnIndex(headers, [
    "scope",
    "description",
    "details",
    "work",
  ]);
  const tasksCol = findColumnIndex(headers, [
    "task",
    "tasks",
    "deliverable",
    "deliverables",
  ]);
  const hoursCol = findColumnIndex(headers, [
    "hour",
    "hours",
    "effort",
    "time",
    "estimated hours",
  ]);
  const priceCol = findColumnIndex(headers, [
    "price",
    "cost",
    "estimate",
    "budget",
    "amount",
    "price estimate",
  ]);
  const exclusionsCol = findColumnIndex(headers, [
    "exclusion",
    "exclusions",
    "out of scope",
    "not included",
  ]);

  // Parse data rows
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const milestone =
      milestoneCol >= 0 ? String(row[milestoneCol] || "").trim() : "";
    const title = titleCol >= 0 ? String(row[titleCol] || "").trim() : "";

    // Skip empty rows
    if (!milestone && !title) continue;

    // Extract tasks (could be comma-separated or in separate cells)
    let tasks: string[] = [];
    if (tasksCol >= 0) {
      const tasksValue = row[tasksCol];
      if (typeof tasksValue === "string") {
        tasks = tasksValue
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      } else if (Array.isArray(tasksValue)) {
        tasks = tasksValue.map((t) => String(t).trim()).filter((t) => t);
      }
    }

    // Extract exclusions
    let exclusions: string[] = [];
    if (exclusionsCol >= 0) {
      const exclusionsValue = row[exclusionsCol];
      if (typeof exclusionsValue === "string") {
        exclusions = exclusionsValue
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e);
      }
    }

    const scope = scopeCol >= 0 ? String(row[scopeCol] || "").trim() : title;
    const estimatedHours =
      hoursCol >= 0 ? parseFloat(String(row[hoursCol] || "0")) || 0 : 0;
    const priceEstimate =
      priceCol >= 0
        ? parseFloat(String(row[priceCol] || "0").replace(/[^0-9.]/g, "")) || 0
        : 0;

    milestones.push({
      id: `m-${milestones.length}`,
      milestone: milestone || `Milestone ${milestones.length + 1}`,
      title:
        title || milestone || `Untitled Milestone ${milestones.length + 1}`,
      scope: scope || "No scope description provided",
      tasks: tasks.length > 0 ? tasks : ["Task details not found in document"],
      exclusions: exclusions.length > 0 ? exclusions : [],
      estimatedHours,
      priceEstimate,
    });
  }

  // If no milestones found, create a default one
  if (milestones.length === 0) {
    milestones.push({
      id: "m-0",
      milestone: "M1",
      title: "Project Data",
      scope:
        "Data extracted from Excel file. Please ensure your Excel file has columns: Milestone, Title, Scope, Tasks, Hours, Price.",
      tasks: ["Review extracted data"],
      exclusions: [],
      estimatedHours: 0,
      priceEstimate: 0,
    });
  }

  return milestones;
};

const extractMilestonesFromPDF = (text: string): any[] => {
  const milestones: any[] = [];

  if (!text || text.trim().length === 0) {
    return [
      {
        id: "m-0",
        milestone: "M1",
        title: "Document Content",
        scope:
          "No readable text found in PDF. The document may be image-based or encrypted.",
        tasks: ["Please ensure PDF contains readable text"],
        exclusions: [],
        estimatedHours: 0,
        priceEstimate: 0,
      },
    ];
  }

  // Normalize text
  const normalizedText = text.replace(/\s+/g, " ").trim();

  // Try to find milestone patterns
  // Pattern 1: Look for "Milestone X", "M1", "Phase 1", etc.
  const milestonePatterns = [
    /milestone\s*(\d+|[\w-]+)[:.\s]+(.*?)(?=milestone\s*\d+|milestone\s*[\w-]+|$)/gi,
    /m\s*(\d+|[\w-]+)[:.\s]+(.*?)(?=m\s*\d+|m\s*[\w-]+|$)/gi,
    /phase\s*(\d+|[\w-]+)[:.\s]+(.*?)(?=phase\s*\d+|phase\s*[\w-]+|$)/gi,
    /stage\s*(\d+|[\w-]+)[:.\s]+(.*?)(?=stage\s*\d+|stage\s*[\w-]+|$)/gi,
  ];

  let foundMilestones = false;

  for (const pattern of milestonePatterns) {
    const matches = [...normalizedText.matchAll(pattern)];
    if (matches.length > 0) {
      foundMilestones = true;
      matches.forEach((match, index) => {
        const milestoneId = match[1] || String(index + 1);
        const content = match[2] || "";

        const parsed = parseMilestoneContent(
          content,
          milestoneId,
          milestones.length
        );
        milestones.push(parsed);
      });
      break;
    }
  }

  // Pattern 2: Look for table-like structures with headers
  if (!foundMilestones) {
    const tablePattern =
      /(?:milestone|m|phase|title|scope|task|hour|price|cost)[\s\S]{0,200}(?:\n|$)/gi;
    const tableMatches = normalizedText.match(tablePattern);

    if (tableMatches && tableMatches.length > 0) {
      // Try to parse as table
      const parsed = parseTableStructure(normalizedText);
      if (parsed.length > 0) {
        milestones.push(...parsed);
        foundMilestones = true;
      }
    }
  }

  // Pattern 3: Look for numbered sections (1., 2., etc.)
  if (!foundMilestones) {
    const numberedPattern =
      /(\d+)[\.\)]\s+([A-Z][^0-9]{20,500})(?=\d+[\.\)]|$)/gi;
    const numberedMatches = [...normalizedText.matchAll(numberedPattern)];

    if (numberedMatches.length >= 2) {
      numberedMatches.forEach((match, index) => {
        const milestoneId = match[1] || String(index + 1);
        const content = match[2] || "";

        const parsed = parseMilestoneContent(
          content,
          `M${milestoneId}`,
          milestones.length
        );
        milestones.push(parsed);
      });
      foundMilestones = true;
    }
  }

  // If no structured milestones found, create one from entire document
  if (!foundMilestones || milestones.length === 0) {
    const parsed = parseMilestoneContent(normalizedText, "M1", 0);
    milestones.push(parsed);
  }

  return milestones;
};

const parseMilestoneContent = (
  content: string,
  milestoneId: string,
  index: number
): any => {
  // Extract title (first line or sentence)
  const lines = content.split(/\n|\. /).filter((l) => l.trim().length > 0);
  const title =
    lines[0]?.trim().substring(0, 100) || `Milestone ${milestoneId}`;

  // Extract scope (remaining content)
  const scope =
    content.substring(title.length).trim() ||
    content.substring(0, 500) ||
    "Scope details extracted from document";

  // Extract tasks (look for bullet points, numbered lists, or "Task:", "Deliverable:" keywords)
  const tasks: string[] = [];
  const taskPatterns = [
    /(?:task|deliverable|item)[s]?:?\s*([^\n]+)/gi,
    /[-•*]\s*([^\n]+)/g,
    /(\d+[\.\)])\s*([^\n]+)/g,
  ];

  for (const pattern of taskPatterns) {
    const matches = [...content.matchAll(pattern)];
    matches.forEach((match) => {
      const task = (match[2] || match[1] || "").trim();
      if (task && task.length > 5 && task.length < 200) {
        tasks.push(task);
      }
    });
  }

  // Extract exclusions
  const exclusions: string[] = [];
  const exclusionPatterns = [
    /(?:exclusion|out of scope|not included|excluded)[s]?:?\s*([^\n]+)/gi,
  ];

  for (const pattern of exclusionPatterns) {
    const matches = [...content.matchAll(pattern)];
    matches.forEach((match) => {
      const exclusion = match[1]?.trim();
      if (exclusion && exclusion.length > 5) {
        exclusions.push(exclusion);
      }
    });
  }

  // Extract hours (look for "hours", "hrs", "h")
  let estimatedHours = 0;
  const hoursPatterns = [
    /(\d+)\s*(?:hours?|hrs?|h)\b/gi,
    /(?:hours?|hrs?|effort)[:]\s*(\d+)/gi,
  ];

  for (const pattern of hoursPatterns) {
    const match = content.match(pattern);
    if (match) {
      const hours = match.map((m) => {
        const num = m.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      });
      estimatedHours = Math.max(...hours, estimatedHours);
    }
  }

  // Extract price (look for $, USD, price, cost)
  let priceEstimate = 0;
  const pricePatterns = [
    /\$[\s]*([\d,]+(?:\.\d{2})?)/g,
    /(?:price|cost|budget|amount)[:]\s*\$?\s*([\d,]+(?:\.\d{2})?)/gi,
    /USD\s*([\d,]+(?:\.\d{2})?)/gi,
  ];

  for (const pattern of pricePatterns) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      const prices = matches.map((m) => {
        const priceStr = m[1]?.replace(/,/g, "") || "0";
        return parseFloat(priceStr) || 0;
      });
      priceEstimate = Math.max(...prices, priceEstimate);
    }
  }

  return {
    id: `m-${index}`,
    milestone: milestoneId.startsWith("M") ? milestoneId : `M${milestoneId}`,
    title: title.substring(0, 200),
    scope: scope.substring(0, 2000),
    tasks:
      tasks.length > 0
        ? tasks.slice(0, 20)
        : ["Tasks extracted from document content"],
    exclusions: exclusions.length > 0 ? exclusions.slice(0, 10) : [],
    estimatedHours,
    priceEstimate,
  };
};

const parseTableStructure = (text: string): any[] => {
  const milestones: any[] = [];
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);

  // Look for header row
  let headerRowIndex = -1;
  const headerKeywords = [
    "milestone",
    "title",
    "scope",
    "task",
    "hour",
    "price",
    "cost",
  ];

  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (headerKeywords.some((keyword) => line.includes(keyword))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex >= 0) {
    // Try to parse subsequent rows as milestones
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 10) continue;

      // Try to extract data from line (assuming tab or space separated)
      const parts = line.split(/\t|\s{2,}/).filter((p) => p.trim().length > 0);

      if (parts.length >= 2) {
        const index = milestones.length;
        milestones.push({
          id: `m-${index}`,
          milestone: parts[0]?.substring(0, 50) || `M${index + 1}`,
          title:
            parts[1]?.substring(0, 200) ||
            parts[0]?.substring(0, 200) ||
            "Untitled",
          scope:
            parts.slice(2).join(" ").substring(0, 1000) ||
            "Scope from document",
          tasks: ["Tasks from document"],
          exclusions: [],
          estimatedHours: extractNumber(parts.join(" ")),
          priceEstimate: extractPrice(parts.join(" ")),
        });
      }
    }
  }

  return milestones;
};

const extractNumber = (text: string): number => {
  const match = text.match(/(\d+)\s*(?:hours?|hrs?|h)\b/i);
  return match ? parseInt(match[1]) : 0;
};

const extractPrice = (text: string): number => {
  const match = text.match(/\$[\s]*([\d,]+(?:\.\d{2})?)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, "")) || 0;
  }
  return 0;
};

const findColumnIndex = (headers: any[], keywords: string[]): number => {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || "")
      .toLowerCase()
      .trim();
    if (keywords.some((keyword) => header.includes(keyword))) {
      return i;
    }
  }
  return -1;
};
