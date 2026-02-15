import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnrollmentForm } from '@/components/enrollment-form';

describe('EnrollmentForm Component', () => {
  it('should display all required fields', () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Basic enrollment info
    expect(screen.getByLabelText(/school year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/program/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student status/i)).toBeInTheDocument();

    // Personal information
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/middle name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^sex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birthday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/religion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/present address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/citizenship/i)).toBeInTheDocument();
  });

  it('should display validation errors when submitting with missing required fields', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit enrollment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/school year is required/i)).toBeInTheDocument();
      expect(screen.getByText(/program is required/i)).toBeInTheDocument();
      expect(screen.getByText(/student status is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should update document requirements when student status changes', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Initially, no document requirements should be shown
    expect(screen.queryByText(/required documents/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a student status first/i)).toBeInTheDocument();

    // Select OLD_STUDENT status - use the trigger button
    const studentStatusTrigger = screen.getByRole('combobox', { name: /student status/i });
    fireEvent.click(studentStatusTrigger);
    
    await waitFor(() => {
      const oldStudentOption = screen.getByRole('option', { name: /old student/i });
      fireEvent.click(oldStudentOption);
    });

    // Should show old student document requirements
    await waitFor(() => {
      expect(screen.getByText(/upload all required documents for old students/i)).toBeInTheDocument();
    });
  });

  it('should show citizenship specification field when FOREIGNER is selected', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Initially, citizenship specification should not be visible
    expect(screen.queryByLabelText(/country/i)).not.toBeInTheDocument();

    // Select FOREIGNER citizenship - use the trigger button
    const citizenshipTrigger = screen.getByRole('combobox', { name: /citizenship/i });
    fireEvent.click(citizenshipTrigger);
    
    await waitFor(() => {
      const foreignerOption = screen.getByRole('option', { name: /foreigner/i });
      fireEvent.click(foreignerOption);
    });

    // Should show citizenship specification field
    await waitFor(() => {
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Fill in invalid email for mother
    const motherEmailInput = screen.getByLabelText(/mother.*email/i);
    fireEvent.change(motherEmailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(motherEmailInput);

    const submitButton = screen.getByRole('button', { name: /submit enrollment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/invalid email format/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate positive integer for total learners in household', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Fill in invalid value (zero)
    const totalLearnersInput = screen.getByLabelText(/total number of learners in household/i);
    fireEvent.change(totalLearnersInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /submit enrollment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be a positive integer/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should prevent submission when enrollment agreement is not accepted', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Find and click the "OTHER" radio button for enrollment agreement
    const otherRadios = screen.getAllByRole('radio');
    const agreementOtherRadio = otherRadios.find(radio => 
      radio.getAttribute('value') === 'OTHER' && 
      radio.closest('[role="radiogroup"]')?.querySelector('label')?.textContent?.includes('Other')
    );
    
    if (agreementOtherRadio) {
      fireEvent.click(agreementOtherRadio);
    }

    const submitButton = screen.getByRole('button', { name: /submit enrollment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you must commit to the enrollment agreement/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should prevent submission when withdrawal policy is not accepted', async () => {
    const mockOnSubmit = vi.fn();
    render(<EnrollmentForm onSubmit={mockOnSubmit} />);

    // Find and click the "NO_DISAGREE" radio button for withdrawal policy
    const allRadios = screen.getAllByRole('radio');
    const withdrawalNoRadio = allRadios.find(radio => 
      radio.getAttribute('value') === 'NO_DISAGREE'
    );
    
    if (withdrawalNoRadio) {
      fireEvent.click(withdrawalNoRadio);
    }

    const submitButton = screen.getByRole('button', { name: /submit enrollment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you must agree to the withdrawal policy/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
