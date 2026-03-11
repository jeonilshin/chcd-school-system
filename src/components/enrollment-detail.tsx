'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatProgram } from '@/lib/format-program';
import type {
  StudentStatus,
  EducationalAttainment,
  MaritalStatus,
  SpecialSkill,
  DocumentType,
  PersonalInfo,
  ParentInfo,
  StudentHistory,
  StudentSkills,
  EnrollmentAgreement,
} from '@/types/enrollment';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface DocumentInfo {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  url: string;
}

interface EnrollmentDetail {
  id: string;
  schoolYear: string;
  program: string;
  studentStatus: StudentStatus;
  status: EnrollmentStatus;
  profilePictureUrl: string;
  personalInfo: PersonalInfo;
  parentInfo: ParentInfo;
  studentHistory: StudentHistory;
  studentSkills: StudentSkills;
  enrollmentAgreement: EnrollmentAgreement;
  documents: DocumentInfo[];
  submittedAt: Date;
  updatedAt: Date;
}

interface EnrollmentDetailProps {
  enrollmentId: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function EnrollmentDetail({ enrollmentId, onApprove, onReject }: EnrollmentDetailProps) {
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEnrollmentDetail();
  }, [enrollmentId]);

  const fetchEnrollmentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/enrollments/${enrollmentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment details');
      }

      const data = await response.json();
      
      // API already returns data in the correct nested format
      const enrollmentDetail: EnrollmentDetail = {
        ...data,
        // Convert date strings to Date objects
        personalInfo: {
          ...data.personalInfo,
          birthday: new Date(data.personalInfo.birthday),
        },
        documents: data.documents?.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          url: `/api/documents/${doc.id}`,
        })) || [],
        submittedAt: new Date(data.submittedAt),
        updatedAt: new Date(data.updatedAt),
      };
      
      setEnrollment(enrollmentDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!enrollment) return;
    
    setIsUpdating(true);
    try {
      await onApprove(enrollment.id);
      await fetchEnrollmentDetail(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve enrollment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!enrollment) return;
    
    setIsUpdating(true);
    try {
      await onReject(enrollment.id);
      await fetchEnrollmentDetail(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject enrollment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetToPending = async () => {
    if (!enrollment) return;
    
    if (!confirm('Are you sure you want to reset this enrollment to PENDING status?')) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/enrollments/${enrollment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PENDING' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset enrollment status');
      }

      await fetchEnrollmentDetail(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset enrollment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatEducationalAttainment = (attainment: EducationalAttainment) => {
    const map: Record<EducationalAttainment, string> = {
      ELEMENTARY_GRADUATE: 'Elementary Graduate',
      HIGH_SCHOOL_GRADUATE: 'High School Graduate',
      COLLEGE_GRADUATE: 'College Graduate',
      ELEMENTARY_UNDERGRAD: 'Elementary Undergraduate',
      HIGH_SCHOOL_UNDERGRAD: 'High School Undergraduate',
      COLLEGE_UNDERGRAD: 'College Undergraduate',
      OTHERS: 'Others',
    };
    return map[attainment];
  };

  const formatMaritalStatus = (statuses: MaritalStatus[] | null | undefined) => {
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return 'Not specified';
    }
    const map: Record<MaritalStatus, string> = {
      MARRIED: 'Married',
      SEPARATED: 'Separated',
      SINGLE_PARENT: 'Single Parent',
      STEPMOTHER: 'Stepmother',
      STEPFATHER: 'Stepfather',
      OTHER: 'Other',
    };
    return statuses.map(s => map[s]).join(', ');
  };

  const formatSpecialSkills = (skills: SpecialSkill[] | null | undefined) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return 'None';
    }
    const map: Record<SpecialSkill, string> = {
      COMPUTER: 'Computer',
      COMPOSITION_WRITING: 'Composition Writing',
      SINGING: 'Singing',
      DANCING: 'Dancing',
      POEM_WRITING: 'Poem Writing',
      COOKING: 'Cooking',
      ACTING: 'Acting',
      PUBLIC_SPEAKING: 'Public Speaking',
      OTHER: 'Other',
    };
    return skills.map(s => map[s]).join(', ');
  };

  const formatDocumentType = (type: DocumentType) => {
    const map: Record<DocumentType, string> = {
      REPORT_CARD: 'Report Card',
      BIRTH_CERTIFICATE: 'Birth Certificate',
      GOOD_MORAL: 'Good Moral Certificate',
      MARRIAGE_CONTRACT: 'Marriage Contract',
      MEDICAL_RECORDS: 'Medical Records',
      SPECIAL_NEEDS_DIAGNOSIS: 'Special Needs Diagnosis',
      PROOF_OF_PAYMENT: 'Proof of Payment',
    };
    return map[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading enrollment details...</p>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Enrollment not found'}</p>
            <Button onClick={fetchEnrollmentDetail} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Home</span>
                <span>/</span>
                <span>Enrollments</span>
                <span>/</span>
                <span className="text-gray-900">Details</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {enrollment.personalInfo.firstName} {enrollment.personalInfo.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {formatDate(enrollment.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(enrollment.status)}
            {enrollment.status === 'PENDING' ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isUpdating}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleResetToPending}
                disabled={isUpdating}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Pending
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6 max-w-7xl mx-auto">

      {/* Enrollment Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Enrollment Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">School Year</p>
            <p className="text-base">{enrollment.schoolYear}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Program</p>
            <p className="text-base">{formatProgram(enrollment.program)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Student Status</p>
            <p className="text-base">
              {enrollment.studentStatus === 'OLD_STUDENT' ? 'Old Student' : 'New Student'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p className="text-base">
              {enrollment.personalInfo.firstName} {enrollment.personalInfo.middleName} {enrollment.personalInfo.lastName}
              {enrollment.personalInfo.nameExtension && ` ${enrollment.personalInfo.nameExtension}`}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nickname</p>
            <p className="text-base">{enrollment.personalInfo.nickname}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sex</p>
            <p className="text-base">{enrollment.personalInfo.sex === 'FEMALE' ? 'Female' : 'Male'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Age</p>
            <p className="text-base">{enrollment.personalInfo.age}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Birthday</p>
            <p className="text-base">{formatDate(enrollment.personalInfo.birthday)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Place of Birth</p>
            <p className="text-base">{enrollment.personalInfo.placeOfBirth}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Religion</p>
            <p className="text-base">{enrollment.personalInfo.religion}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
            <p className="text-base">{enrollment.personalInfo.contactNumber}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Present Address</p>
            <p className="text-base">{enrollment.personalInfo.presentAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Citizenship</p>
            <p className="text-base">
              {enrollment.personalInfo.citizenship === 'FILIPINO' ? 'Filipino' : 'Foreigner'}
              {enrollment.personalInfo.citizenshipSpecification && 
                ` (${enrollment.personalInfo.citizenshipSpecification})`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parent Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Parent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Father's Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Father's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{enrollment.parentInfo.fatherFullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                <p className="text-base">{enrollment.parentInfo.fatherOccupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-base">{enrollment.parentInfo.fatherContactNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{enrollment.parentInfo.fatherEmail || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Educational Attainment</p>
                <p className="text-base">
                  {formatEducationalAttainment(enrollment.parentInfo.fatherEducationalAttainment)}
                </p>
              </div>
            </div>
          </div>

          {/* Mother's Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Mother's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{enrollment.parentInfo.motherFullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                <p className="text-base">{enrollment.parentInfo.motherOccupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-base">{enrollment.parentInfo.motherContactNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{enrollment.parentInfo.motherEmail}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Educational Attainment</p>
                <p className="text-base">
                  {formatEducationalAttainment(enrollment.parentInfo.motherEducationalAttainment)}
                </p>
              </div>
            </div>
          </div>

          {/* Marital Status */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
            <p className="text-base">{formatMaritalStatus(enrollment.parentInfo.maritalStatus)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Student History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Student History</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Siblings Information</p>
            <p className="text-base">{enrollment.studentHistory.siblingsInformation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Learners in Household</p>
            <p className="text-base">{enrollment.studentHistory.totalLearnersInHousehold}</p>
          </div>
          <div></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Preschool Attended</p>
            <p className="text-base">{enrollment.studentHistory.lastSchoolPreschoolName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Preschool Address</p>
            <p className="text-base">{enrollment.studentHistory.lastSchoolPreschoolAddress || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Elementary School Attended</p>
            <p className="text-base">{enrollment.studentHistory.lastSchoolElementaryName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Elementary School Address</p>
            <p className="text-base">{enrollment.studentHistory.lastSchoolElementaryAddress || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Student Skills and Special Needs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Student Skills and Special Needs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Special Skills</p>
            <p className="text-base">
              {formatSpecialSkills(enrollment.studentSkills.specialSkills)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Special Needs Diagnosis</p>
            <p className="text-base">{enrollment.studentSkills.specialNeedsDiagnosis || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Agreement */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Enrollment Agreement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Responsible Person Name</p>
            <p className="text-base">{enrollment.enrollmentAgreement.responsiblePersonName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Relationship to Student</p>
            <p className="text-base">{enrollment.enrollmentAgreement.relationshipToStudent || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
            <p className="text-base">{enrollment.enrollmentAgreement.responsiblePersonContactNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{enrollment.enrollmentAgreement.responsiblePersonEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Enrollment Agreement</p>
            <p className="text-base">
              {enrollment.enrollmentAgreement.enrollmentAgreementAcceptance === 'YES_COMMIT'
                ? 'Committed'
                : 'Not Committed'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Withdrawal Policy</p>
            <p className="text-base">
              {enrollment.enrollmentAgreement.withdrawalPolicyAcceptance === 'YES_AGREED'
                ? 'Agreed'
                : 'Not Agreed'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {enrollment.documents.length} document(s) uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollment.documents.length === 0 ? (
            <p className="text-muted-foreground">No documents uploaded</p>
          ) : (
            <div className="space-y-3">
              {enrollment.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatDocumentType(doc.type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.fileName} • {formatFileSize(doc.fileSize)} • 
                      Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Picture */}
      {enrollment.profilePictureUrl && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={enrollment.profilePictureUrl}
              alt="Student profile"
              className="max-w-xs rounded-lg border"
            />
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}
