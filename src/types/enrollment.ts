// Enrollment data types for the student enrollment system

export type StudentStatus = 'OLD_STUDENT' | 'NEW_STUDENT';
export type Sex = 'FEMALE' | 'MALE';
export type Citizenship = 'FILIPINO' | 'FOREIGNER';

export type EducationalAttainment = 
  | 'ELEMENTARY_GRADUATE'
  | 'HIGH_SCHOOL_GRADUATE'
  | 'COLLEGE_GRADUATE'
  | 'ELEMENTARY_UNDERGRAD'
  | 'HIGH_SCHOOL_UNDERGRAD'
  | 'COLLEGE_UNDERGRAD'
  | 'OTHERS';

export type MaritalStatus = 
  | 'MARRIED'
  | 'SEPARATED'
  | 'SINGLE_PARENT'
  | 'STEPMOTHER'
  | 'STEPFATHER'
  | 'OTHER';

export type SpecialSkill = 
  | 'COMPUTER'
  | 'COMPOSITION_WRITING'
  | 'SINGING'
  | 'DANCING'
  | 'POEM_WRITING'
  | 'COOKING'
  | 'ACTING'
  | 'PUBLIC_SPEAKING'
  | 'OTHER';

export type EnrollmentAgreementAcceptance = 'YES_COMMIT' | 'OTHER';
export type WithdrawalPolicyAcceptance = 'YES_AGREED' | 'NO_DISAGREE';

export type DocumentType = 
  | 'REPORT_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'GOOD_MORAL'
  | 'MARRIAGE_CONTRACT'
  | 'MEDICAL_RECORDS'
  | 'SPECIAL_NEEDS_DIAGNOSIS'
  | 'PROOF_OF_PAYMENT';

export interface PersonalInfo {
  lastName: string;
  firstName: string;
  middleName: string;
  nameExtension?: string;
  nickname: string;
  sex: Sex;
  age: number;
  birthday: Date;
  placeOfBirth: string;
  religion: string;
  presentAddress: string;
  contactNumber: string;
  citizenship: Citizenship;
  citizenshipSpecification?: string;
}

export interface ParentInfo {
  fatherFullName: string;
  fatherOccupation?: string;
  fatherContactNumber: string;
  fatherEmail?: string;
  fatherEducationalAttainment: EducationalAttainment;
  motherFullName: string;
  motherOccupation?: string;
  motherContactNumber: string;
  motherEmail: string;
  motherEducationalAttainment: EducationalAttainment;
  maritalStatus: MaritalStatus[];
}

export interface StudentHistory {
  siblingsInformation?: string;
  totalLearnersInHousehold: number;
  lastSchoolPreschoolName: string;
  lastSchoolPreschoolAddress?: string;
  lastSchoolElementaryName: string;
  lastSchoolElementaryAddress?: string;
}

export interface StudentSkills {
  specialSkills: SpecialSkill[];
  specialNeedsDiagnosis?: string;
}

export interface EnrollmentAgreement {
  responsiblePersonName: string;
  responsiblePersonContactNumber: string;
  responsiblePersonEmail: string;
  relationshipToStudent?: string;
  enrollmentAgreementAcceptance: EnrollmentAgreementAcceptance;
  withdrawalPolicyAcceptance: WithdrawalPolicyAcceptance;
}

export interface ValidationError {
  field: string;
  message: string;
}
