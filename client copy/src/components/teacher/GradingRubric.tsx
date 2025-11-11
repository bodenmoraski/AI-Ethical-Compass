import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Trash2, Save, Edit } from 'lucide-react';

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number; // percentage weight of this criteria
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  color: string;
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriteria[];
  levels: RubricLevel[];
  totalPoints: number;
}

interface GradingRubricProps {
  rubric?: Rubric;
  onRubricChange?: (rubric: Rubric) => void;
  onSave?: (rubric: Rubric) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  readOnly?: boolean;
}

const defaultLevels: RubricLevel[] = [
  { id: '1', name: 'Excellent', description: 'Outstanding work that exceeds expectations', points: 100, color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Good', description: 'Solid work that meets expectations', points: 85, color: 'bg-blue-100 text-blue-800' },
  { id: '3', name: 'Satisfactory', description: 'Adequate work that partially meets expectations', points: 70, color: 'bg-yellow-100 text-yellow-800' },
  { id: '4', name: 'Needs Improvement', description: 'Work that falls below expectations', points: 55, color: 'bg-orange-100 text-orange-800' },
  { id: '5', name: 'Unsatisfactory', description: 'Work that significantly falls below expectations', points: 40, color: 'bg-red-100 text-red-800' },
];

export const GradingRubric: React.FC<GradingRubricProps> = ({
  rubric,
  onRubricChange,
  onSave,
  isEditing = false,
  onEditToggle,
  readOnly = false
}) => {
  const [localRubric, setLocalRubric] = useState<Rubric>(
    rubric || {
      id: crypto.randomUUID(),
      name: 'New Rubric',
      description: '',
      criteria: [],
      levels: [...defaultLevels],
      totalPoints: 100
    }
  );

  const [editingCriteria, setEditingCriteria] = useState<string | null>(null);

  const updateRubric = (updates: Partial<Rubric>) => {
    const updated = { ...localRubric, ...updates };
    setLocalRubric(updated);
    onRubricChange?.(updated);
  };

  const addCriteria = () => {
    const newCriteria: RubricCriteria = {
      id: crypto.randomUUID(),
      name: 'New Criteria',
      description: '',
      maxPoints: 20,
      weight: 20
    };
    
    const updatedCriteria = [...localRubric.criteria, newCriteria];
    updateRubric({ criteria: updatedCriteria });
    setEditingCriteria(newCriteria.id);
  };

  const updateCriteria = (id: string, updates: Partial<RubricCriteria>) => {
    const updatedCriteria = localRubric.criteria.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    updateRubric({ criteria: updatedCriteria });
  };

  const removeCriteria = (id: string) => {
    const updatedCriteria = localRubric.criteria.filter(c => c.id !== id);
    updateRubric({ criteria: updatedCriteria });
  };

  const updateLevel = (id: string, updates: Partial<RubricLevel>) => {
    const updatedLevels = localRubric.levels.map(l => 
      l.id === id ? { ...l, ...updates } : l
    );
    updateRubric({ levels: updatedLevels });
  };

  const calculateTotalPoints = () => {
    return localRubric.criteria.reduce((total, criteria) => total + criteria.maxPoints, 0);
  };

  const handleSave = () => {
    const finalRubric = {
      ...localRubric,
      totalPoints: calculateTotalPoints()
    };
    onSave?.(finalRubric);
  };

  if (readOnly && !rubric) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No rubric defined for this assignment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Rubric' : 'Grading Rubric'}
          </CardTitle>
          <div className="flex gap-2">
            {!readOnly && (
              <>
                {isEditing ? (
                  <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Rubric
                  </Button>
                ) : (
                  <Button onClick={onEditToggle} size="sm" variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rubric Header */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="rubric-name">Rubric Name</Label>
              <Input
                id="rubric-name"
                value={localRubric.name}
                onChange={(e) => updateRubric({ name: e.target.value })}
                placeholder="Enter rubric name"
              />
            </div>
            <div>
              <Label htmlFor="rubric-description">Description</Label>
              <Textarea
                id="rubric-description"
                value={localRubric.description}
                onChange={(e) => updateRubric({ description: e.target.value })}
                placeholder="Describe the rubric purpose and criteria"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium">{localRubric.name}</h3>
            {localRubric.description && (
              <p className="text-muted-foreground mt-1">{localRubric.description}</p>
            )}
          </div>
        )}

        <Separator />

        {/* Grading Levels */}
        <div>
          <h4 className="text-md font-medium mb-3">Grading Levels</h4>
          <div className="grid gap-3">
            {localRubric.levels.map((level) => (
              <div key={level.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                  {level.name}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={level.name}
                        onChange={(e) => updateLevel(level.id, { name: e.target.value })}
                        placeholder="Level name"
                        className="text-sm"
                      />
                      <Textarea
                        value={level.description}
                        onChange={(e) => updateLevel(level.id, { description: e.target.value })}
                        placeholder="Level description"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  )}
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={level.points}
                      onChange={(e) => updateLevel(level.id, { points: parseInt(e.target.value) || 0 })}
                      className="w-20 text-center"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <Badge variant="secondary">{level.points} pts</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Assessment Criteria */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium">Assessment Criteria</h4>
            {isEditing && (
              <Button onClick={addCriteria} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Criteria
              </Button>
            )}
          </div>
          
          {localRubric.criteria.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No criteria defined. {isEditing && 'Add criteria to create a comprehensive rubric.'}
            </p>
          ) : (
            <div className="space-y-4">
              {localRubric.criteria.map((criteria) => (
                <div key={criteria.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      {isEditing ? (
                        <>
                          <Input
                            value={criteria.name}
                            onChange={(e) => updateCriteria(criteria.id, { name: e.target.value })}
                            placeholder="Criteria name"
                            className="font-medium"
                          />
                          <Textarea
                            value={criteria.description}
                            onChange={(e) => updateCriteria(criteria.id, { description: e.target.value })}
                            placeholder="Describe what this criteria evaluates"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`max-points-${criteria.id}`}>Max Points</Label>
                              <Input
                                id={`max-points-${criteria.id}`}
                                type="number"
                                value={criteria.maxPoints}
                                onChange={(e) => updateCriteria(criteria.id, { maxPoints: parseInt(e.target.value) || 0 })}
                                min="1"
                                max="100"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`weight-${criteria.id}`}>Weight (%)</Label>
                              <Input
                                id={`weight-${criteria.id}`}
                                type="number"
                                value={criteria.weight}
                                onChange={(e) => updateCriteria(criteria.id, { weight: parseInt(e.target.value) || 0 })}
                                min="1"
                                max="100"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h5 className="font-medium">{criteria.name}</h5>
                          <p className="text-sm text-muted-foreground">{criteria.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{criteria.maxPoints} pts</Badge>
                            <Badge variant="secondary">{criteria.weight}% weight</Badge>
                          </div>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        onClick={() => removeCriteria(criteria.id)}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Points */}
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Possible Points:</span>
          <Badge variant="default" className="text-lg px-3 py-1">
            {calculateTotalPoints()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradingRubric; 