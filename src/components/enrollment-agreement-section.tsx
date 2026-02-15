'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type EnrollmentAgreementAcceptance = 'YES_COMMIT' | 'OTHER';
type WithdrawalPolicyAcceptance = 'YES_AGREED' | 'NO_DISAGREE';

interface EnrollmentAgreement {
  responsiblePersonName: string;
  responsiblePersonContactNumber: string;
  responsiblePersonEmail: string;
  relationshipToStudent?: string;
  enrollmentAgreementAcceptance: EnrollmentAgreementAcceptance | '';
  withdrawalPolicyAcceptance: WithdrawalPolicyAcceptance | '';
}

interface EnrollmentAgreementSectionProps {
  enrollmentAgreement: EnrollmentAgreement;
  onUpdate: (field: keyof EnrollmentAgreement, value: string) => void;
  errors: Record<string, string>;
}

export function EnrollmentAgreementSection({ enrollmentAgreement, onUpdate, errors }: EnrollmentAgreementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Agreement</CardTitle>
        <CardDescription>Responsible person information and agreement acceptance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Responsible Person Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Responsible Person</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsiblePersonName">Full Name *</Label>
              <Input
                id="responsiblePersonName"
                value={enrollmentAgreement.responsiblePersonName}
                onChange={(e) => onUpdate('responsiblePersonName', e.target.value)}
                placeholder="Enter full name"
              />
              {errors['enrollmentAgreement.responsiblePersonName'] && (
                <p className="text-sm text-red-500">{errors['enrollmentAgreement.responsiblePersonName']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipToStudent">Relationship to Student</Label>
              <Input
                id="relationshipToStudent"
                value={enrollmentAgreement.relationshipToStudent || ''}
                onChange={(e) => onUpdate('relationshipToStudent', e.target.value)}
                placeholder="e.g., Mother, Father, Guardian"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsiblePersonContactNumber">Contact Number *</Label>
              <Input
                id="responsiblePersonContactNumber"
                value={enrollmentAgreement.responsiblePersonContactNumber}
                onChange={(e) => onUpdate('responsiblePersonContactNumber', e.target.value)}
                placeholder="+63 XXX XXX XXXX"
              />
              {errors['enrollmentAgreement.responsiblePersonContactNumber'] && (
                <p className="text-sm text-red-500">{errors['enrollmentAgreement.responsiblePersonContactNumber']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsiblePersonEmail">Email Address *</Label>
              <Input
                id="responsiblePersonEmail"
                type="email"
                value={enrollmentAgreement.responsiblePersonEmail}
                onChange={(e) => onUpdate('responsiblePersonEmail', e.target.value)}
                placeholder="responsible@example.com"
              />
              {errors['enrollmentAgreement.responsiblePersonEmail'] && (
                <p className="text-sm text-red-500">{errors['enrollmentAgreement.responsiblePersonEmail']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Agreement Acceptance */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Enrollment Agreement</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-gray-700">
              By enrolling your child at Circular Home Child Development, you commit to:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
              <li>Ensuring regular attendance and punctuality</li>
              <li>Supporting your child's learning and development</li>
              <li>Maintaining open communication with teachers and staff</li>
              <li>Adhering to school policies and procedures</li>
              <li>Paying tuition and fees on time</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Enrollment Agreement Acceptance *</Label>
            <RadioGroup
              value={enrollmentAgreement.enrollmentAgreementAcceptance}
              onValueChange={(value) => onUpdate('enrollmentAgreementAcceptance', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YES_COMMIT" id="agreement-yes" />
                  <Label htmlFor="agreement-yes" className="font-normal cursor-pointer">
                    YES, I COMMIT TO THE ENROLLMENT AGREEMENT
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OTHER" id="agreement-other" />
                  <Label htmlFor="agreement-other" className="font-normal cursor-pointer">
                    Other
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors['enrollmentAgreement.enrollmentAgreementAcceptance'] && (
              <p className="text-sm text-red-500">{errors['enrollmentAgreement.enrollmentAgreementAcceptance']}</p>
            )}
          </div>
        </div>

        {/* Withdrawal Policy Acceptance */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Withdrawal Policy</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">CHCD Withdrawal Policy:</p>
            <p className="text-sm text-gray-700">
              If you decide to withdraw your child from the school, you must provide written notice at least 30 days in advance. 
              Failure to provide proper notice may result in forfeiture of deposits and advance payments. 
              Tuition fees are non-refundable once the school year has commenced.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Withdrawal Policy Acceptance *</Label>
            <RadioGroup
              value={enrollmentAgreement.withdrawalPolicyAcceptance}
              onValueChange={(value) => onUpdate('withdrawalPolicyAcceptance', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YES_AGREED" id="withdrawal-yes" />
                  <Label htmlFor="withdrawal-yes" className="font-normal cursor-pointer">
                    Yes, I have read and agreed with the WITHDRAWAL POLICY OF CHCD
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NO_DISAGREE" id="withdrawal-no" />
                  <Label htmlFor="withdrawal-no" className="font-normal cursor-pointer">
                    No, I do not agree with the Policy
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors['enrollmentAgreement.withdrawalPolicyAcceptance'] && (
              <p className="text-sm text-red-500">{errors['enrollmentAgreement.withdrawalPolicyAcceptance']}</p>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {(enrollmentAgreement.enrollmentAgreementAcceptance === 'OTHER' || 
          enrollmentAgreement.withdrawalPolicyAcceptance === 'NO_DISAGREE') && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600 font-semibold">
              ⚠️ You must accept both agreements to proceed with enrollment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
