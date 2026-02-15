'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EnrollmentForm } from '@/components/enrollment-form';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, User, FileText, CheckCircle, Home, UserPlus, Camera, Upload, Users, GraduationCap, ClipboardCheck, X, Check } from 'lucide-react';

type EnrollmentInfo = {
  id: string;
  studentName: string;
  status: string;
};

export default function EnrollPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'choice' | 'program' | 'studentStatus' | 'photo' | 'personalInfo' | 'parentInfo' | 'studentHistory' | 'oldStudentForm' | 'agreements' | 'form'>('email');
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [program, setProgram] = useState('');
  const [session, setSession] = useState('');
  const [month, setMonth] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [studentStatus, setStudentStatus] = useState<'OLD_STUDENT' | 'NEW_STUDENT' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingEnrollments, setExistingEnrollments] = useState<EnrollmentInfo[]>([]);
  const [hasAccount, setHasAccount] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  
  // Form data
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [personalInfo, setPersonalInfo] = useState({
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
  });
  const [parentInfo, setParentInfo] = useState({
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
    motherEducationalAttainmentOther: '',
    maritalStatus: [] as string[],
    maritalStatusOther: '',
    siblingsInformation: '',
    totalLearnersInHousehold: '',
  });
  const [studentHistory, setStudentHistory] = useState({
    lastSchoolPreschoolName: '',
    lastSchoolPreschoolAddress: '',
    lastSchoolElementaryName: '',
    lastSchoolElementaryAddress: '',
    specialSkills: [] as string[],
    specialSkillsOther: '',
    specialNeedsDiagnosis: '',
  });
  const [agreements, setAgreements] = useState({
    responsiblePersonName: '',
    responsiblePersonContactNumber: '',
    responsiblePersonEmail: '',
    relationshipToStudent: '',
    enrollmentAgreementAcceptance: false,
    withdrawalPolicyAcceptance: false,
  });
  const [oldStudentInfo, setOldStudentInfo] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthday: '',
    age: '',
    religion: '',
    address: '',
    fatherName: '',
    fatherContactNumber: '',
    fatherEmail: '',
    motherName: '',
    motherContactNumber: '',
    motherEmail: '',
    newInformation: '',
  });
  const [showEnrollmentAgreement, setShowEnrollmentAgreement] = useState(false);
  const [showWithdrawalPolicy, setShowWithdrawalPolicy] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Auto-save to localStorage
  useEffect(() => {
    if (email) {
      const enrollmentData = {
        email,
        program,
        session,
        month,
        gradeLevel,
        studentStatus,
        profilePicturePreview,
        personalInfo,
        parentInfo,
        studentHistory,
        oldStudentInfo,
        agreements,
        step,
      };
      localStorage.setItem(`enrollment_draft_${email}`, JSON.stringify(enrollmentData));
    }
  }, [email, program, session, month, gradeLevel, studentStatus, profilePicturePreview, personalInfo, parentInfo, studentHistory, oldStudentInfo, agreements, step]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
    
    // Check for saved data when email changes
    if (validateEmail(newEmail)) {
      const savedData = localStorage.getItem(`enrollment_draft_${newEmail}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.email === newEmail) {
            if (parsed.program) setProgram(parsed.program);
            if (parsed.session) setSession(parsed.session);
            if (parsed.month) setMonth(parsed.month);
            if (parsed.gradeLevel) setGradeLevel(parsed.gradeLevel);
            if (parsed.studentStatus) setStudentStatus(parsed.studentStatus);
            if (parsed.profilePicturePreview) setProfilePicturePreview(parsed.profilePicturePreview);
            if (parsed.personalInfo) {
              setPersonalInfo(parsed.personalInfo);
            }
            if (parsed.parentInfo) {
              setParentInfo(parsed.parentInfo);
            }
            if (parsed.studentHistory) {
              setStudentHistory(parsed.studentHistory);
            }
            if (parsed.agreements) {
              setAgreements(parsed.agreements);
            }
            if (parsed.oldStudentInfo) {
              setOldStudentInfo(parsed.oldStudentInfo);
            }
            setHasSavedData(true);
            
            // Create a dummy file object if we have a preview
            // This allows the form to proceed without re-uploading
            if (parsed.profilePicturePreview) {
              // Set a placeholder file to indicate photo exists
              const dummyFile = new File([''], 'restored-photo.jpg', { type: 'image/jpeg' });
              setProfilePicture(dummyFile);
            }
          }
        } catch (e) {
          console.error('Failed to load saved enrollment data', e);
        }
      } else {
        setHasSavedData(false);
      }
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleParentInfoChange = (field: string, value: string) => {
    setParentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentHistoryChange = (field: string, value: string) => {
    setStudentHistory(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialSkillsChange = (skill: string) => {
    setStudentHistory(prev => {
      const currentSkills = prev.specialSkills;
      if (currentSkills.includes(skill)) {
        return { ...prev, specialSkills: currentSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, specialSkills: [...currentSkills, skill] };
      }
    });
  };

  const handleAgreementsChange = (field: string, value: string | boolean) => {
    setAgreements(prev => ({ ...prev, [field]: value }));
  };

  const handleOldStudentInfoChange = (field: string, value: string) => {
    setOldStudentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMaritalStatusChange = (status: string) => {
    setParentInfo(prev => {
      const currentStatuses = prev.maritalStatus;
      if (currentStatuses.includes(status)) {
        return { ...prev, maritalStatus: currentStatuses.filter(s => s !== status) };
      } else {
        return { ...prev, maritalStatus: [...currentStatuses, status] };
      }
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if email exists with enrollments or account
      const response = await fetch(`/api/enrollments/check-email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      const result = await response.json();
      
      if (result.hasAccount || result.enrollments.length > 0) {
        // Email exists - show choice
        setExistingEnrollments(result.enrollments);
        setHasAccount(result.hasAccount);
        setStep('choice');
      } else {
        // New email - go to program selection
        setStep('program');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentSubmit = async (_data: unknown) => {
    try {
      // Upload profile picture if provided and it's a real file (not restored)
      let profilePictureUrl = profilePicturePreview || '';
      
      if (profilePicture && profilePicture.size > 0) {
        const tempEnrollmentId = `temp_${Date.now()}`;
        const formData = new FormData();
        formData.append('file', profilePicture);
        formData.append('isProfilePicture', 'true');
        
        const uploadResponse = await fetch(`/api/enrollments/${tempEnrollmentId}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          profilePictureUrl = (uploadResult as { url?: string; fileUrl?: string }).url || (uploadResult as { url?: string; fileUrl?: string }).fileUrl || '';
        }
      }
      
      // Prepare enrollment data from state
      const enrollmentData = {
        schoolYear: new Date().getFullYear().toString(),
        program: `${program}${session ? `_${session}` : ''}${gradeLevel ? `_GRADE_${gradeLevel}` : ''}${month ? `_${month}` : ''}`,
        studentStatus: studentStatus,
        profilePictureUrl: profilePictureUrl || '/uploads/default-profile.jpg',
        personalInfo: {
          lastName: personalInfo.lastName,
          firstName: personalInfo.firstName,
          middleName: personalInfo.middleName,
          nameExtension: personalInfo.nameExtension || '',
          nickname: personalInfo.nickname,
          sex: personalInfo.sex,
          age: parseInt(personalInfo.age),
          birthday: personalInfo.birthday,
          placeOfBirth: personalInfo.placeOfBirth,
          religion: personalInfo.religion,
          presentAddress: personalInfo.presentAddress,
          contactNumber: personalInfo.contactNumber,
          citizenship: personalInfo.citizenship,
          citizenshipSpecification: personalInfo.citizenshipSpecification || '',
        },
        parentInfo: {
          fatherFullName: parentInfo.fatherFullName,
          fatherOccupation: parentInfo.fatherOccupation || '',
          fatherContactNumber: parentInfo.fatherContactNumber,
          fatherEmail: parentInfo.fatherEmail || '',
          fatherEducationalAttainment: parentInfo.fatherEducationalAttainment,
          motherFullName: parentInfo.motherFullName,
          motherOccupation: parentInfo.motherOccupation || '',
          motherContactNumber: parentInfo.motherContactNumber,
          motherEmail: parentInfo.motherEmail,
          motherEducationalAttainment: parentInfo.motherEducationalAttainment,
          maritalStatus: parentInfo.maritalStatus,
          siblingsInformation: parentInfo.siblingsInformation || '',
          email: email,
        },
        studentHistory: {
          lastSchoolPreschoolName: studentHistory.lastSchoolPreschoolName,
          lastSchoolPreschoolAddress: studentHistory.lastSchoolPreschoolAddress || '',
          lastSchoolElementaryName: studentHistory.lastSchoolElementaryName,
          lastSchoolElementaryAddress: studentHistory.lastSchoolElementaryAddress || '',
          specialSkills: studentHistory.specialSkills,
          specialNeedsDiagnosis: studentHistory.specialNeedsDiagnosis || '',
          totalLearnersInHousehold: parentInfo.totalLearnersInHousehold !== '' && parentInfo.totalLearnersInHousehold !== null && parentInfo.totalLearnersInHousehold !== undefined 
            ? parseInt(parentInfo.totalLearnersInHousehold) 
            : 1,
          siblingsInformation: parentInfo.siblingsInformation || '',
        },
        studentSkills: {
          specialSkills: studentHistory.specialSkills,
        },
        enrollmentAgreement: {
          responsiblePersonName: agreements.responsiblePersonName,
          responsiblePersonContactNumber: agreements.responsiblePersonContactNumber,
          responsiblePersonEmail: agreements.responsiblePersonEmail,
          relationshipToStudent: agreements.relationshipToStudent || '',
          enrollmentAgreementAcceptance: agreements.enrollmentAgreementAcceptance ? 'YES_COMMIT' : 'OTHER',
          withdrawalPolicyAcceptance: agreements.withdrawalPolicyAcceptance ? 'YES_AGREED' : 'NO_DISAGREE',
        },
      };

      console.log('Submitting enrollment data:', JSON.stringify(enrollmentData, null, 2));
      
      // Submit enrollment
      const response = await fetch('/api/public/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.errors && Array.isArray(error.errors)) {
          const errorMessages = error.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(error.error || error.message || 'Failed to submit enrollment');
        }
        throw new Error(error.message || 'Failed to submit enrollment');
      }

      await response.json();
      
      // Clear saved draft after successful submission
      localStorage.removeItem(`enrollment_draft_${email}`);
      
      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      throw error;
    }
  };

  // Step 1: Email Input
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8B5E5] rounded-3xl opacity-20 rotate-12"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-[#F4B5C8] rounded-full opacity-20"></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-[#A8B5E5] rounded-full opacity-15"></div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <Mail className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Start Your Enrollment
              </h1>
              <p className="text-lg text-gray-600">
                Enter your email address to begin the journey
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                {hasSavedData && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                    <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      We found your saved enrollment data! Your progress has been restored.
                    </p>
                  </div>
                )}
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                      Parent/Guardian Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className="h-14 text-base border-2 border-gray-200 rounded-2xl focus:border-[#A8B5E5] focus:ring-[#A8B5E5]"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className={`w-full h-14 text-base text-white rounded-2xl font-semibold shadow-lg transition-all ${
                      isValidEmail 
                        ? 'bg-[#7B8BC7] hover:bg-[#6A7AB6]' 
                        : 'bg-[#A8B5E5] hover:bg-[#8FA0D9]'
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking...' : (
                      <span className="flex items-center justify-center gap-2">
                        Continue <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer message */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Learning with us will be fun and make you happy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Choice for existing users
  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        {/* Decorative shapes */}
        <div className="absolute top-32 right-10 w-36 h-36 bg-[#F4B5C8] rounded-3xl opacity-20 -rotate-12"></div>
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#A8B5E5] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <CheckCircle className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Welcome Back!
              </h1>
              <p className="text-lg text-gray-600">
                We found existing records for {email}
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden mb-6">
              <CardContent className="p-8 space-y-8">
                {existingEnrollments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-[#A8B5E5]" />
                      Your Enrollments
                    </h3>
                    <div className="space-y-3">
                      {existingEnrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="p-5 bg-gradient-to-r from-[#A8B5E5]/10 to-[#F4B5C8]/10 rounded-2xl border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                              <User className="w-6 h-6 text-[#A8B5E5]" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                {enrollment.studentName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: <span className="font-medium">{enrollment.status}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800">What would you like to do?</h3>
                  
                  <div className="space-y-3">
                    {hasAccount && (
                      <Button
                        onClick={() => router.push('/auth/signin')}
                        className="w-full h-auto py-5 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Home className="w-6 h-6" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-base">Go to Parent Portal</div>
                            <div className="text-sm opacity-90">
                              View and manage your enrollments
                            </div>
                          </div>
                        </div>
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => setStep('program')}
                      variant="outline"
                      className="w-full h-auto py-5 border-2 border-gray-300 hover:bg-gray-50 rounded-2xl shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#F4B5C8]/20 rounded-xl flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-[#F4B5C8]" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-base text-gray-800">Enroll Another Child</div>
                          <div className="text-sm text-gray-600">
                            Submit a new enrollment application
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('email')}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl"
                >
                  ← Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Program Selection
  if (step === 'program') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8B5E5] rounded-3xl opacity-20 rotate-12"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-[#F4B5C8] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <FileText className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Select Program & Schedule
              </h1>
              <p className="text-lg text-gray-600">
                Choose the program that fits your child's needs
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                {/* Playschool Monthly */}
                <div 
                  onClick={() => {
                    setProgram('PLAYSCHOOL_MONTHLY');
                    setSession('');
                    setMonth('');
                  }}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                    program === 'PLAYSCHOOL_MONTHLY' 
                      ? 'border-[#A8B5E5] bg-[#A8B5E5]/5' 
                      : 'border-gray-200 hover:border-[#A8B5E5]/50'
                  }`}
                >
                  <h3 className="font-bold text-xl text-gray-800 mb-3">Playschool Monthly</h3>
                  {program === 'PLAYSCHOOL_MONTHLY' && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Select Session *</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSession('AM'); }}
                            className={`p-4 rounded-xl text-left transition-all ${
                              session === 'AM' 
                                ? 'bg-[#A8B5E5] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <div className="font-semibold">AM Session</div>
                            <div className="text-sm opacity-90">8:00 - 11:00 AM</div>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSession('PM'); }}
                            className={`p-4 rounded-xl text-left transition-all ${
                              session === 'PM' 
                                ? 'bg-[#A8B5E5] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <div className="font-semibold">PM Session</div>
                            <div className="text-sm opacity-90">1:00 - 4:00 PM</div>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="month" className="text-base font-semibold">What Month? *</Label>
                        <Input
                          id="month"
                          type="text"
                          placeholder="e.g., January, February, etc."
                          value={month}
                          onChange={(e) => { e.stopPropagation(); setMonth(e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-12 border-2 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Playschool Yearly */}
                <div 
                  onClick={() => {
                    setProgram('PLAYSCHOOL_YEARLY');
                    setSession('');
                    setMonth('');
                  }}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                    program === 'PLAYSCHOOL_YEARLY' 
                      ? 'border-[#A8B5E5] bg-[#A8B5E5]/5' 
                      : 'border-gray-200 hover:border-[#A8B5E5]/50'
                  }`}
                >
                  <h3 className="font-bold text-xl text-gray-800 mb-3">Playschool Yearly</h3>
                  {program === 'PLAYSCHOOL_YEARLY' && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-semibold">Select Session *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSession('AM'); }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            session === 'AM' 
                              ? 'bg-[#A8B5E5] text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">AM Session</div>
                          <div className="text-sm opacity-90">8:00 - 11:00 AM</div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSession('PM'); }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            session === 'PM' 
                              ? 'bg-[#A8B5E5] text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">PM Session</div>
                          <div className="text-sm opacity-90">1:00 - 4:00 PM</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kinder */}
                <div 
                  onClick={() => {
                    setProgram('KINDER');
                    setSession('');
                    setMonth('');
                  }}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                    program === 'KINDER' 
                      ? 'border-[#A8B5E5] bg-[#A8B5E5]/5' 
                      : 'border-gray-200 hover:border-[#A8B5E5]/50'
                  }`}
                >
                  <h3 className="font-bold text-xl text-gray-800 mb-3">Kinder</h3>
                  {program === 'KINDER' && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-semibold">Select Session *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSession('AM'); }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            session === 'AM' 
                              ? 'bg-[#A8B5E5] text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">AM Session</div>
                          <div className="text-sm opacity-90">8:00 - 11:00 AM</div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSession('PM'); }}
                          className={`p-4 rounded-xl text-left transition-all ${
                            session === 'PM' 
                              ? 'bg-[#A8B5E5] text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">PM Session</div>
                          <div className="text-sm opacity-90">12:30 - 3:30 PM</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade 1-6 */}
                <div 
                  onClick={() => {
                    setProgram('GRADE_1_6');
                    setSession('');
                    setMonth('');
                    setGradeLevel('');
                  }}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                    program === 'GRADE_1_6' 
                      ? 'border-[#A8B5E5] bg-[#A8B5E5]/5' 
                      : 'border-gray-200 hover:border-[#A8B5E5]/50'
                  }`}
                >
                  <h3 className="font-bold text-xl text-gray-800 mb-3">Grade 1 - 6</h3>
                  <p className="text-gray-600 mb-3">Full day program</p>
                  {program === 'GRADE_1_6' && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-semibold">Select Grade Level *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['1', '2', '3', '4', '5', '6'].map((grade) => (
                          <button
                            key={grade}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGradeLevel(grade); }}
                            className={`p-4 rounded-xl text-center font-semibold transition-all ${
                              gradeLevel === grade 
                                ? 'bg-[#A8B5E5] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Grade {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setStep(existingEnrollments.length > 0 ? 'choice' : 'email')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!program) {
                        alert('Please select a program');
                        return;
                      }
                      if (program !== 'GRADE_1_6' && !session) {
                        alert('Please select a session');
                        return;
                      }
                      if (program === 'PLAYSCHOOL_MONTHLY' && !month) {
                        alert('Please enter the month');
                        return;
                      }
                      if (program === 'GRADE_1_6' && !gradeLevel) {
                        alert('Please select a grade level');
                        return;
                      }
                      setStep('studentStatus');
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Student Status
  if (step === 'studentStatus') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-32 right-10 w-36 h-36 bg-[#F4B5C8] rounded-3xl opacity-20 -rotate-12"></div>
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#A8B5E5] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <User className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Student Status
              </h1>
              <p className="text-lg text-gray-600">
                Is this an old or new student?
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <button
                  onClick={() => setStudentStatus('OLD_STUDENT')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all ${
                    studentStatus === 'OLD_STUDENT'
                      ? 'border-[#A8B5E5] bg-[#A8B5E5]/5'
                      : 'border-gray-200 hover:border-[#A8B5E5]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      studentStatus === 'OLD_STUDENT' ? 'bg-[#A8B5E5]' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${
                        studentStatus === 'OLD_STUDENT' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Old Student</h3>
                      <p className="text-gray-600">Returning student</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStudentStatus('NEW_STUDENT')}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all ${
                    studentStatus === 'NEW_STUDENT'
                      ? 'border-[#F4B5C8] bg-[#F4B5C8]/5'
                      : 'border-gray-200 hover:border-[#F4B5C8]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      studentStatus === 'NEW_STUDENT' ? 'bg-[#F4B5C8]' : 'bg-gray-100'
                    }`}>
                      <UserPlus className={`w-8 h-8 ${
                        studentStatus === 'NEW_STUDENT' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">New Student</h3>
                      <p className="text-gray-600">First time enrolling</p>
                    </div>
                  </div>
                </button>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setStep('program')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!studentStatus) {
                        alert('Please select student status');
                        return;
                      }
                      // For new students, go to photo upload step
                      if (studentStatus === 'NEW_STUDENT') {
                        setStep('photo');
                      } else {
                        // For old students, go to simplified form
                        setStep('oldStudentForm');
                      }
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Photo Upload (New Students Only)
  if (step === 'photo') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8B5E5] rounded-3xl opacity-20 rotate-12"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-[#F4B5C8] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <Camera className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Upload Learner's Picture
              </h1>
              <p className="text-lg text-gray-600">
                Step 1 of 2: Photo Requirements
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Instructions */}
              <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#A8B5E5]" />
                    Photo Requirements
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A8B5E5] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <span className="text-gray-700">The picture must have a <strong>white background</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A8B5E5] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <span className="text-gray-700">The picture must be taken <strong>3 months prior</strong> to uploading</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A8B5E5] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <span className="text-gray-700">The learner must wear <strong>decent attire</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A8B5E5] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <span className="text-gray-700">The learner should <strong>not wear eyeglasses</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#A8B5E5] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <span className="text-gray-700">You may take the pictures at home following the instructions given</span>
                    </li>
                  </ul>

                  <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                    <p className="text-sm text-gray-700 font-semibold mb-2">Sample Photo:</p>
                    <img 
                      src="/pfp.png" 
                      alt="Sample profile picture" 
                      className="w-32 h-32 object-cover rounded-2xl mx-auto border-2 border-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right: Upload */}
              <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-bold text-xl text-gray-800 mb-6">Upload Photo</h3>
                  
                  <div className="space-y-6">
                    {profilePicturePreview ? (
                      <div className="text-center">
                        <img 
                          src={profilePicturePreview} 
                          alt="Preview" 
                          className="w-64 h-64 object-cover rounded-3xl mx-auto border-4 border-[#A8B5E5] shadow-lg"
                        />
                        <Button
                          onClick={() => {
                            setProfilePicture(null);
                            setProfilePicturePreview('');
                          }}
                          variant="outline"
                          className="mt-4 rounded-2xl"
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-4 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-[#A8B5E5] transition-all">
                          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-700 font-semibold mb-2">Click to upload photo</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button
                      onClick={() => setStep('studentStatus')}
                      variant="ghost"
                      className="flex-1 rounded-2xl"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!profilePicture && !profilePicturePreview) {
                          alert('Please upload a photo');
                          return;
                        }
                        setStep('personalInfo');
                      }}
                      className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                      disabled={!profilePicture && !profilePicturePreview}
                    >
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Personal Information (New Students Only)
  if (step === 'personalInfo') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#A8B5E5] rounded-full opacity-15"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-[#F4B5C8] rounded-3xl opacity-15 rotate-45"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <User className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Personal Information
              </h1>
              <p className="text-lg text-gray-600">
                Step 2 of 2: Student Details
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-base font-semibold">Middle Name *</Label>
                    <Input
                      id="middleName"
                      value={personalInfo.middleName}
                      onChange={(e) => handlePersonalInfoChange('middleName', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Name Extension */}
                  <div className="space-y-2">
                    <Label htmlFor="nameExtension" className="text-base font-semibold">Name Ext. (Jr., Sr., III, etc.)</Label>
                    <Input
                      id="nameExtension"
                      value={personalInfo.nameExtension}
                      onChange={(e) => handlePersonalInfoChange('nameExtension', e.target.value)}
                      placeholder="Optional"
                      className="h-12 border-2 rounded-xl"
                    />
                  </div>

                  {/* Nickname */}
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-base font-semibold">Nickname *</Label>
                    <Input
                      id="nickname"
                      value={personalInfo.nickname}
                      onChange={(e) => handlePersonalInfoChange('nickname', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Sex */}
                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-base font-semibold">Sex *</Label>
                    <select
                      id="sex"
                      value={personalInfo.sex}
                      onChange={(e) => handlePersonalInfoChange('sex', e.target.value)}
                      className="w-full h-12 border-2 rounded-xl px-3 bg-white"
                      required
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-semibold">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={personalInfo.age}
                      onChange={(e) => handlePersonalInfoChange('age', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-base font-semibold">Birthday *</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={personalInfo.birthday}
                      onChange={(e) => handlePersonalInfoChange('birthday', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Place of Birth */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="placeOfBirth" className="text-base font-semibold">Place of Birth *</Label>
                    <Input
                      id="placeOfBirth"
                      value={personalInfo.placeOfBirth}
                      onChange={(e) => handlePersonalInfoChange('placeOfBirth', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Religion */}
                  <div className="space-y-2">
                    <Label htmlFor="religion" className="text-base font-semibold">Religion *</Label>
                    <Input
                      id="religion"
                      value={personalInfo.religion}
                      onChange={(e) => handlePersonalInfoChange('religion', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-base font-semibold">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      value={personalInfo.contactNumber}
                      onChange={(e) => handlePersonalInfoChange('contactNumber', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Present Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="presentAddress" className="text-base font-semibold">Present Address *</Label>
                    <Input
                      id="presentAddress"
                      value={personalInfo.presentAddress}
                      onChange={(e) => handlePersonalInfoChange('presentAddress', e.target.value)}
                      className="h-12 border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Citizenship */}
                  <div className="space-y-2">
                    <Label htmlFor="citizenship" className="text-base font-semibold">Citizenship *</Label>
                    <select
                      id="citizenship"
                      value={personalInfo.citizenship}
                      onChange={(e) => handlePersonalInfoChange('citizenship', e.target.value)}
                      className="w-full h-12 border-2 rounded-xl px-3 bg-white"
                      required
                    >
                      <option value="">Select</option>
                      <option value="FILIPINO">Filipino</option>
                      <option value="FOREIGNER">Foreigner</option>
                    </select>
                  </div>

                  {/* Citizenship Specification (if Foreigner) */}
                  {personalInfo.citizenship === 'FOREIGNER' && (
                    <div className="space-y-2">
                      <Label htmlFor="citizenshipSpecification" className="text-base font-semibold">Please Specify *</Label>
                      <Input
                        id="citizenshipSpecification"
                        value={personalInfo.citizenshipSpecification}
                        onChange={(e) => handlePersonalInfoChange('citizenshipSpecification', e.target.value)}
                        placeholder="Country"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep('photo')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      // Validate required fields
                      if (!personalInfo.lastName || !personalInfo.firstName || !personalInfo.middleName ||
                          !personalInfo.nickname || !personalInfo.sex || !personalInfo.age ||
                          !personalInfo.birthday || !personalInfo.placeOfBirth || !personalInfo.religion ||
                          !personalInfo.presentAddress || !personalInfo.contactNumber || !personalInfo.citizenship) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      if (personalInfo.citizenship === 'FOREIGNER' && !personalInfo.citizenshipSpecification) {
                        alert('Please specify your citizenship');
                        return;
                      }
                      setStep('parentInfo');
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Parent Information (New Students Only)
  if (step === 'parentInfo') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8B5E5] rounded-3xl opacity-20 rotate-12"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-[#F4B5C8] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <Users className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Parent Information
              </h1>
              <p className="text-lg text-gray-600">
                Step 3 of 3: Family Details
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {/* Father's Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#A8B5E5] pb-2">
                    Father's Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Full Name *</Label>
                      <Input
                        value={parentInfo.fatherFullName}
                        onChange={(e) => handleParentInfoChange('fatherFullName', e.target.value)}
                        placeholder="Last Name, First Name"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Occupation</Label>
                      <Input
                        value={parentInfo.fatherOccupation}
                        onChange={(e) => handleParentInfoChange('fatherOccupation', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Contact Number *</Label>
                      <Input
                        value={parentInfo.fatherContactNumber}
                        onChange={(e) => handleParentInfoChange('fatherContactNumber', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address</Label>
                      <Input
                        type="email"
                        value={parentInfo.fatherEmail}
                        onChange={(e) => handleParentInfoChange('fatherEmail', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Highest Educational Attainment *</Label>
                      <select
                        value={parentInfo.fatherEducationalAttainment}
                        onChange={(e) => handleParentInfoChange('fatherEducationalAttainment', e.target.value)}
                        className="w-full h-12 border-2 rounded-xl px-3 bg-white"
                        required
                      >
                        <option value="">Select</option>
                        <option value="ELEMENTARY_GRADUATE">Elementary Graduate</option>
                        <option value="HIGH_SCHOOL_GRADUATE">High School Graduate</option>
                        <option value="COLLEGE_GRADUATE">College Graduate</option>
                        <option value="ELEMENTARY_UNDERGRAD">Elementary Undergraduate</option>
                        <option value="HIGH_SCHOOL_UNDERGRAD">High School Undergraduate</option>
                        <option value="COLLEGE_UNDERGRAD">College Undergraduate</option>
                        <option value="OTHERS">Others</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#F4B5C8] pb-2">
                    Mother's Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Full Name *</Label>
                      <Input
                        value={parentInfo.motherFullName}
                        onChange={(e) => handleParentInfoChange('motherFullName', e.target.value)}
                        placeholder="Last Name, First Name"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Occupation</Label>
                      <Input
                        value={parentInfo.motherOccupation}
                        onChange={(e) => handleParentInfoChange('motherOccupation', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Contact Number *</Label>
                      <Input
                        value={parentInfo.motherContactNumber}
                        onChange={(e) => handleParentInfoChange('motherContactNumber', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address *</Label>
                      <Input
                        type="email"
                        value={parentInfo.motherEmail}
                        onChange={(e) => handleParentInfoChange('motherEmail', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Highest Educational Attainment *</Label>
                      <select
                        value={parentInfo.motherEducationalAttainment}
                        onChange={(e) => handleParentInfoChange('motherEducationalAttainment', e.target.value)}
                        className="w-full h-12 border-2 rounded-xl px-3 bg-white"
                        required
                      >
                        <option value="">Select</option>
                        <option value="ELEMENTARY_GRADUATE">Elementary Graduate</option>
                        <option value="HIGH_SCHOOL_GRADUATE">High School Graduate</option>
                        <option value="COLLEGE_GRADUATE">College Graduate</option>
                        <option value="ELEMENTARY_UNDERGRAD">Elementary Undergraduate</option>
                        <option value="HIGH_SCHOOL_UNDERGRAD">High School Undergraduate</option>
                        <option value="COLLEGE_UNDERGRAD">College Undergraduate</option>
                        <option value="OTHERS">Other</option>
                      </select>
                    </div>
                    {parentInfo.motherEducationalAttainment === 'OTHERS' && (
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Please Specify *</Label>
                        <Input
                          value={parentInfo.motherEducationalAttainmentOther}
                          onChange={(e) => handleParentInfoChange('motherEducationalAttainmentOther', e.target.value)}
                          placeholder="Specify educational attainment"
                          className="h-12 border-2 rounded-xl"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Marital Status */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Marital Status of Parents *
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['MARRIED', 'SEPARATED', 'SINGLE_PARENT', 'STEPMOTHER', 'STEPFATHER', 'OTHER'].map((status) => (
                      <label key={status} className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={parentInfo.maritalStatus.includes(status)}
                          onChange={() => handleMaritalStatusChange(status)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="font-medium">
                          {status === 'MARRIED' && 'Married'}
                          {status === 'SEPARATED' && 'Separated'}
                          {status === 'SINGLE_PARENT' && 'Single Parent'}
                          {status === 'STEPMOTHER' && 'Stepmother'}
                          {status === 'STEPFATHER' && 'Stepfather'}
                          {status === 'OTHER' && 'Other'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {parentInfo.maritalStatus.includes('OTHER') && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Please Specify *</Label>
                      <Input
                        value={parentInfo.maritalStatusOther}
                        onChange={(e) => handleParentInfoChange('maritalStatusOther', e.target.value)}
                        placeholder="Specify marital status"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Siblings Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Siblings Information
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Kindly write the name of learner&apos;s siblings and their school name/working status
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Please write in order. Example: Juan dela Cruz - College ADDU / Juana dela Cruz - Nurse
                    </p>
                    <textarea
                      value={parentInfo.siblingsInformation}
                      onChange={(e) => handleParentInfoChange('siblingsInformation', e.target.value)}
                      className="w-full min-h-32 border-2 rounded-xl p-3"
                      placeholder="Enter siblings information..."
                    />
                  </div>
                </div>

                {/* Total Learners */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Total Number of Learners in the Household *</Label>
                  <p className="text-sm text-gray-600">Including the child being enrolled</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={parentInfo.totalLearnersInHousehold}
                      onChange={(e) => handleParentInfoChange('totalLearnersInHousehold', e.target.value)}
                      className="h-12 border-2 rounded-xl flex-1"
                      min="1"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => handleParentInfoChange('totalLearnersInHousehold', '1')}
                      variant="outline"
                      className="h-12 rounded-xl px-6"
                    >
                      Only This Child
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep('personalInfo')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      // Validate required fields
                      if (!parentInfo.fatherFullName || !parentInfo.fatherContactNumber ||
                          !parentInfo.fatherEducationalAttainment || !parentInfo.motherFullName ||
                          !parentInfo.motherContactNumber || !parentInfo.motherEmail ||
                          !parentInfo.motherEducationalAttainment || !parentInfo.totalLearnersInHousehold) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      if (parentInfo.maritalStatus.length === 0) {
                        alert('Please select at least one marital status');
                        return;
                      }
                      if (parentInfo.maritalStatus.includes('OTHER') && !parentInfo.maritalStatusOther) {
                        alert('Please specify the marital status');
                        return;
                      }
                      if (parentInfo.motherEducationalAttainment === 'OTHERS' && !parentInfo.motherEducationalAttainmentOther) {
                        alert('Please specify mother&apos;s educational attainment');
                        return;
                      }
                      setStep('studentHistory');
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 5 (Old Students): Simplified Form
  if (step === 'oldStudentForm') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#A8B5E5] rounded-full opacity-15"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-[#F4B5C8] rounded-3xl opacity-15 rotate-45"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <User className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Old Student Re-Enrollment
              </h1>
              <p className="text-lg text-gray-600">
                Update your information for the new school year
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {/* Student Name */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#A8B5E5] pb-2">
                    Student Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Last Name *</Label>
                      <Input
                        value={oldStudentInfo.lastName}
                        onChange={(e) => handleOldStudentInfoChange('lastName', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">First Name *</Label>
                      <Input
                        value={oldStudentInfo.firstName}
                        onChange={(e) => handleOldStudentInfoChange('firstName', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Middle Name *</Label>
                      <Input
                        value={oldStudentInfo.middleName}
                        onChange={(e) => handleOldStudentInfoChange('middleName', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Birthday *</Label>
                      <Input
                        type="date"
                        value={oldStudentInfo.birthday}
                        onChange={(e) => handleOldStudentInfoChange('birthday', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Age *</Label>
                      <Input
                        type="number"
                        value={oldStudentInfo.age}
                        onChange={(e) => handleOldStudentInfoChange('age', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Religion *</Label>
                      <Input
                        value={oldStudentInfo.religion}
                        onChange={(e) => handleOldStudentInfoChange('religion', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label className="text-base font-semibold">Address *</Label>
                      <Input
                        value={oldStudentInfo.address}
                        onChange={(e) => handleOldStudentInfoChange('address', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Father's Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#A8B5E5] pb-2">
                    Father's Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Name *</Label>
                      <Input
                        value={oldStudentInfo.fatherName}
                        onChange={(e) => handleOldStudentInfoChange('fatherName', e.target.value)}
                        placeholder="Last Name, First Name"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Contact Number *</Label>
                      <Input
                        value={oldStudentInfo.fatherContactNumber}
                        onChange={(e) => handleOldStudentInfoChange('fatherContactNumber', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address</Label>
                      <Input
                        type="email"
                        value={oldStudentInfo.fatherEmail}
                        onChange={(e) => handleOldStudentInfoChange('fatherEmail', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#F4B5C8] pb-2">
                    Mother's Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Name *</Label>
                      <Input
                        value={oldStudentInfo.motherName}
                        onChange={(e) => handleOldStudentInfoChange('motherName', e.target.value)}
                        placeholder="Last Name, First Name"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Contact Number *</Label>
                      <Input
                        value={oldStudentInfo.motherContactNumber}
                        onChange={(e) => handleOldStudentInfoChange('motherContactNumber', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address *</Label>
                      <Input
                        type="email"
                        value={oldStudentInfo.motherEmail}
                        onChange={(e) => handleOldStudentInfoChange('motherEmail', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* New Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Updates
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Any new information to update?
                    </Label>
                    <textarea
                      value={oldStudentInfo.newInformation}
                      onChange={(e) => handleOldStudentInfoChange('newInformation', e.target.value)}
                      className="w-full min-h-32 border-2 rounded-xl p-3"
                      placeholder="Please share any updates or changes since last year..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep('studentStatus')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!oldStudentInfo.lastName || !oldStudentInfo.firstName || !oldStudentInfo.middleName ||
                          !oldStudentInfo.birthday || !oldStudentInfo.age || !oldStudentInfo.religion ||
                          !oldStudentInfo.address || !oldStudentInfo.fatherName || !oldStudentInfo.fatherContactNumber ||
                          !oldStudentInfo.motherName || !oldStudentInfo.motherContactNumber || !oldStudentInfo.motherEmail) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      setStep('agreements');
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 8: Student History (New Students Only)
  if (step === 'studentHistory') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#A8B5E5] rounded-full opacity-15"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-[#F4B5C8] rounded-3xl opacity-15 rotate-45"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <GraduationCap className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Student History
              </h1>
              <p className="text-lg text-gray-600">
                Step 4 of 5: Educational Background
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {/* Last Schools */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#A8B5E5] pb-2">
                    Last School Attended
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Preschool Name *</Label>
                      <Input
                        value={studentHistory.lastSchoolPreschoolName}
                        onChange={(e) => handleStudentHistoryChange('lastSchoolPreschoolName', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Preschool Address</Label>
                      <Input
                        value={studentHistory.lastSchoolPreschoolAddress}
                        onChange={(e) => handleStudentHistoryChange('lastSchoolPreschoolAddress', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Elementary Name *</Label>
                      <Input
                        value={studentHistory.lastSchoolElementaryName}
                        onChange={(e) => handleStudentHistoryChange('lastSchoolElementaryName', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Elementary Address</Label>
                      <Input
                        value={studentHistory.lastSchoolElementaryAddress}
                        onChange={(e) => handleStudentHistoryChange('lastSchoolElementaryAddress', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Skills */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Special Skills
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['COMPUTER', 'COMPOSITION_WRITING', 'SINGING', 'DANCING', 'POEM_WRITING', 'COOKING', 'ACTING', 'PUBLIC_SPEAKING', 'OTHER'].map((skill) => (
                      <label key={skill} className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={studentHistory.specialSkills.includes(skill)}
                          onChange={() => handleSpecialSkillsChange(skill)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="font-medium">
                          {skill === 'COMPUTER' && 'Computer'}
                          {skill === 'COMPOSITION_WRITING' && 'Composition Writing'}
                          {skill === 'SINGING' && 'Singing'}
                          {skill === 'DANCING' && 'Dancing'}
                          {skill === 'POEM_WRITING' && 'Poem Writing'}
                          {skill === 'COOKING' && 'Cooking'}
                          {skill === 'ACTING' && 'Acting'}
                          {skill === 'PUBLIC_SPEAKING' && 'Public Speaking'}
                          {skill === 'OTHER' && 'Other'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {studentHistory.specialSkills.includes('OTHER') && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Please Specify *</Label>
                      <Input
                        value={studentHistory.specialSkillsOther}
                        onChange={(e) => handleStudentHistoryChange('specialSkillsOther', e.target.value)}
                        placeholder="Specify special skill"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Special Needs */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Special Needs
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      For Student With Special Needs, What is the Diagnosis of your learner?
                    </Label>
                    <textarea
                      value={studentHistory.specialNeedsDiagnosis}
                      onChange={(e) => handleStudentHistoryChange('specialNeedsDiagnosis', e.target.value)}
                      className="w-full min-h-32 border-2 rounded-xl p-3"
                      placeholder="Leave blank if not applicable"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep('parentInfo')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!studentHistory.lastSchoolPreschoolName || !studentHistory.lastSchoolElementaryName) {
                        alert('Please fill in required school information');
                        return;
                      }
                      if (studentHistory.specialSkills.includes('OTHER') && !studentHistory.specialSkillsOther) {
                        alert('Please specify the special skill');
                        return;
                      }
                      setStep('agreements');
                    }}
                    className="flex-1 bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-2xl"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 9: Agreements (New Students Only)
  if (step === 'agreements') {
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8B5E5] rounded-3xl opacity-20 rotate-12"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-[#F4B5C8] rounded-full opacity-20"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6">
                <ClipboardCheck className="w-10 h-10 text-[#A8B5E5]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Enrollment Agreement
              </h1>
              <p className="text-lg text-gray-600">
                Step 5 of 5: Final Details
              </p>
            </div>

            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {/* Responsible Person */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-[#A8B5E5] pb-2">
                    Responsible Person for Enrollment
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">
                        Kindly write your name as the one who is responsible for the enrollment of the learner *
                      </Label>
                      <Input
                        value={agreements.responsiblePersonName}
                        onChange={(e) => handleAgreementsChange('responsiblePersonName', e.target.value)}
                        placeholder="Full Name"
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Contact Number *</Label>
                      <Input
                        value={agreements.responsiblePersonContactNumber}
                        onChange={(e) => handleAgreementsChange('responsiblePersonContactNumber', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Email Address *</Label>
                      <Input
                        type="email"
                        value={agreements.responsiblePersonEmail}
                        onChange={(e) => handleAgreementsChange('responsiblePersonEmail', e.target.value)}
                        className="h-12 border-2 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Relationship to the Student</Label>
                      <Input
                        value={agreements.relationshipToStudent}
                        onChange={(e) => handleAgreementsChange('relationshipToStudent', e.target.value)}
                        placeholder="e.g., Mother, Father, Guardian"
                        className="h-12 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Agreements */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-300 pb-2">
                    Agreements *
                  </h3>
                  <div className="space-y-4">
                    {/* Enrollment Agreement */}
                    <div className="border-2 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className="font-medium flex-1">
                          I have read the &quot;ENROLLMENT AGREEMENT&quot;
                        </span>
                        <Button
                          onClick={() => setShowEnrollmentAgreement(true)}
                          variant="outline"
                          className="rounded-xl"
                          type="button"
                        >
                          Read
                        </Button>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreements.enrollmentAgreementAcceptance}
                          onChange={(e) => handleAgreementsChange('enrollmentAgreementAcceptance', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the Enrollment Agreement
                        </span>
                      </label>
                    </div>

                    {/* Withdrawal Policy */}
                    <div className="border-2 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className="font-medium flex-1">
                          I have read the &quot;Withdrawal Policy of Enrollment of CHCD&quot;
                        </span>
                        <Button
                          onClick={() => setShowWithdrawalPolicy(true)}
                          variant="outline"
                          className="rounded-xl"
                          type="button"
                        >
                          Read
                        </Button>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreements.withdrawalPolicyAcceptance}
                          onChange={(e) => handleAgreementsChange('withdrawalPolicyAcceptance', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the Withdrawal Policy
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep(studentStatus === 'OLD_STUDENT' ? 'oldStudentForm' : 'studentHistory')}
                    variant="ghost"
                    className="flex-1 rounded-2xl"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!agreements.responsiblePersonName || !agreements.responsiblePersonContactNumber || 
                          !agreements.responsiblePersonEmail) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      if (!agreements.enrollmentAgreementAcceptance || !agreements.withdrawalPolicyAcceptance) {
                        alert('Please accept both agreements to continue');
                        return;
                      }
                      // Submit the enrollment
                      handleEnrollmentSubmit({});
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Enrollment'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Agreement Modal */}
            {showEnrollmentAgreement && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Enrollment Agreement</h2>
                    <button
                      onClick={() => setShowEnrollmentAgreement(false)}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <img 
                      src="/enrollment-agreement.png" 
                      alt="Enrollment Agreement" 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="p-6 border-t flex justify-end gap-3">
                    <Button
                      onClick={() => setShowEnrollmentAgreement(false)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handleAgreementsChange('enrollmentAgreementAcceptance', true);
                        setShowEnrollmentAgreement(false);
                      }}
                      className="bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-xl"
                    >
                      I Agree
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal Policy Modal */}
            {showWithdrawalPolicy && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Withdrawal Policy</h2>
                    <button
                      onClick={() => setShowWithdrawalPolicy(false)}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <img 
                      src="/withdrawal-policy.png" 
                      alt="Withdrawal Policy" 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="p-6 border-t flex justify-end gap-3">
                    <Button
                      onClick={() => setShowWithdrawalPolicy(false)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handleAgreementsChange('withdrawalPolicyAcceptance', true);
                        setShowWithdrawalPolicy(false);
                      }}
                      className="bg-[#A8B5E5] hover:bg-[#8FA0D9] text-white rounded-xl"
                    >
                      I Agree
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 10: Enrollment Form (Old Students - placeholder for now)
  return (
    <>
      <div className="min-h-screen bg-[#F5F3F0]">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#A8B5E5] rounded-full opacity-15"></div>
        <div className="absolute top-1/3 left-10 w-24 h-24 bg-[#F4B5C8] rounded-3xl opacity-15 rotate-45"></div>
        <div className="absolute bottom-32 right-1/4 w-28 h-28 bg-[#A8B5E5] rounded-3xl opacity-15 -rotate-12"></div>
        
        <div className="container mx-auto py-12 px-4 relative z-10">
          {/* Header Section */}
          <div className="max-w-5xl mx-auto mb-8">
            <Button
              onClick={() => setStep('agreements')}
              variant="ghost"
              className="mb-8 hover:bg-white/80 rounded-2xl"
            >
              ← Back
            </Button>
            
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#A8B5E5] to-[#F4B5C8] rounded-3xl shadow-lg mb-6">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Student Enrollment Form
                  </h1>
                  <div className="inline-block bg-white px-6 py-3 rounded-2xl border-2 border-gray-200 mb-4">
                    <p className="text-gray-700 font-medium flex items-center gap-2 justify-center">
                      <Mail className="w-5 h-5 text-[#A8B5E5]" />
                      Enrolling with: <span className="text-[#A8B5E5] font-semibold">{email}</span>
                    </p>
                  </div>
                  <p className="text-gray-600 text-base">
                    Fill out the form below to complete your enrollment
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Fields marked with <span className="text-red-500 font-semibold">*</span> are required
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <EnrollmentForm onSubmit={handleEnrollmentSubmit} />
          </div>

          {/* Footer */}
          <div className="max-w-5xl mx-auto mt-8 text-center">
            <div className="bg-white/80 rounded-2xl p-6 border border-gray-200">
              <p className="text-gray-600">
                Need help? Contact us and we&apos;ll be happy to assist you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal - shown after successful enrollment submission */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Success!</h2>
              <p className="text-gray-600 text-lg mb-6">
                Your enrollment has been submitted successfully. You will receive updates via email.
              </p>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
