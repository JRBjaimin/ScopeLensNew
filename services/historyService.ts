import { ProjectData, HistoryProject } from "../types";

const HISTORY_STORAGE_KEY = "scopelens_project_history";

/**
 * Save a project to history
 */
export const saveProjectToHistory = (projectData: ProjectData): void => {
  try {
    const history = getHistoryProjects();

    // Create history entry with unique ID
    const historyEntry: HistoryProject = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: projectData.fileName,
      uploadDate: projectData.uploadDate,
      milestones: projectData.milestones,
      totalBallpark: projectData.totalBallpark,
      createdAt: new Date().toISOString(),
    };

    // Add to beginning of array (most recent first)
    history.unshift(historyEntry);

    // Limit to last 50 projects to prevent storage issues
    const limitedHistory = history.slice(0, 50);

    // Save to localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Error saving project to history:", error);
  }
};

/**
 * Get all history projects
 */
export const getHistoryProjects = (): HistoryProject[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyJson) {
      return [];
    }
    return JSON.parse(historyJson) as HistoryProject[];
  } catch (error) {
    console.error("Error reading project history:", error);
    return [];
  }
};

/**
 * Get a specific project from history by ID
 */
export const getProjectFromHistory = (id: string): ProjectData | null => {
  try {
    const history = getHistoryProjects();
    const project = history.find((p) => p.id === id);

    if (!project) {
      return null;
    }

    // Convert HistoryProject to ProjectData (remove id and createdAt)
    return {
      fileName: project.fileName,
      uploadDate: project.uploadDate,
      milestones: project.milestones,
      totalBallpark: project.totalBallpark,
    };
  } catch (error) {
    console.error("Error getting project from history:", error);
    return null;
  }
};

/**
 * Delete a project from history
 */
export const deleteProjectFromHistory = (id: string): void => {
  try {
    const history = getHistoryProjects();
    const filteredHistory = history.filter((p) => p.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error("Error deleting project from history:", error);
  }
};

/**
 * Clear all history
 */
export const clearAllHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};
