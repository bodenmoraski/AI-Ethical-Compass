import { type Scenario, type Perspective } from "@shared/schema";
import { apiRequest } from "./queryClient";

export async function submitPerspective(scenarioId: number, content: string, parentId?: number): Promise<Perspective> {
  const response = await apiRequest(
    "POST",
    "/api/perspectives",
    { scenarioId, content, parentId }
  );
  return await response.json();
}

export async function updateProgress(scenarioId: number, completed: boolean = true): Promise<void> {
  await apiRequest(
    "POST",
    "/api/progress",
    { userId: null, scenarioId, completed }
  );
}

export const getRelativeTimeString = (date: Date | string | number): string => {
  try {
    // Convert input to Date if it's not already
    const validDate = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(validDate.getTime())) {
      return "recently";
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - validDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    // If any error occurs in date parsing or calculation
    return "recently";
  }
};
