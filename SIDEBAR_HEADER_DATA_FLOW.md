# Sidebar and Header Data Flow Documentation

## Overview

This document explains how the **Sidebar** and **Header** components in the ProjectPage are populated and managed using data extracted from uploaded PDF/Excel files.

---

## 📊 Data Flow Architecture

```
PDF/Excel Upload
    ↓
Gemini API Parsing
    ↓
ProjectData Structure
    ↓
localStorage Storage
    ↓
ProjectPage Component
    ↓
Sidebar & Header Rendering
```

---

## 1. Data Structure

### TypeScript Interfaces

**Location:** `types.ts`

```typescript
// Individual Milestone Entry
export interface MilestoneEntry {
  id: string; // Unique identifier
  milestone: string; // From Column 1 (e.g., "M1", "Milestone 1")
  title: string; // From Column 2 (e.g., "Design Phase")
  scope: string; // Detailed description
  tasks: string[]; // Array of task items
  exclusions: string[]; // Array of excluded items
  estimatedHours: number; // Hours estimate
  priceEstimate: number; // Price estimate
}

// Complete Project Data
export interface ProjectData {
  fileName: string; // Original file name
  uploadDate: string; // Upload timestamp
  milestones: MilestoneEntry[]; // Array of all milestones
  totalBallpark?: {
    // Optional total estimates
    hours: number;
    price: number;
  };
}
```

---

## 2. PDF/Excel Parsing Process

### Step 1: File Upload

**Location:** `pages/UploadPage.tsx`

```typescript
const handleSubmit = async () => {
  // 1. Read file as Base64
  const base64 = await readFileAsBase64(file);

  // 2. Send to Gemini API for parsing
  const parsedData = await parseFileWithGemini(base64, file.type, file.name);

  // 3. Save to localStorage
  localStorage.setItem("project_data", JSON.stringify(parsedData));

  // 4. Navigate to project page
  navigate("/project");
};
```

### Step 2: Gemini API Parsing

**Location:** `services/geminiService.ts`

The Gemini API receives the file and extracts structured data using this prompt:

```
Extract project milestone data from the provided document.
Return a JSON object strictly following this schema:
- milestones: array of objects with {
    milestone: string,      // Column 1
    title: string,         // Column 2
    scope: string,
    tasks: array of strings,
    exclusions: array of strings,
    estimatedHours: number,
    priceEstimate: number
  }
- totalBallpark: (optional) object with { hours: number, price: number }
```

**Example Parsed Data:**

```json
{
  "fileName": "Project_Scope_Document.pdf",
  "uploadDate": "2024-01-15T10:30:00Z",
  "milestones": [
    {
      "id": "milestone-1",
      "milestone": "M1",
      "title": "Design Phase",
      "scope": "Complete UI/UX design...",
      "tasks": ["Create wireframes", "Design mockups"],
      "exclusions": ["Development work"],
      "estimatedHours": 80,
      "priceEstimate": 8000
    },
    {
      "id": "milestone-2",
      "milestone": "M2",
      "title": "Development Phase",
      "scope": "Frontend and backend development...",
      "tasks": ["Setup project", "Implement features"],
      "exclusions": ["Testing"],
      "estimatedHours": 120,
      "priceEstimate": 12000
    }
  ],
  "totalBallpark": {
    "hours": 200,
    "price": 20000
  }
}
```

---

## 3. Data Loading in ProjectPage

### Step 1: Load Data from localStorage

**Location:** `pages/ProjectPage.tsx` (lines 45-65)

```typescript
useEffect(() => {
  // 1. Retrieve data from localStorage
  const savedData = localStorage.getItem("project_data");

  if (!savedData) {
    navigate("/"); // Redirect if no data
    return;
  }

  // 2. Parse JSON data
  const parsed = JSON.parse(savedData) as ProjectData;

  // 3. Set data state
  setData(parsed);

  // 4. Select first milestone by default
  if (parsed.milestones.length > 0) {
    setSelectedId(parsed.milestones[0].id);
  }
}, [navigate]);
```

**State Variables:**

```typescript
const [data, setData] = useState<ProjectData | null>(null);
const [selectedId, setSelectedId] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");
const [sortOption, setSortOption] = useState<SortOption>(SortOption.ORDER);
```

---

## 4. Sidebar Data Management

### A. Filtered and Sorted Milestones

**Location:** `pages/ProjectPage.tsx` (lines 100-116)

```typescript
const filteredAndSortedMilestones = useMemo(() => {
  if (!data) return [];

  // 1. Filter by search term
  let result = [...data.milestones].filter(
    (m) =>
      m.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Sort based on selected option
  if (sortOption === SortOption.HOURS) {
    result.sort((a, b) => b.estimatedHours - a.estimatedHours);
  } else if (sortOption === SortOption.PRICE) {
    result.sort((a, b) => b.priceEstimate - a.priceEstimate);
  }
  // ORDER keeps original order (no sorting)

  return result;
}, [data, searchTerm, sortOption]);
```

**How it works:**

- **Input:** `data.milestones` array from PDF
- **Filter:** Matches search term against `milestone` or `title`
- **Sort:** Orders by HOURS, PRICE, or maintains ORDER
- **Output:** Filtered and sorted array for sidebar display

### B. Sidebar Rendering

**Location:** `pages/ProjectPage.tsx` (lines 454-500)

```typescript
<div className="flex-1 overflow-y-auto px-4 py-1 space-y-1.5">
  {filteredAndSortedMilestones.map((m, i) => (
    <button
      key={m.id}
      onClick={() => {
        setSelectedId(m.id); // Update selected milestone
        if (!isSidebarPinned) setIsSidebarOpen(false);
      }}
      className={
        selectedId === m.id ? "bg-white shadow-lg" : "hover:bg-slate-50"
      }
    >
      {/* Milestone ID */}
      <span>{m.milestone}</span>

      {/* Hours */}
      <div>
        <Clock /> {m.estimatedHours}h
      </div>

      {/* Price */}
      <div>
        <DollarSign /> ${m.priceEstimate.toLocaleString()}
      </div>
    </button>
  ))}
</div>
```

**Data Mapping:**

- `m.milestone` → Displayed as milestone identifier (e.g., "M1")
- `m.estimatedHours` → Displayed with clock icon
- `m.priceEstimate` → Displayed with dollar icon
- `m.id` → Used for selection state management

---

## 5. Header Data Management

### A. Selected Milestone Data

**Location:** `pages/ProjectPage.tsx` (lines 118-120)

```typescript
const selectedMilestone = useMemo(() => {
  return data?.milestones.find((m) => m.id === selectedId) || null;
}, [data, selectedId]);
```

**How it works:**

- Finds the milestone object matching `selectedId`
- Returns `null` if no milestone is selected
- Updates automatically when `selectedId` changes

### B. Header Rendering

**Location:** `pages/ProjectPage.tsx` (lines 534-590)

```typescript
<header>
  {/* Left Section */}
  <div>
    {/* File Name + Current Milestone */}
    <div>
      <FileSpreadsheet />
      {data.fileName} • {selectedMilestone?.milestone}
    </div>

    {/* Milestone Title */}
    <h1>{selectedMilestone?.title || "Project Overview"}</h1>
  </div>

  {/* Right Section - Action Buttons */}
  <div>
    <Button onClick={handleCopySummary}>Copy</Button>
    <Button onClick={exportToPDF}>Export PDF</Button>
  </div>
</header>
```

**Data Mapping:**

- `data.fileName` → Original PDF/Excel file name
- `selectedMilestone?.milestone` → Current milestone ID (e.g., "M1")
- `selectedMilestone?.title` → Current milestone title (e.g., "Design Phase")

---

## 6. Data Flow Summary

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PDF/Excel Upload                          │
│              (pages/UploadPage.tsx)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Gemini API Parsing                              │
│         (services/geminiService.ts)                         │
│                                                              │
│  Extracts:                                                   │
│  • fileName                                                  │
│  • uploadDate                                                │
│  • milestones[] (with id, milestone, title, scope, etc.)     │
│  • totalBallpark (optional)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            localStorage Storage                              │
│         Key: "project_data"                                  │
│         Value: JSON.stringify(ProjectData)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         ProjectPage Component Load                           │
│         (pages/ProjectPage.tsx)                             │
│                                                              │
│  1. Read from localStorage                                   │
│  2. Parse JSON                                               │
│  3. Set data state                                           │
│  4. Set selectedId to first milestone                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│     SIDEBAR      │        │     HEADER        │
│                  │        │                   │
│ • Search Filter  │        │ • File Name       │
│ • Sort Options   │        │ • Milestone ID    │
│ • Milestone List │        │ • Milestone Title │
│   - milestone    │        │ • Action Buttons  │
│   - hours        │        │                   │
│   - price        │        │                   │
└──────────────────┘        └──────────────────┘
```

---

## 7. Key Functions and Their Data Sources

### Sidebar Functions

| Function                      | Data Source       | Purpose                                    |
| ----------------------------- | ----------------- | ------------------------------------------ |
| `filteredAndSortedMilestones` | `data.milestones` | Filters by search term and sorts by option |
| `setSearchTerm`               | User input        | Updates search filter                      |
| `setSortOption`               | User selection    | Changes sort order (ORDER/HOURS/PRICE)     |
| `setSelectedId`               | User click        | Updates selected milestone ID              |

### Header Functions

| Function            | Data Source                | Purpose                               |
| ------------------- | -------------------------- | ------------------------------------- |
| `selectedMilestone` | `data.milestones.find(id)` | Gets current milestone object         |
| `data.fileName`     | `data.fileName`            | Displays original file name           |
| `handleCopySummary` | `selectedMilestone`        | Copies milestone details to clipboard |
| `exportToPDF`       | `selectedMilestone`        | Exports current milestone to PDF      |

---

## 8. Example Data Transformation

### Input (from PDF):

```
Milestone 1: Design Phase
- Scope: Complete UI/UX design
- Tasks: Wireframes, Mockups
- Hours: 80
- Price: $8,000
```

### Parsed Data Structure:

```json
{
  "id": "milestone-1",
  "milestone": "M1",
  "title": "Design Phase",
  "scope": "Complete UI/UX design",
  "tasks": ["Wireframes", "Mockups"],
  "estimatedHours": 80,
  "priceEstimate": 8000
}
```

### Sidebar Display:

```
┌─────────────────────┐
│ M1                  │
│ 🕐 80h  💰 $8,000   │
└─────────────────────┘
```

### Header Display:

```
Project_Scope_Document.pdf • M1
Design Phase
```

---

## 9. State Management Flow

```typescript
// Initial State
data: null
selectedId: null

// After Loading
data: ProjectData {
  fileName: "document.pdf",
  milestones: [...]
}
selectedId: "milestone-1"

// After User Interaction
selectedId: "milestone-2"  // User clicked different milestone
searchTerm: "design"       // User typed in search
sortOption: SortOption.HOURS  // User selected sort

// Computed Values
filteredAndSortedMilestones: [...]  // Filtered & sorted array
selectedMilestone: MilestoneEntry    // Current milestone object
```

---

## 10. Important Notes

### Data Persistence

- Data is stored in `localStorage` with key `"project_data"`
- Data persists across page refreshes
- Data is cleared when user starts a new project

### Data Validation

- ProjectPage checks if data exists before rendering
- Redirects to upload page if no data found
- Handles empty milestones array gracefully

### Real-time Updates

- Sidebar updates immediately when search term changes
- Sidebar re-sorts when sort option changes
- Header updates when different milestone is selected
- All updates use React's `useMemo` for performance

### Error Handling

- If parsing fails, error is shown on upload page
- If data is corrupted, user is redirected to upload page
- Missing fields are handled with optional chaining (`?.`)

---

## 11. Code References

| Component          | File Location               | Key Lines |
| ------------------ | --------------------------- | --------- |
| Data Types         | `types.ts`                  | 1-39      |
| API Parsing        | `services/geminiService.ts` | 54-207    |
| File Upload        | `pages/UploadPage.tsx`      | 101-120   |
| Data Loading       | `pages/ProjectPage.tsx`     | 45-65     |
| Sidebar Filter     | `pages/ProjectPage.tsx`     | 100-116   |
| Sidebar Render     | `pages/ProjectPage.tsx`     | 454-500   |
| Header Render      | `pages/ProjectPage.tsx`     | 534-590   |
| Selected Milestone | `pages/ProjectPage.tsx`     | 118-120   |

---

## Summary

The **Sidebar** and **Header** are dynamically populated from PDF/Excel data through this process:

1. **Upload** → File is converted to Base64
2. **Parse** → Gemini API extracts structured data
3. **Store** → Data saved to localStorage as JSON
4. **Load** → ProjectPage reads and parses data
5. **Display** → Sidebar shows milestone list, Header shows current milestone details
6. **Interact** → User selections update displayed data in real-time

All data flows from the parsed PDF structure (`ProjectData`) through React state management to the UI components.
