'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ParentInformationSection } from '@/components/parent-information-section';
import { StudentHistorySection } from '@/components/student-history-section';
import { StudentSkillsSection } from '@/components/student-skills-section';
import { EnrollmentAgreementSection } from '@/components/enrollment-agreement-section';

// Types based on design document
type Sex = 'FEMALE' | 'MALE';
type Citizenship = 'FILIPINO' | 'FOREIGNER';
type StudentStatus = 'OLD_STUDENT' | 'NEW_STUDENT';
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
type EnrollmentAgreementAcceptance = 'YES_COMMIT' | 'OTHER';
type WithdrawalPolicyAcceptance = 'YES_AGREED' | 'NO_DISAGREE';

interface PersonalInfo {
  lastName: string;
  firstName: string;
  middleName: string;
  nameExtension?: string;
  nickname: string;
  sex: Sex | '';
  age: string;
  birthday: string;
  placeOfBirth: string;
  religion: string;
  presentAddress: string;
  contactNumber: string;
  citizenship: Citizenship | '';
  citizenshipSpecification?: string;
}

interface ParentInfo {
  fatherFullName: string;
  fatherOccupation?: string;
  fatherContactNumber: string;
  fatherEmail?: string;
  fatherEducationalAttainment: EducationalAttainment | '';
  motherFullName: string;
  motherOccupation?: string;
  motherContactNumber: string;
  motherEmail: string;
  motherEducationalAttainment: EducationalAttainment | '';
  maritalStatus: MaritalStatus[];
}

interface StudentHistory {
  siblingsInformation?: string;
  totalLearnersInHousehold: string;
  lastSchoolPreschoolName: string;
  lastSchoolPreschoolAddress?: string;
  lastSchoolElementaryName: string;
  lastSchoolElementaryAddress?: string;
}

interface StudentSkills {
  specialSkills: SpecialSkill[];
  specialNeedsDiagnosis?: string;
}

interface EnrollmentAgreement {
  responsiblePersonName: string;
  responsiblePersonContactNumber: string;
  responsiblePersonEmail: string;
  relationshipToStudent?: string;
  enrollmentAgreementAcceptance: EnrollmentAgreementAcceptance | '';
  withdrawalPolicyAcceptance: WithdrawalPolicyAcceptance | '';
}

interface EnrollmentFormData {
  schoolYear: string;
  program: string;
  studentStatus: StudentStatus | '';
  profilePicture?: File;
  personalInfo: PersonalInfo;
  parentInfo: ParentInfo;
  studentHistory: StudentHistory;
  studentSkills: StudentSkills;
  enrollmentAgreement: EnrollmentAgreement;
}

interface ValidationError {
  field: string;
  message: string;
}

interface EnrollmentFormProps {
  onSubmit: (data: EnrollmentFormData) => Promise<void>;
  initialData?: Partial<EnrollmentFormData>;
}

export function EnrollmentForm({ onSubmit, initialData }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    schoolYear: initialData?.schoolYear || '',
    program: initialData?.program || '',
    studentStatus: initialData?.studentStatus || '',
    personalInfo: {
      lastName: '',
      firstName: '',
      middleName: '',
      nameExtension: '',
      nickname: '',
      sex: '',
      age: '',
      birthday: '',
      placeOfBirth: '',
      religion: '',
      presentAddress: '',
      contactNumber: '',
      citizenship: '',
      citizenshipSpecification: '',
      ...initialData?.personalInfo,
    },
    parentInfo: {
      fatherFullName: '',
      fatherOccupation: '',
      fatherContactNumber: '',
      fatherEmail: '',
      fatherEducationalAttainment: '',
      motherFullName: '',
      motherOccupation: '',
      motherContactNumber: '',
      motherEmail: '',
      motherEducationalAttainment: '',
      maritalStatus: [],
      ...initialData?.parentInfo,
    },
    studentHistory: {
      siblingsInformation: '',
      totalLearnersInHousehold: '',
      lastSchoolPreschoolName: '',
      lastSchoolPreschoolAddress: '',
      lastSchoolElementaryName: '',
      lastSchoolElementaryAddress: '',
      ...initialData?.studentHistory,
    },
    studentSkills: {
      specialSkills: [],
      specialNeedsDiagnosis: '',
      ...initialData?.studentSkills,
    },
    enrollmentAgreement: {
      responsiblePersonName: '',
      responsiblePersonContactNumber: '',
      responsiblePersonEmail: '',
      relationshipToStudent: '',
      enrollmentAgreementAcceptance: '',
      withdrawalPolicyAcceptance: '',
      ...initialData?.enrollmentAgreement,
    },
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Basic enrollment info validation
    if (!formData.schoolYear) {
      newErrors.push({ field: 'schoolYear', message: 'School year is required' });
    }
    if (!formData.program) {
      newErrors.push({ field: 'program', message: 'Program is required' });
    }
    if (!formData.studentStatus) {
      newErrors.push({ field: 'studentStatus', message: 'Student status is required' });
    }

    // Personal info validation
    const { personalInfo } = formData;
    if (!personalInfo.lastName) {
      newErrors.push({ field: 'personalInfo.lastName', message: 'Last name is required' });
    }
    if (!personalInfo.firstName) {
      newErrors.push({ field: 'personalInfo.firstName', message: 'First name is required' });
    }
    if (!personalInfo.middleName) {
      newErrors.push({ field: 'personalInfo.middleName', message: 'Middle name is required' });
    }
    if (!personalInfo.nickname) {
      newErrors.push({ field: 'personalInfo.nickname', message: 'Nickname is required' });
    }
    if (!personalInfo.sex) {
      newErrors.push({ field: 'personalInfo.sex', message: 'Sex is required' });
    }
    if (!personalInfo.age) {
      newErrors.push({ field: 'personalInfo.age', message: 'Age is required' });
    }
    if (!personalInfo.birthday) {
      newErrors.push({ field: 'personalInfo.birthday', message: 'Birthday is required' });
    }
    if (!personalInfo.placeOfBirth) {
      newErrors.push({ field: 'personalInfo.placeOfBirth', message: 'Place of birth is required' });
    }
    if (!personalInfo.religion) {
      newErrors.push({ field: 'personalInfo.religion', message: 'Religion is required' });
    }
    if (!personalInfo.presentAddress) {
      newErrors.push({ field: 'personalInfo.presentAddress', message: 'Present address is required' });
    }
    if (!personalInfo.contactNumber) {
      newErrors.push({ field: 'personalInfo.contactNumber', message: 'Contact number is required' });
    }
    if (!personalInfo.citizenship) {
      newErrors.push({ field: 'personalInfo.citizenship', message: 'Citizenship is required' });
    }
    if (personalInfo.citizenship === 'FOREIGNER' && !personalInfo.citizenshipSpecification) {
      newErrors.push({ field: 'personalInfo.citizenshipSpecification', message: 'Country specification is required for foreigners' });
    }

    // Parent info validation
    const { parentInfo } = formData;
    if (!parentInfo.fatherFullName) {
      newErrors.push({ field: 'parentInfo.fatherFullName', message: 'Father\'s full name is required' });
    }
    if (!parentInfo.fatherContactNumber) {
      newErrors.push({ field: 'parentInfo.fatherContactNumber', message: 'Father\'s contact number is required' });
    }
    if (!parentInfo.fatherEducationalAttainment) {
      newErrors.push({ field: 'parentInfo.fatherEducationalAttainment', message: 'Father\'s educational attainment is required' });
    }
    if (!parentInfo.motherFullName) {
      newErrors.push({ field: 'parentInfo.motherFullName', message: 'Mother\'s full name is required' });
    }
    if (!parentInfo.motherContactNumber) {
      newErrors.push({ field: 'parentInfo.motherContactNumber', message: 'Mother\'s contact number is required' });
    }
    if (!parentInfo.motherEmail) {
      newErrors.push({ field: 'parentInfo.motherEmail', message: 'Mother\'s email is required' });
    }
    if (!parentInfo.motherEducationalAttainment) {
      newErrors.push({ field: 'parentInfo.motherEducationalAttainment', message: 'Mother\'s educational attainment is required' });
    }
    if (parentInfo.maritalStatus.length === 0) {
      newErrors.push({ field: 'parentInfo.maritalStatus', message: 'At least one marital status must be selected' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (parentInfo.fatherEmail && !emailRegex.test(parentInfo.fatherEmail)) {
      newErrors.push({ field: 'parentInfo.fatherEmail', message: 'Invalid email format' });
    }
    if (parentInfo.motherEmail && !emailRegex.test(parentInfo.motherEmail)) {
      newErrors.push({ field: 'parentInfo.motherEmail', message: 'Invalid email format' });
    }

    // Student history validation
    const { studentHistory } = formData;
    if (!studentHistory.totalLearnersInHousehold) {
      newErrors.push({ field: 'studentHistory.totalLearnersInHousehold', message: 'Total learners in household is required' });
    } else {
      const total = parseInt(studentHistory.totalLearnersInHousehold);
      if (isNaN(total) || total <= 0) {
        newErrors.push({ field: 'studentHistory.totalLearnersInHousehold', message: 'Must be a positive integer' });
      }
    }
    if (!studentHistory.lastSchoolPreschoolName) {
      newErrors.push({ field: 'studentHistory.lastSchoolPreschoolName', message: 'Last preschool name is required' });
    }
    if (!studentHistory.lastSchoolElementaryName) {
      newErrors.push({ field: 'studentHistory.lastSchoolElementaryName', message: 'Last elementary school name is required' });
    }

    // Enrollment agreement validation
    const { enrollmentAgreement } = formData;
    if (!enrollmentAgreement.responsiblePersonName) {
      newErrors.push({ field: 'enrollmentAgreement.responsiblePersonName', message: 'Responsible person name is required' });
    }
    if (!enrollmentAgreement.responsiblePersonContactNumber) {
      newErrors.push({ field: 'enrollmentAgreement.responsiblePersonContactNumber', message: 'Responsible person contact number is required' });
    }
    if (!enrollmentAgreement.responsiblePersonEmail) {
      newErrors.push({ field: 'enrollmentAgreement.responsiblePersonEmail', message: 'Responsible person email is required' });
    }
    if (enrollmentAgreement.responsiblePersonEmail && !emailRegex.test(enrollmentAgreement.responsiblePersonEmail)) {
      newErrors.push({ field: 'enrollmentAgreement.responsiblePersonEmail', message: 'Invalid email format' });
    }
    if (!enrollmentAgreement.enrollmentAgreementAcceptance) {
      newErrors.push({ field: 'enrollmentAgreement.enrollmentAgreementAcceptance', message: 'Enrollment agreement acceptance is required' });
    }
    if (enrollmentAgreement.enrollmentAgreementAcceptance === 'OTHER') {
      newErrors.push({ field: 'enrollmentAgreement.enrollmentAgreementAcceptance', message: 'You must commit to the enrollment agreement' });
    }
    if (!enrollmentAgreement.withdrawalPolicyAcceptance) {
      newErrors.push({ field: 'enrollmentAgreement.withdrawalPolicyAcceptance', message: 'Withdrawal policy acceptance is required' });
    }
    if (enrollmentAgreement.withdrawalPolicyAcceptance === 'NO_DISAGREE') {
      newErrors.push({ field: 'enrollmentAgreement.withdrawalPolicyAcceptance', message: 'You must agree to the withdrawal policy' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateParentInfo = (field: keyof ParentInfo, value: string | MaritalStatus[]) => {
    setFormData(prev => ({
      ...prev,
      parentInfo: { ...prev.parentInfo, [field]: value }
    }));
  };

  const updateStudentHistory = (field: keyof StudentHistory, value: string) => {
    setFormData(prev => ({
      ...prev,
      studentHistory: { ...prev.studentHistory, [field]: value }
    }));
  };

  const updateStudentSkills = (field: keyof StudentSkills, value: SpecialSkill[] | string) => {
    setFormData(prev => ({
      ...prev,
      studentSkills: { ...prev.studentSkills, [field]: value }
    }));
  };

  const updateEnrollmentAgreement = (field: keyof EnrollmentAgreement, value: string) => {
    setFormData(prev => ({
      ...prev,
      enrollmentAgreement: { ...prev.enrollmentAgreement, [field]: value }
    }));
  };

  const toggleMaritalStatus = (status: MaritalStatus) => {
    const current = formData.parentInfo.maritalStatus;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateParentInfo('maritalStatus', updated);
  };

  const toggleSpecialSkill = (skill: SpecialSkill) => {
    const current = formData.studentSkills.specialSkills;
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    updateStudentSkills('specialSkills', updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Basic Enrollment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Information</CardTitle>
          <CardDescription>Select school year, program, and student status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolYear">School Year *</Label>
              <Select
                value={formData.schoolYear}
                onValueChange={(value) => setFormData(prev => ({ ...prev, schoolYear: value }))}
              >
                <SelectTrigger id="schoolYear">
                  <SelectValue placeholder="Select school year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('schoolYear') && (
                <p className="text-sm text-red-500">{getFieldError('schoolYear')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Select
                value={formData.program}
                onValueChange={(value) => setFormData(prev => ({ ...prev, program: value }))}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playschool AM">Playschool AM</SelectItem>
                  <SelectItem value="Playschool PM">Playschool PM</SelectItem>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="Kinder">Kinder</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('program') && (
                <p className="text-sm text-red-500">{getFieldError('program')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentStatus">Student Status *</Label>
              <Select
                value={formData.studentStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, studentStatus: value as StudentStatus }))}
              >
                <SelectTrigger id="studentStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OLD_STUDENT">Old Student</SelectItem>
                  <SelectItem value="NEW_STUDENT">New Student</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('studentStatus') && (
                <p className="text-sm text-red-500">{getFieldError('studentStatus')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload student's 2x2 photo (white background, taken within 3 months, decent attire, no eyeglasses)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture * (Max 100MB, JPEG or PNG)</Label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size (100MB = 100 * 1024 * 1024 bytes)
                  if (file.size > 100 * 1024 * 1024) {
                    setErrors(prev => [...prev, { field: 'profilePicture', message: 'Profile picture must be less than 100MB' }]);
                    return;
                  }
                  
                  // Validate file type
                  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                    setErrors(prev => [...prev, { field: 'profilePicture', message: 'Profile picture must be JPEG or PNG format' }]);
                    return;
                  }
                  
                  setFormData(prev => ({ ...prev, profilePicture: file }));
                  // Clear any previous errors for this field
                  setErrors(prev => prev.filter(e => e.field !== 'profilePicture'));
                }
              }}
              className="cursor-pointer"
            />
            {formData.profilePicture && (
              <p className="text-sm text-green-600">✓ {formData.profilePicture.name} selected</p>
            )}
            {getFieldError('profilePicture') && (
              <p className="text-sm text-red-500">{getFieldError('profilePicture')}</p>
            )}
            {getFieldError('profilePictureUrl') && (
              <p className="text-sm text-red-500">{getFieldError('profilePictureUrl')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Student's personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.personalInfo.lastName}
                onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
              />
              {getFieldError('personalInfo.lastName') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.lastName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.personalInfo.firstName}
                onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
              />
              {getFieldError('personalInfo.firstName') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.firstName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name *</Label>
              <Input
                id="middleName"
                value={formData.personalInfo.middleName}
                onChange={(e) => updatePersonalInfo('middleName', e.target.value)}
              />
              {getFieldError('personalInfo.middleName') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.middleName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameExtension">Name Extension</Label>
              <Input
                id="nameExtension"
                value={formData.personalInfo.nameExtension || ''}
                onChange={(e) => updatePersonalInfo('nameExtension', e.target.value)}
                placeholder="Jr., Sr., III, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname *</Label>
              <Input
                id="nickname"
                value={formData.personalInfo.nickname}
                onChange={(e) => updatePersonalInfo('nickname', e.target.value)}
              />
              {getFieldError('personalInfo.nickname') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.nickname')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select
                value={formData.personalInfo.sex}
                onValueChange={(value) => updatePersonalInfo('sex', value)}
              >
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('personalInfo.sex') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.sex')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.personalInfo.age}
                onChange={(e) => updatePersonalInfo('age', e.target.value)}
              />
              {getFieldError('personalInfo.age') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.age')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday *</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.personalInfo.birthday}
                onChange={(e) => updatePersonalInfo('birthday', e.target.value)}
              />
              {getFieldError('personalInfo.birthday') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.birthday')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeOfBirth">Place of Birth *</Label>
              <Input
                id="placeOfBirth"
                value={formData.personalInfo.placeOfBirth}
                onChange={(e) => updatePersonalInfo('placeOfBirth', e.target.value)}
              />
              {getFieldError('personalInfo.placeOfBirth') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.placeOfBirth')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="religion">Religion *</Label>
              <Input
                id="religion"
                value={formData.personalInfo.religion}
                onChange={(e) => updatePersonalInfo('religion', e.target.value)}
              />
              {getFieldError('personalInfo.religion') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.religion')}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="presentAddress">Present Address *</Label>
              <Textarea
                id="presentAddress"
                value={formData.personalInfo.presentAddress}
                onChange={(e) => updatePersonalInfo('presentAddress', e.target.value)}
              />
              {getFieldError('personalInfo.presentAddress') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.presentAddress')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={formData.personalInfo.contactNumber}
                onChange={(e) => updatePersonalInfo('contactNumber', e.target.value)}
              />
              {getFieldError('personalInfo.contactNumber') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.contactNumber')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizenship">Citizenship *</Label>
              <Select
                value={formData.personalInfo.citizenship}
                onValueChange={(value) => updatePersonalInfo('citizenship', value)}
              >
                <SelectTrigger id="citizenship">
                  <SelectValue placeholder="Select citizenship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILIPINO">Filipino</SelectItem>
                  <SelectItem value="FOREIGNER">Foreigner</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('personalInfo.citizenship') && (
                <p className="text-sm text-red-500">{getFieldError('personalInfo.citizenship')}</p>
              )}
            </div>

            {formData.personalInfo.citizenship === 'FOREIGNER' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="citizenshipSpecification">Country *</Label>
                <Input
                  id="citizenshipSpecification"
                  value={formData.personalInfo.citizenshipSpecification || ''}
                  onChange={(e) => updatePersonalInfo('citizenshipSpecification', e.target.value)}
                  placeholder="Specify country"
                />
                {getFieldError('personalInfo.citizenshipSpecification') && (
                  <p className="text-sm text-red-500">{getFieldError('personalInfo.citizenshipSpecification')}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parent Information */}
      <ParentInformationSection
        parentInfo={formData.parentInfo}
        onUpdate={updateParentInfo}
        errors={Object.fromEntries(errors.map(e => [e.field, e.message]))}
      />

      {/* Student History */}
      <StudentHistorySection
        studentHistory={formData.studentHistory}
        onUpdate={updateStudentHistory}
        errors={Object.fromEntries(errors.map(e => [e.field, e.message]))}
      />

      {/* Student Skills */}
      <StudentSkillsSection
        studentSkills={formData.studentSkills}
        onUpdate={updateStudentSkills}
        errors={Object.fromEntries(errors.map(e => [e.field, e.message]))}
      />

      {/* Enrollment Agreement */}
      <EnrollmentAgreementSection
        enrollmentAgreement={formData.enrollmentAgreement}
        onUpdate={updateEnrollmentAgreement}
        errors={Object.fromEntries(errors.map(e => [e.field, e.message]))}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
        </Button>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-500">
                  {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
