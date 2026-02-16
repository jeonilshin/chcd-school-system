/**
 * Format program string for display
 * Converts: "GRADE_1_6_GRADE_2" -> "GRADE 2"
 * Converts: "PRESCHOOL_AM_KINDER" -> "KINDER (AM)"
 * Converts: "PRESCHOOL_PM_NURSERY_JUNE" -> "NURSERY (PM) - JUNE"
 */
export function formatProgram(program: string): string {
  if (!program) return '';

  // Split the program string
  const parts = program.split('_');
  
  // Extract the main program type
  const mainProgram = parts[0]; // GRADE_1_6 or PRESCHOOL
  
  // Initialize result parts
  let displayParts: string[] = [];
  
  if (mainProgram === 'GRADE') {
    // For GRADE_1_6_GRADE_2 format
    // Find the grade level (the part after the second GRADE)
    const gradeIndex = parts.findIndex((part, index) => part === 'GRADE' && index > 0);
    if (gradeIndex !== -1 && parts[gradeIndex + 1]) {
      displayParts.push(`GRADE ${parts[gradeIndex + 1]}`);
    } else {
      displayParts.push('GRADE 1-6');
    }
  } else if (mainProgram === 'PRESCHOOL') {
    // For PRESCHOOL_AM_KINDER or PRESCHOOL_PM_NURSERY_JUNE format
    let session = '';
    let level = '';
    let month = '';
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part === 'AM' || part === 'PM') {
        session = part;
      } else if (part === 'KINDER' || part === 'NURSERY' || part === 'TODDLER' || part === 'PREKINDER') {
        level = part;
      } else if (['JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER'].includes(part)) {
        month = part;
      }
    }
    
    if (level) {
      displayParts.push(level);
    } else {
      displayParts.push('PRESCHOOL');
    }
    
    if (session) {
      displayParts[0] = `${displayParts[0]} (${session})`;
    }
    
    if (month) {
      displayParts.push(month);
    }
  } else {
    // Fallback: just clean up underscores
    return program.replace(/_/g, ' ');
  }
  
  return displayParts.join(' - ');
}

/**
 * Get short program name for compact displays
 */
export function formatProgramShort(program: string): string {
  if (!program) return '';
  
  const parts = program.split('_');
  const mainProgram = parts[0];
  
  if (mainProgram === 'GRADE') {
    const gradeIndex = parts.findIndex((part, index) => part === 'GRADE' && index > 0);
    if (gradeIndex !== -1 && parts[gradeIndex + 1]) {
      return `G${parts[gradeIndex + 1]}`;
    }
    return 'G1-6';
  } else if (mainProgram === 'PRESCHOOL') {
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part === 'KINDER') return 'K';
      if (part === 'NURSERY') return 'N';
      if (part === 'TODDLER') return 'T';
      if (part === 'PREKINDER') return 'PK';
    }
    return 'PS';
  }
  
  return program.substring(0, 3);
}
