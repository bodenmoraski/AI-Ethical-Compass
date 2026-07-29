import { type Scenario, type Perspective } from "@shared/schema";
import { apiRequest } from "./queryClient";
import { supabase } from "../../../lib/supabase-client";

export async function submitPerspective(scenarioId: number, content: string, authorName: string = "Anonymous User", userId?: string, userEmail?: string, resolutionId?: string | null, parentId?: number): Promise<Perspective> {
  const response = await apiRequest(
    "POST",
    "/api/perspectives",
    { 
      scenarioId, 
      content, 
      authorName,
      userId,
      userEmail,
      resolutionId,
      parentId 
    }
  );
  return await response.json();
}

export async function updateProgress(scenarioId: number, completed: boolean = true, userId?: number | string): Promise<void> {
  try {
    let resolvedUserId = userId;

    if (resolvedUserId == null) {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) {
        console.warn('Skipping progress update: no signed-in user');
        return;
      }

      // Resolve integer users.id expected by user_progress
      const profileRes = await fetch(`/api/user-profile?email=${encodeURIComponent(email)}`);
      if (!profileRes.ok) {
        console.warn('Skipping progress update: user profile not found');
        return;
      }
      const profile = await profileRes.json();
      resolvedUserId = profile.id;
    }

    const response = await fetch('/api/user-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: resolvedUserId,
        scenarioId,
        completed,
      }),
    });

    if (!response.ok) {
      console.error('Failed to update progress:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating progress:', error);
  }
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
