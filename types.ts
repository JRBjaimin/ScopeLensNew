
export interface MilestoneEntry {
  id: string;
  milestone: string; // From Column 1
  title: string;     // From Column 2
  scope: string;
  tasks: string[];
  exclusions: string[];
  estimatedHours: number;
  priceEstimate: number;
}

export interface ProjectData {
  fileName: string;
  uploadDate: string;
  milestones: MilestoneEntry[];
  totalBallpark?: {
    hours: number;
    price: number;
  };
}

export enum SortOption {
  ORDER = 'ORDER',
  HOURS = 'HOURS',
  PRICE = 'PRICE'
}
