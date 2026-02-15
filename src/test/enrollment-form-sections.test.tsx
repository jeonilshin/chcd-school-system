import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock all UI components to avoid dependency issues
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children, onValueChange, value, ...props }: any) => (
    <div role="radiogroup" {...props}>
      {typeof children === 'function' ? children({ value, onValueChange }) : children}
    </div>
  ),
  RadioGroupItem: ({ value, id, ...props }: any) => (
    <input type="radio" value={value} id={id} {...props} />
  ),
}))

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
      {...props}
    />
  ),
}))

import { ParentInformationSection } from '@/components/parent-information-section'
import { StudentHistorySection } from '@/components/student-history-section'
import { StudentSkillsSection } from '@/components/student-skills-section'
import { EnrollmentAgreementSection } from '@/components/enrollment-agreement-section'

/**
 * Tests for subtask 11.10: Write unit tests for new form sections
 * 
 * These tests verify:
 * 1. Parent Information Section - displays and validates parent data
 * 2. Student History Section - validates household learners as positive integers
 * 3. Student Skills Section - displays special skills checkboxes
 * 4. Enrollment Agreement Section - validates required acceptances
 */
describe('Form Sections - Subtask 11.10', () => {
  describe('ParentInformationSection', () => {
    const defaultParentInfo = {
      fatherFullName: '',
      fatherOccupation: '',
      fatherContactNumber: '',
      fatherEmail: '',
      fatherEducationalAttainment: '' as const,
      motherFullName: '',
      motherOccupation: '',
      motherContactNumber: '',
      motherEmail: '',
      motherEducationalAttainment: '' as const,
      maritalStatus: [] as any[],
    }

    it('should render all parent information fields', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <ParentInformationSection
          parentInfo={defaultParentInfo}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify section headers are displayed
      expect(screen.getByText(/father.*information/i)).toBeInTheDocument()
      expect(screen.getByText(/mother.*information/i)).toBeInTheDocument()
      expect(screen.getByText(/marital status/i)).toBeInTheDocument()
      
      // Verify father fields
      expect(screen.getAllByLabelText(/full name/i)[0]).toBeInTheDocument()
      expect(screen.getAllByLabelText(/occupation/i)[0]).toBeInTheDocument()
      
      // Verify marital status options
      expect(screen.getByLabelText(/married/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/separated/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/single parent/i)).toBeInTheDocument()
    })

    it('should display phone number validation errors', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'parentInfo.fatherContactNumber': 'Invalid phone number format',
        'parentInfo.motherContactNumber': 'Invalid phone number format',
      }
      
      render(
        <ParentInformationSection
          parentInfo={{
            ...defaultParentInfo,
            fatherContactNumber: 'invalid-phone',
            motherContactNumber: '123',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error messages are displayed
      const errorMessages = screen.getAllByText(/invalid phone number format/i)
      expect(errorMessages).toHaveLength(2)
    })

    it('should display email validation errors', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'parentInfo.fatherEmail': 'Invalid email format',
        'parentInfo.motherEmail': 'Invalid email format',
      }
      
      render(
        <ParentInformationSection
          parentInfo={{
            ...defaultParentInfo,
            fatherEmail: 'invalid-email',
            motherEmail: 'bad@email',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error messages are displayed
      const errorMessages = screen.getAllByText(/invalid email format/i)
      expect(errorMessages).toHaveLength(2)
    })

    it('should call onUpdate when input values change', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <ParentInformationSection
          parentInfo={defaultParentInfo}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Change father's full name
      const fatherFullNameInput = screen.getAllByLabelText(/full name/i)[0]
      fireEvent.change(fatherFullNameInput, { target: { value: 'John Doe' } })
      
      // Verify onUpdate was called
      expect(mockOnUpdate).toHaveBeenCalledWith('fatherFullName', 'John Doe')
    })

    it('should handle marital status checkbox changes', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <ParentInformationSection
          parentInfo={defaultParentInfo}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Click married checkbox
      const marriedCheckbox = screen.getByLabelText(/married/i)
      fireEvent.click(marriedCheckbox)
      
      // Verify onUpdate was called with maritalStatus array
      expect(mockOnUpdate).toHaveBeenCalled()
      const call = mockOnUpdate.mock.calls[0]
      expect(call[0]).toBe('maritalStatus')
      expect(Array.isArray(call[1])).toBe(true)
    })
  })

  describe('StudentHistorySection', () => {
    const defaultStudentHistory = {
      siblingsInformation: '',
      totalLearnersInHousehold: '',
      lastSchoolPreschoolName: '',
      lastSchoolPreschoolAddress: '',
      lastSchoolElementaryName: '',
      lastSchoolElementaryAddress: '',
    }

    it('should render all student history fields', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentHistorySection
          studentHistory={defaultStudentHistory}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify all fields are displayed
      expect(screen.getByLabelText(/siblings.*information/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/total.*learners in household/i)).toBeInTheDocument()
      expect(screen.getAllByLabelText(/school name/i)[0]).toBeInTheDocument()
    })

    it('should display validation error for negative household learners', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'studentHistory.totalLearnersInHousehold': 'Must be a positive number',
      }
      
      render(
        <StudentHistorySection
          studentHistory={{
            ...defaultStudentHistory,
            totalLearnersInHousehold: '-1',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument()
    })

    it('should display validation error for zero household learners', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'studentHistory.totalLearnersInHousehold': 'Must be a positive number',
      }
      
      render(
        <StudentHistorySection
          studentHistory={{
            ...defaultStudentHistory,
            totalLearnersInHousehold: '0',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument()
    })

    it('should not display validation error for positive household learners', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentHistorySection
          studentHistory={{
            ...defaultStudentHistory,
            totalLearnersInHousehold: '3',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify no error message is displayed
      expect(screen.queryByText(/must be a positive number/i)).not.toBeInTheDocument()
    })

    it('should call onUpdate when input values change', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentHistorySection
          studentHistory={defaultStudentHistory}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Change siblings input
      const siblingsInput = screen.getByLabelText(/siblings.*information/i)
      fireEvent.change(siblingsInput, { target: { value: 'Two siblings' } })
      
      // Verify onUpdate was called
      expect(mockOnUpdate).toHaveBeenCalledWith('siblingsInformation', 'Two siblings')
    })
  })

  describe('StudentSkillsSection', () => {
    const defaultStudentSkills = {
      specialSkills: [] as any[],
      specialNeedsDiagnosis: '',
    }

    it('should render all special skills checkboxes', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentSkillsSection
          studentSkills={defaultStudentSkills}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify all skill checkboxes are displayed
      expect(screen.getByLabelText(/^computer$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/singing/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dancing/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/composition writing/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cooking/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/acting/i)).toBeInTheDocument()
    })

    it('should render special needs diagnosis field', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentSkillsSection
          studentSkills={defaultStudentSkills}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify special needs field is displayed
      expect(screen.getByLabelText(/special needs diagnosis/i)).toBeInTheDocument()
    })

    it('should handle skill checkbox changes', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentSkillsSection
          studentSkills={defaultStudentSkills}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Click computer checkbox
      const computerCheckbox = screen.getByLabelText(/^computer$/i)
      fireEvent.click(computerCheckbox)
      
      // Verify onUpdate was called with specialSkills array
      expect(mockOnUpdate).toHaveBeenCalled()
      const call = mockOnUpdate.mock.calls[0]
      expect(call[0]).toBe('specialSkills')
      expect(Array.isArray(call[1])).toBe(true)
    })

    it('should allow multiple skills to be selected', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <StudentSkillsSection
          studentSkills={{
            specialSkills: ['COMPUTER', 'SINGING'],
            specialNeedsDiagnosis: '',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify checkboxes can be checked
      const computerCheckbox = screen.getByLabelText(/^computer$/i) as HTMLInputElement
      const singingCheckbox = screen.getByLabelText(/singing/i) as HTMLInputElement
      
      expect(computerCheckbox.checked).toBe(true)
      expect(singingCheckbox.checked).toBe(true)
    })
  })

  describe('EnrollmentAgreementSection', () => {
    const defaultEnrollmentAgreement = {
      responsiblePersonName: '',
      responsiblePersonContactNumber: '',
      responsiblePersonEmail: '',
      relationshipToStudent: '',
      enrollmentAgreementAcceptance: '' as const,
      withdrawalPolicyAcceptance: '' as const,
    }

    it('should render all responsible person fields', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={defaultEnrollmentAgreement}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify responsible person fields
      expect(screen.getByLabelText(/^full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/relationship to student/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('should render enrollment agreement acceptance options', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={defaultEnrollmentAgreement}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify agreement section is displayed
      expect(screen.getAllByText(/enrollment agreement/i).length).toBeGreaterThan(0)
      expect(screen.getByLabelText(/yes.*commit/i)).toBeInTheDocument()
    })

    it('should render withdrawal policy acceptance options', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={defaultEnrollmentAgreement}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify withdrawal policy section is displayed
      expect(screen.getAllByText(/withdrawal policy/i).length).toBeGreaterThan(0)
      // Verify radio buttons exist with exact names
      expect(screen.getByRole('radio', { name: 'Yes, I have read and agreed with the WITHDRAWAL POLICY OF CHCD' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'No, I do not agree with the Policy' })).toBeInTheDocument()
    })

    it('should display validation error when enrollment agreement not accepted', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'enrollmentAgreement.enrollmentAgreementAcceptance': 'You must accept the enrollment agreement',
      }
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={{
            ...defaultEnrollmentAgreement,
            enrollmentAgreementAcceptance: '',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/you must accept the enrollment agreement/i)).toBeInTheDocument()
    })

    it('should display validation error when withdrawal policy not accepted', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'enrollmentAgreement.withdrawalPolicyAcceptance': 'You must accept the withdrawal policy',
      }
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={{
            ...defaultEnrollmentAgreement,
            withdrawalPolicyAcceptance: '',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/you must accept the withdrawal policy/i)).toBeInTheDocument()
    })

    it('should call onUpdate when input values change', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {}
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={defaultEnrollmentAgreement}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Change responsible person name
      const nameInput = screen.getByLabelText(/^full name/i)
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })
      
      // Verify onUpdate was called
      expect(mockOnUpdate).toHaveBeenCalledWith('responsiblePersonName', 'Jane Doe')
    })

    it('should display phone validation error', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'enrollmentAgreement.responsiblePersonContactNumber': 'Invalid phone number format',
      }
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={{
            ...defaultEnrollmentAgreement,
            responsiblePersonContactNumber: 'invalid',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument()
    })

    it('should display email validation error', () => {
      const mockOnUpdate = vi.fn()
      const mockErrors = {
        'enrollmentAgreement.responsiblePersonEmail': 'Invalid email format',
      }
      
      render(
        <EnrollmentAgreementSection
          enrollmentAgreement={{
            ...defaultEnrollmentAgreement,
            responsiblePersonEmail: 'invalid',
          }}
          onUpdate={mockOnUpdate}
          errors={mockErrors}
        />
      )
      
      // Verify error message is displayed
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })
})
