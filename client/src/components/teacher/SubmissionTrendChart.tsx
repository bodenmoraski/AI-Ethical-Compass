import React from 'react';

export interface TrendPoint {
  date: string;
  submissions: number;
}

interface SubmissionTrendChartProps {
  trend: TrendPoint[];
}

/**
 * Minimal dependency-free bar chart. Renders an explicit empty state rather than a
 * decorative placeholder when a class has no submissions yet.
 */
export default function SubmissionTrendChart({ trend }: SubmissionTrendChartProps) {
  const points = Array.isArray(trend) ? trend : [];
  const total = points.reduce((sum, point) => sum + (point.submissions || 0), 0);

  if (points.length === 0 || total === 0) {
    return (
      <div className="h-64 rounded-lg border border-dashed flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-medium text-gray-900">No submissions in the last 30 days</p>
          <p className="text-sm text-muted-foreground mt-1">
            This chart fills in as students submit assignments.
          </p>
        </div>
      </div>
    );
  }

  const max = Math.max(...points.map((point) => point.submissions || 0), 1);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {total} submission{total === 1 ? '' : 's'} in the last {points.length} days
      </p>
      <div className="h-64 flex items-end gap-[2px]" role="img" aria-label="Submissions per day">
        {points.map((point) => {
          const height = Math.max(2, Math.round(((point.submissions || 0) / max) * 100));
          return (
            <div
              key={point.date}
              className="flex-1 bg-blue-500/80 hover:bg-blue-600 rounded-t"
              style={{ height: `${height}%` }}
              title={`${point.date}: ${point.submissions} submission${point.submissions === 1 ? '' : 's'}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
