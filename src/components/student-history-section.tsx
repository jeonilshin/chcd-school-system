'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentHistory {
  siblingsInformation?: string;
  totalLearnersInHousehold: string;
  lastSchoolPreschoolName: string;
  lastSchoolPreschoolAddress?: string;
  lastSchoolElementaryName: string;
  lastSchoolElementaryAddress?: string;
}

interface StudentHistorySectionProps {
  studentHistory: StudentHistory;
  onUpdate: (field: keyof StudentHistory, value: string) => void;
  errors: Record<string, string>;
}

export function StudentHistorySection({ studentHistory, onUpdate, errors }: StudentHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student History</CardTitle>
        <CardDescription>Educational background and family information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Siblings Information */}
        <div className="space-y-2">
          <Label htmlFor="siblingsInformation">Learner's Siblings Information</Label>
          <Textarea
            id="siblingsInformation"
            value={studentHistory.siblingsInformation || ''}
            onChange={(e) => onUpdate('siblingsInformation', e.target.value)}
            placeholder="Enter information about siblings (names, ages, etc.)"
            rows={3}
          />
          <p className="text-xs text-gray-500">Optional: Provide details about the learner's siblings</p>
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

        {/* Preschool Information */}
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

        {/* Elementary School Information */}
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
      </CardContent>
    </Card>
  );
}
