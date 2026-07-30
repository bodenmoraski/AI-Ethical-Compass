import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Trash2 } from 'lucide-react';

export interface RubricCriterion {
  id: string;
  name: string;
  description?: string;
  maxPoints: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
}

interface RubricEditorProps {
  rubric: Rubric | null;
  onChange: (rubric: Rubric | null) => void;
  /** Assignment total, shown so the teacher can see when criteria don't add up. */
  pointsPossible: number;
}

function newCriterionId(): string {
  return `c${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function rubricTotal(rubric: Rubric | null): number {
  if (!rubric) return 0;
  return rubric.criteria.reduce((sum, criterion) => sum + (Number(criterion.maxPoints) || 0), 0);
}

export default function RubricEditor({ rubric, onChange, pointsPossible }: RubricEditorProps) {
  const criteria = rubric?.criteria || [];
  const total = rubricTotal(rubric);

  const update = (next: RubricCriterion[]) => {
    onChange(next.length > 0 ? { criteria: next } : null);
  };

  const addCriterion = () => {
    update([
      ...criteria,
      { id: newCriterionId(), name: '', description: '', maxPoints: 10 },
    ]);
  };

  const updateCriterion = (id: string, patch: Partial<RubricCriterion>) => {
    update(criteria.map((criterion) => (criterion.id === id ? { ...criterion, ...patch } : criterion)));
  };

  const removeCriterion = (id: string) => {
    update(criteria.filter((criterion) => criterion.id !== id));
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Grading rubric (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Add criteria to grade against. Leave empty to grade with a single score.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
          <Plus className="h-4 w-4 mr-1" />
          Add criterion
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="text-sm text-muted-foreground">No criteria yet.</p>
      ) : (
        <div className="space-y-2">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="flex gap-2 items-start">
              <Input
                aria-label="Criterion name"
                placeholder="e.g. Ethical reasoning"
                value={criterion.name}
                onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                className="flex-1"
              />
              <Input
                aria-label="Maximum points"
                type="number"
                min={0}
                value={criterion.maxPoints}
                onChange={(e) =>
                  updateCriterion(criterion.id, { maxPoints: Number(e.target.value) || 0 })
                }
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(criterion.id)}
                aria-label={`Remove ${criterion.name || 'criterion'}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Rubric total: {total} points.
            {total !== pointsPossible &&
              ` Scores are scaled to the assignment's ${pointsPossible} points.`}
          </p>
        </div>
      )}
    </div>
  );
}
