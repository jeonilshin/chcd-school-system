'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EducationalAttainment = 
  | 'ELEMENTARY_GRADUATE'
  | 'HIGH_SCHOOL_GRADUATE'
  | 'COLLEGE_GRADUATE'
  | 'ELEMENTARY_UNDERGRAD'
  | 'HIGH_SCHOOL_UNDERGRAD'
  | 'COLLEGE_UNDERGRAD'
  | 'OTHERS';

type MaritalStatus = 
  | 'MARRIED'
  | 'SEPARATED'
  | 'SINGLE_PARENT'
  | 'STEPMOTHER'
  | 'STEPFATHER'
  | 'OTHER';

type ParentAvailability = 'BOTH' | 'FATHER_ONLY' | 'MOTHER_ONLY' | 'SINGLE_PARENT';

interface ParentInfo {
  parentAvailability?: ParentAvailability;
  fatherFullName: string;
  fatherOccupation?: string;
  fatherContactNumber: string;
  fatherEmail?: string;
  fatherHasEmail?: boolean;
  fatherHasContactNumber?: boolean;
  fatherEducationalAttainment: EducationalAttainment | '';
  motherFullName: string;
  motherOccupation?: string;
  motherContactNumber: string;
  motherEmail: string;
  motherHasEmail?: boolean;
  motherHasContactNumber?: boolean;
  motherEducationalAttainment: EducationalAttainment | '';
  maritalStatus: MaritalStatus[];
}

interface ParentInformationSectionProps {
  parentInfo: ParentInfo;
  onUpdate: (field: keyof ParentInfo, value: string | MaritalStatus[]) => void;
  errors: Record<string, string>;
}

const EDUCATIONAL_ATTAINMENT_OPTIONS: { value: EducationalAttainment; label: string }[] = [
  { value: 'ELEMENTARY_GRADUATE', label: 'Elementary Graduate' },
  { value: 'HIGH_SCHOOL_GRADUATE', label: 'High School Graduate' },
  { value: 'COLLEGE_GRADUATE', label: 'College Graduate' },
  { value: 'ELEMENTARY_UNDERGRAD', label: 'Elementary Undergraduate' },
  { value: 'HIGH_SCHOOL_UNDERGRAD', label: 'High School Undergraduate' },
  { value: 'COLLEGE_UNDERGRAD', label: 'College Undergraduate' },
  { value: 'OTHERS', label: 'Others' },
];

const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'MARRIED', label: 'Married' },
  { value: 'SEPARATED', label: 'Separated' },
  { value: 'SINGLE_PARENT', label: 'Single Parent' },
  { value: 'STEPMOTHER', label: 'Stepmother' },
  { value: 'STEPFATHER', label: 'Stepfather' },
  { value: 'OTHER', label: 'Other' },
];

export function ParentInformationSection({ parentInfo, onUpdate, errors }: ParentInformationSectionProps) {
  const [showFatherEmail, setShowFatherEmail] = useState(parentInfo.fatherHasEmail !== false);
  const [showFatherContact, setShowFatherContact] = useState(parentInfo.fatherHasContactNumber !== false);
  const [showMotherEmail, setShowMotherEmail] = useState(parentInfo.motherHasEmail !== false);
  const [showMotherContact, setShowMotherContact] = useState(parentInfo.motherHasContactNumber !== false);

  const toggleMaritalStatus = (status: MaritalStatus) => {
    const current = parentInfo.maritalStatus;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onUpdate('maritalStatus', updated);
  };

  const handleParentAvailabilityChange = (value: ParentAvailability) => {
    onUpdate('parentAvailability', value);
  };

  const shouldShowFather = !parentInfo.parentAvailability || 
    parentInfo.parentAvailability === 'BOTH' || 
    parentInfo.parentAvailability === 'FATHER_ONLY';

  const shouldShowMother = !parentInfo.parentAvailability || 
    parentInfo.parentAvailability === 'BOTH' || 
    parentInfo.parentAvailability === 'MOTHER_ONLY' ||
    parentInfo.parentAvailability === 'SINGLE_PARENT';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Information</CardTitle>
        <CardDescription>Father and mother details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parent Availability Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Parent Availability</h3>
          <div className="space-y-2">
            <Label>Which parent(s) are available? *</Label>
            <Select
              value={parentInfo.parentAvailability || ''}
              onValueChange={handleParentAvailabilityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOTH">Both Parents</SelectItem>
                <SelectItem value="FATHER_ONLY">Father Only</SelectItem>
                <SelectItem value="MOTHER_ONLY">Mother Only</SelectItem>
                <SelectItem value="SINGLE_PARENT">Single Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Father Information */}
        {shouldShowFather && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Father's Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherFullName">Full Name *</Label>
                <Input
                  id="fatherFullName"
                  value={parentInfo.fatherFullName}
                  onChange={(e) => onUpdate('fatherFullName', e.target.value)}
                />
                {errors['parentInfo.fatherFullName'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.fatherFullName']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherOccupation">Occupation</Label>
                <Input
                  id="fatherOccupation"
                  value={parentInfo.fatherOccupation || ''}
                  onChange={(e) => onUpdate('fatherOccupation', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fatherContactNumber">Contact Number {showFatherContact && '*'}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fatherNoContact"
                      checked={!showFatherContact}
                      onCheckedChange={(checked) => {
                        setShowFatherContact(!checked);
                        onUpdate('fatherHasContactNumber', !checked);
                        if (checked) onUpdate('fatherContactNumber', 'N/A');
                      }}
                    />
                    <Label htmlFor="fatherNoContact" className="text-sm font-normal cursor-pointer">
                      Not Available
                    </Label>
                  </div>
                </div>
                {showFatherContact ? (
                  <Input
                    id="fatherContactNumber"
                    value={parentInfo.fatherContactNumber}
                    onChange={(e) => onUpdate('fatherContactNumber', e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                  />
                ) : (
                  <Input
                    value="Not Available"
                    disabled
                    className="bg-gray-100"
                  />
                )}
                {errors['parentInfo.fatherContactNumber'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.fatherContactNumber']}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fatherEmail">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fatherNoEmail"
                      checked={!showFatherEmail}
                      onCheckedChange={(checked) => {
                        setShowFatherEmail(!checked);
                        onUpdate('fatherHasEmail', !checked);
                        if (checked) onUpdate('fatherEmail', 'N/A');
                      }}
                    />
                    <Label htmlFor="fatherNoEmail" className="text-sm font-normal cursor-pointer">
                      No Email
                    </Label>
                  </div>
                </div>
                {showFatherEmail ? (
                  <Input
                    id="fatherEmail"
                    type="email"
                    value={parentInfo.fatherEmail || ''}
                    onChange={(e) => onUpdate('fatherEmail', e.target.value)}
                    placeholder="father@example.com"
                  />
                ) : (
                  <Input
                    value="No Email"
                    disabled
                    className="bg-gray-100"
                  />
                )}
                {errors['parentInfo.fatherEmail'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.fatherEmail']}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Highest Educational Attainment *</Label>
              <RadioGroup
                value={parentInfo.fatherEducationalAttainment}
                onValueChange={(value) => onUpdate('fatherEducationalAttainment', value)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EDUCATIONAL_ATTAINMENT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`father-${option.value}`} />
                      <Label htmlFor={`father-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors['parentInfo.fatherEducationalAttainment'] && (
                <p className="text-sm text-red-500">{errors['parentInfo.fatherEducationalAttainment']}</p>
              )}
            </div>
          </div>
        )}

        {/* Mother Information */}
        {shouldShowMother && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Mother's Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motherFullName">Full Name *</Label>
                <Input
                  id="motherFullName"
                  value={parentInfo.motherFullName}
                  onChange={(e) => onUpdate('motherFullName', e.target.value)}
                />
                {errors['parentInfo.motherFullName'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.motherFullName']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherOccupation">Occupation</Label>
                <Input
                  id="motherOccupation"
                  value={parentInfo.motherOccupation || ''}
                  onChange={(e) => onUpdate('motherOccupation', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="motherContactNumber">Contact Number {showMotherContact && '*'}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="motherNoContact"
                      checked={!showMotherContact}
                      onCheckedChange={(checked) => {
                        setShowMotherContact(!checked);
                        onUpdate('motherHasContactNumber', !checked);
                        if (checked) onUpdate('motherContactNumber', 'N/A');
                      }}
                    />
                    <Label htmlFor="motherNoContact" className="text-sm font-normal cursor-pointer">
                      Not Available
                    </Label>
                  </div>
                </div>
                {showMotherContact ? (
                  <Input
                    id="motherContactNumber"
                    value={parentInfo.motherContactNumber}
                    onChange={(e) => onUpdate('motherContactNumber', e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                  />
                ) : (
                  <Input
                    value="Not Available"
                    disabled
                    className="bg-gray-100"
                  />
                )}
                {errors['parentInfo.motherContactNumber'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.motherContactNumber']}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="motherEmail">Email Address {showMotherEmail && '*'}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="motherNoEmail"
                      checked={!showMotherEmail}
                      onCheckedChange={(checked) => {
                        setShowMotherEmail(!checked);
                        onUpdate('motherHasEmail', !checked);
                        if (checked) onUpdate('motherEmail', 'N/A');
                      }}
                    />
                    <Label htmlFor="motherNoEmail" className="text-sm font-normal cursor-pointer">
                      No Email
                    </Label>
                  </div>
                </div>
                {showMotherEmail ? (
                  <Input
                    id="motherEmail"
                    type="email"
                    value={parentInfo.motherEmail}
                    onChange={(e) => onUpdate('motherEmail', e.target.value)}
                    placeholder="mother@example.com"
                  />
                ) : (
                  <Input
                    value="No Email"
                    disabled
                    className="bg-gray-100"
                  />
                )}
                {errors['parentInfo.motherEmail'] && (
                  <p className="text-sm text-red-500">{errors['parentInfo.motherEmail']}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Highest Educational Attainment *</Label>
              <RadioGroup
                value={parentInfo.motherEducationalAttainment}
                onValueChange={(value) => onUpdate('motherEducationalAttainment', value)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EDUCATIONAL_ATTAINMENT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`mother-${option.value}`} />
                      <Label htmlFor={`mother-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors['parentInfo.motherEducationalAttainment'] && (
                <p className="text-sm text-red-500">{errors['parentInfo.motherEducationalAttainment']}</p>
              )}
            </div>
          </div>
        )}

        {/* Marital Status */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Marital Status</h3>
          <div className="space-y-2">
            <Label>Select all that apply *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`marital-${option.value}`}
                    checked={parentInfo.maritalStatus.includes(option.value)}
                    onCheckedChange={() => toggleMaritalStatus(option.value)}
                  />
                  <Label htmlFor={`marital-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors['parentInfo.maritalStatus'] && (
              <p className="text-sm text-red-500">{errors['parentInfo.maritalStatus']}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
