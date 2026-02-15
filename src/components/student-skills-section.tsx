'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

type SpecialSkill = 
  | 'COMPUTER'
  | 'COMPOSITION_WRITING'
  | 'SINGING'
  | 'DANCING'
  | 'POEM_WRITING'
  | 'COOKING'
  | 'ACTING'
  | 'PUBLIC_SPEAKING'
  | 'OTHER';

interface StudentSkills {
  specialSkills: SpecialSkill[];
  specialNeedsDiagnosis?: string;
}

interface StudentSkillsSectionProps {
  studentSkills: StudentSkills;
  onUpdate: (field: keyof StudentSkills, value: SpecialSkill[] | string) => void;
  errors: Record<string, string>;
}

const SPECIAL_SKILLS_OPTIONS: { value: SpecialSkill; label: string }[] = [
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'COMPOSITION_WRITING', label: 'Composition Writing' },
  { value: 'SINGING', label: 'Singing' },
  { value: 'DANCING', label: 'Dancing' },
  { value: 'POEM_WRITING', label: 'Poem Writing' },
  { value: 'COOKING', label: 'Cooking' },
  { value: 'ACTING', label: 'Acting' },
  { value: 'PUBLIC_SPEAKING', label: 'Public Speaking' },
  { value: 'OTHER', label: 'Other' },
];

export function StudentSkillsSection({ studentSkills, onUpdate, errors }: StudentSkillsSectionProps) {
  const toggleSpecialSkill = (skill: SpecialSkill) => {
    const current = studentSkills.specialSkills;
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    onUpdate('specialSkills', updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Skills and Special Needs</CardTitle>
        <CardDescription>Special skills and any special needs information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Special Skills */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Special Skills</Label>
            <p className="text-sm text-gray-500 mt-1">Select all skills that apply to the student</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SPECIAL_SKILLS_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${option.value}`}
                  checked={studentSkills.specialSkills.includes(option.value)}
                  onCheckedChange={() => toggleSpecialSkill(option.value)}
                />
                <Label htmlFor={`skill-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Special Needs Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="specialNeedsDiagnosis">Special Needs Diagnosis</Label>
          <Textarea
            id="specialNeedsDiagnosis"
            value={studentSkills.specialNeedsDiagnosis || ''}
            onChange={(e) => onUpdate('specialNeedsDiagnosis', e.target.value)}
            placeholder="If applicable, provide details about any special needs diagnosis or therapist recommendations"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Optional: Provide information about any special needs, diagnosis, or therapist recommendations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
