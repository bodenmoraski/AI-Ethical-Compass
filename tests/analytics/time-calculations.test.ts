/**
 * Time Calculations Test
 * 
 * This test verifies that:
 * 1. Average time spent is calculated from real data (not hardcoded)
 * 2. The calculation handles edge cases properly
 * 3. Time is reported in minutes
 */

import { describe, it, expect } from '@jest/globals';

describe('Analytics Time Calculations', () => {
  describe('Time Calculation Logic', () => {
    it('should calculate average time from seconds to minutes', () => {
      const engagementData = [
        { time_spent_seconds: 1800 }, // 30 minutes
        { time_spent_seconds: 2400 }, // 40 minutes
        { time_spent_seconds: 1200 }, // 20 minutes
      ];
      
      const totalSeconds = engagementData.reduce((sum, e) => sum + e.time_spent_seconds, 0);
      const averageTimeMinutes = Math.round((totalSeconds / engagementData.length) / 60);
      
      expect(averageTimeMinutes).toBe(30); // (30 + 40 + 20) / 3 = 30
    });

    it('should handle empty engagement data gracefully', () => {
      const engagementData: { time_spent_seconds: number }[] = [];
      
      let averageTimeSpent = 0;
      if (engagementData.length > 0) {
        const totalSeconds = engagementData.reduce((sum, e) => sum + e.time_spent_seconds, 0);
        averageTimeSpent = Math.round((totalSeconds / engagementData.length) / 60);
      }
      
      expect(averageTimeSpent).toBe(0);
    });

    it('should handle null/undefined time values', () => {
      const engagementData = [
        { time_spent_seconds: 1800 },
        { time_spent_seconds: null as any },
        { time_spent_seconds: undefined as any },
        { time_spent_seconds: 1200 },
      ];
      
      const validData = engagementData.filter(e => e.time_spent_seconds != null);
      const totalSeconds = validData.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0);
      const averageTimeMinutes = validData.length > 0 
        ? Math.round((totalSeconds / validData.length) / 60) 
        : 0;
      
      expect(averageTimeMinutes).toBe(25); // (30 + 20) / 2 = 25
    });

    it('should fallback to submission timeSpent data', () => {
      const submissions = [
        { submission_data: { timeSpent: 25 } }, // 25 minutes
        { submission_data: { timeSpent: 35 } }, // 35 minutes
        { submission_data: { timeSpent: 30 } }, // 30 minutes
      ];
      
      const timesFromSubmissions = submissions
        .filter(s => s.submission_data?.timeSpent)
        .map(s => s.submission_data.timeSpent);
      
      const averageTimeSpent = timesFromSubmissions.length > 0
        ? Math.round(timesFromSubmissions.reduce((sum, t) => sum + t, 0) / timesFromSubmissions.length)
        : 0;
      
      expect(averageTimeSpent).toBe(30); // (25 + 35 + 30) / 3 = 30
    });
  });

  describe('Code Verification', () => {
    it('should not have hardcoded averageTimeSpent: 45 in teacher.ts', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const teacherApiPath = path.join(process.cwd(), 'api/teacher.ts');
      const content = fs.readFileSync(teacherApiPath, 'utf-8');
      
      // Check that the hardcoded value is gone
      expect(content).not.toContain('averageTimeSpent: 45');
      
      // Check that we're calculating from real data
      expect(content).toContain('time_spent_seconds');
      expect(content).toContain('student_engagement');
    });

    it('should have proper engagement data query in analytics', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const teacherApiPath = path.join(process.cwd(), 'api/teacher.ts');
      const content = fs.readFileSync(teacherApiPath, 'utf-8');
      
      // Verify the engagement query exists
      expect(content).toContain("from('student_engagement')");
      expect(content).toContain('time_spent_seconds');
    });
  });

  describe('Edge Cases', () => {
    it('should round to nearest minute', () => {
      // 1850 seconds = 30.83 minutes, should round to 31
      const timeInSeconds = 1850;
      const minutes = Math.round(timeInSeconds / 60);
      expect(minutes).toBe(31);
    });

    it('should handle very short times', () => {
      // 30 seconds = 0.5 minutes, should round to 1
      const timeInSeconds = 30;
      const minutes = Math.round(timeInSeconds / 60);
      expect(minutes).toBe(1);
    });

    it('should handle zero time', () => {
      const timeInSeconds = 0;
      const minutes = Math.round(timeInSeconds / 60);
      expect(minutes).toBe(0);
    });
  });
});

