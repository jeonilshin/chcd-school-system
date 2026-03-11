'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentHistory {
  hasSiblings?: boolean;
  siblingsInformation?: string;
  totalLearnersInHousehold: string;
  program?: string;
  lastSchoolPreschoolName: string;
  lastSchoolPreschoolAddress?: string;
  lastSchoolElementaryName: string;
  lastSchoolElementaryAddress?: string;
}

interface StudentHistorySectionProps {
  studentHistory: StudentHistory;
  onUpdate: (field: keyof StudentHistory, value: string | boolean) => void;
  errors: Record<string, string>;
  program?: string;
}

export function StudentHistorySection({ studentHistory, onUpdate, errors, program }: StudentHistorySectionProps) {
  const [hasSiblings, setHasSiblings] = useState(studentHistory.hasSiblings !== false);
  
  // Check if program is Playschool (no need for preschool history)
  const isPlayschool = program?.toLowerCase().includes('playschool');
  
  // Check if program is Grade 1-6 (needs preschool history)
  const needsPreschoolHistory = program?.toLowerCase().includes('grade') || 
    program?.toLowerCase().includes('nursery') || 
    program?.toLowerCase().includes('kinder');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student History</CardTitle>
        <CardDescription>Educational background and family information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Siblings Check */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSiblings"
              checked={hasSiblings}
              onCheckedChange={(checked) => {
                setHasSiblings(!!checked);
                onUpdate('hasSiblings', !!checked);
                if (!checked) {
                  onUpdate('siblingsInformation', '');
                }
              }}
            />
            <Label htmlFor="hasSiblings" className="font-semibold cursor-pointer">
              Student has siblings
            </Label>
          </div>

          {/* Siblings Information */}
          {hasSiblings && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="siblingsInformation">Learner's Siblings Information *</Label>
              <Textarea
                id="siblingsInformation"
                value={studentHistory.siblingsInformation || ''}
                onChange={(e) => onUpdate('siblingsInformation', e.target.value)}
                placeholder="Enter information about siblings (names, ages, etc.)"
                rows={3}
              />
              <p className="text-xs text-gray-500">Provide details about the learner's siblings</p>
            </div>
          )}
        </div>

        {/* Total Learners in Household */}
        <div className="space-y-2">
          <Label htmlFor="totalLearnersInHousehold">Total Number of Learners in Household *</Label>
          <Input
            id="totalLearnersInHousehold"
            type="number"
            min="1"
            value={studentHistory.totalLearnersInHousehold}
            onChange={(e) => onUpdate('totalLearnersInHousehold', e.target.value)}
            placeholder="Enter a positive integer"
          />
          {errors['studentHistory.totalLearnersInHousehold'] && (
            <p className="text-sm text-red-500">{errors['studentHistory.totalLearnersInHousehold']}</p>
          )}
          <p className="text-xs text-gray-500">Must be a positive integer (1 or greater)</p>
        </div>

        {/* Preschool Information - Only show if not Playschool */}
        {!isPlayschool && needsPreschoolHistory && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2">Last Preschool Attended</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lastSchoolPreschoolName">School Name *</Label>
              <Input
                id="lastSchoolPreschoolName"
                value={studentHistory.lastSchoolPreschoolName}
                onChange={(e) => onUpdate('lastSchoolPreschoolName', e.target.value)}
                placeholder="Enter preschool name"
              />
              {errors['studentHistory.lastSchoolPreschoolName'] && (
                <p className="text-sm text-red-500">{errors['studentHistory.lastSchoolPreschoolName']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastSchoolPreschoolAddress">School Address</Label>
              <Textarea
                id="lastSchoolPreschoolAddress"
                value={studentHistory.lastSchoolPreschoolAddress || ''}
                onChange={(e) => onUpdate('lastSchoolPreschoolAddress', e.target.value)}
                placeholder="Enter preschool address (optional)"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Elementary School Information - Always show for non-Playschool */}
        {!isPlayschool && (
          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2">Last Elementary School Attended</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lastSchoolElementaryName">School Name *</Label>
              <Input
                id="lastSchoolElementaryName"
                value={studentHistory.lastSchoolElementaryName}
                onChange={(e) => onUpdate('lastSchoolElementaryName', e.target.value)}
                placeholder="Enter elementary school name"
              />
              {errors['studentHistory.lastSchoolElementaryName'] && (
                <p className="text-sm text-red-500">{errors['studentHistory.lastSchoolElementaryName']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastSchoolElementaryAddress">School Address</Label>
              <Textarea
                id="lastSchoolElementaryAddress"
                value={studentHistory.lastSchoolElementaryAddress || ''}
                onChange={(e) => onUpdate('lastSchoolElementaryAddress', e.target.value)}
                placeholder="Enter elementary school address (optional)"
                rows={2}
              />
            </div>
          </div>
        )}

        {isPlayschool && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Student history information is not required for Playschool enrollment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
