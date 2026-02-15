'use client';

import { EnrollmentForm } from '@/components/enrollment-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ParentEnrollPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (data: any) => {
    try {
      console.log('Submitting enrollment data:', data);
      
      // Step 1: Upload profile picture first if provided
      let profilePictureUrl = '';
      
      if (data.profilePicture) {
        console.log('Uploading profile picture...');
        
        // Create a temporary enrollment ID for file upload
        const tempEnrollmentId = `temp_${Date.now()}`;
        
        const formData = new FormData();
        formData.append('file', data.profilePicture);
        formData.append('isProfilePicture', 'true');
        
        const uploadResponse = await fetch(`/api/enrollments/${tempEnrollmentId}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.error('Profile picture upload error:', uploadError);
          alert(`Failed to upload profile picture: ${uploadError.error || 'Unknown error'}`);
          return;
        }
        
        const uploadResult = await uploadResponse.json();
        profilePictureUrl = uploadResult.url || uploadResult.fileUrl;
        console.log('Profile picture uploaded:', profilePictureUrl);
      }
      
      // Step 2: Prepare enrollment data
      const enrollmentData = {
        schoolYear: data.schoolYear,
        program: data.program,
        studentStatus: data.studentStatus,
        profilePictureUrl: profilePictureUrl || '/uploads/default-profile.jpg', // Fallback
        personalInfo: {
          ...data.personalInfo,
          age: parseInt(data.personalInfo.age),
        },
        parentInfo: data.parentInfo,
        studentHistory: {
          ...data.studentHistory,
          totalLearnersInHousehold: parseInt(data.studentHistory.totalLearnersInHousehold) || 1,
        },
        studentSkills: data.studentSkills,
        enrollmentAgreement: data.enrollmentAgreement,
      };
      
      console.log('Submitting enrollment:', enrollmentData);
      
      // Step 3: Submit enrollment
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        
        // Show detailed error message
        if (error.errors && Array.isArray(error.errors)) {
          const errorMessages = error.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(error.error || error.message || 'Failed to submit enrollment');
        }
        
        throw new Error(error.message || 'Failed to submit enrollment');
      }

      const result = await response.json();
      console.log('Success:', result);
      
      // Show success message
      alert('Enrollment submitted successfully!');
      
      // Redirect to submissions page on success
      router.push('/parent/submissions');
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Student Enrollment Form</h1>
      <p className="text-muted-foreground mb-6">
        Please fill out all required fields marked with an asterisk (*).
      </p>
      <EnrollmentForm onSubmit={handleSubmit} />
    </div>
  );
}
