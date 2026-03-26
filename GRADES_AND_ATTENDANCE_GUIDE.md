# 📊 Grades and Attendance Management Guide

## Overview
Complete system for managing student grades and attendance with filtering, bulk operations, and real-time updates.

## 🎓 Grades Management

### Features
- ✅ Add/Edit/Delete grades
- ✅ Filter by student, school year, quarter
- ✅ Subject-based grading
- ✅ Teacher assignment
- ✅ Remarks/comments
- ✅ Color-coded grades (90+ green, 80+ blue, 75+ yellow, <75 red)
- ✅ Automatic duplicate prevention

### Accessing Grades
1. Login as admin or principal
2. Click "Grades" in the sidebar
3. You'll see the grades management interface

### Adding a Grade
1. Click "Add Grade" button
2. Fill in the form:
   - **Student**: Select from dropdown (active students only)
   - **Subject**: e.g., Mathematics, English, Science
   - **Quarter**: First, Second, Third, or Fourth Quarter
   - **Grade**: 0-100 (supports decimals)
   - **Teacher**: Optional teacher name
   - **School Year**: e.g., 2024
   - **Remarks**: Optional comments
3. Click "Add Grade"

### Editing a Grade
1. Find the grade in the table
2. Click "Edit" button
3. Modify the grade, remarks, or teacher
4. Click "Update Grade"

Note: Student, subject, quarter, and school year cannot be changed when editing (these identify the unique grade record).

### Deleting a Grade
1. Find the grade in the table
2. Click "Delete" button
3. Confirm deletion

### Filtering Grades
Use the filter panel to narrow down results:
- **Student**: View grades for a specific student
- **School Year**: Filter by academic year
- **Quarter**: Filter by grading period
- Click "Apply Filters" to refresh

### Grade Scale
- **90-100**: Excellent (Green, Bold)
- **80-89**: Good (Blue, Semibold)
- **75-79**: Satisfactory (Yellow)
- **Below 75**: Needs Improvement (Red, Semibold)

### Unique Constraint
The system prevents duplicate grades for the same:
- Student + Subject + Quarter + School Year

If you try to add a duplicate, it will update the existing grade instead.

## 📅 Attendance Management

### Features
- ✅ Daily attendance tracking
- ✅ Bulk marking mode
- ✅ Filter by date and class
- ✅ Real-time statistics
- ✅ Multiple status types
- ✅ Time-in recording
- ✅ Color-coded status badges

### Accessing Attendance
1. Login as admin or principal
2. Click "Attendance" in the sidebar
3. You'll see the attendance management interface

### Marking Individual Attendance
1. Select a date using the date picker
2. Optionally filter by class
3. For each student, click:
   - **Present**: Student is present (records time-in)
   - **Absent**: Student is absent
   - **Late**: Student arrived late (records time-in)

### Bulk Marking Mode
For quickly marking attendance for multiple students:

1. Click "Bulk Mark" button
2. Use the dropdown for each student to select status:
   - Present
   - Absent
   - Late
   - Excused
3. Click "Save All" to save all attendance records at once
4. Click "Cancel Bulk" to exit bulk mode

### Filtering Attendance
- **Date**: Select the date to view/mark attendance
- **Class**: Filter students by class
- Click "Refresh" to reload data

### Attendance Statistics
The dashboard shows real-time stats:
- **Total Students**: Number of students (filtered by class if selected)
- **Present**: Count of present students (green)
- **Absent**: Count of absent students (red)
- **Late**: Count of late students (yellow)

### Status Types
- **PRESENT** (Green): Student is present
- **ABSENT** (Red): Student is absent
- **LATE** (Yellow): Student arrived late
- **EXCUSED** (Blue): Excused absence

### Time Recording
- When marking Present or Late, the system automatically records the current time
- Time-in is displayed in the table

### Unique Constraint
The system prevents duplicate attendance records for the same:
- Student + Date

If you mark attendance twice for the same student on the same day, it will update the existing record.

## 🔧 API Endpoints

### Grades API
```
GET  /api/grades                    - List grades (with filters)
POST /api/grades                    - Create new grade
PATCH /api/grades/[id]              - Update grade
DELETE /api/grades/[id]             - Delete grade
```

### Attendance API
```
GET  /api/attendance                - List attendance (with filters)
POST /api/attendance                - Mark attendance
PATCH /api/attendance/[id]          - Update attendance
DELETE /api/attendance/[id]         - Delete attendance
```

## 📊 Database Schema

### Grade Model
```prisma
model Grade {
  id          String   @id
  studentId   String
  subject     String
  quarter     String
  grade       Float
  remarks     String?
  teacher     String?
  schoolYear  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  Student     Student  @relation(...)
  
  @@unique([studentId, subject, quarter, schoolYear])
}
```

### Attendance Model
```prisma
model Attendance {
  id          String           @id
  studentId   String
  date        DateTime
  status      AttendanceStatus
  timeIn      String?
  timeOut     String?
  remarks     String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  Student     Student          @relation(...)
  
  @@unique([studentId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}
```

## 💡 Usage Tips

### For Grades
1. **Consistent Naming**: Use consistent subject names (e.g., always "Mathematics" not "Math")
2. **Quarter System**: Stick to the standard quarter names for consistency
3. **Decimal Grades**: You can use decimals (e.g., 85.5) for precise grading
4. **Bulk Import**: For large datasets, consider using the API directly
5. **Teacher Names**: Keep teacher names consistent for better reporting

### For Attendance
1. **Daily Routine**: Mark attendance at the same time each day
2. **Bulk Mode**: Use bulk mode for faster marking of entire classes
3. **Late Threshold**: Establish a clear policy for what constitutes "late"
4. **Excused Absences**: Use "Excused" status for documented absences
5. **Regular Review**: Check attendance statistics regularly to identify patterns

## 🎯 Common Workflows

### Workflow 1: End of Quarter Grading
1. Filter by quarter and school year
2. Add grades for each student in each subject
3. Review all grades before finalizing
4. Export or print grade reports (future feature)

### Workflow 2: Daily Attendance
1. Select today's date
2. Filter by class (if teaching multiple classes)
3. Use bulk mode to quickly mark all students
4. Review statistics to ensure all students are marked
5. Save all attendance records

### Workflow 3: Student Progress Review
1. Filter grades by specific student
2. View all subjects across all quarters
3. Identify trends and areas needing improvement
4. Add remarks for parent communication

### Workflow 4: Attendance Report
1. Select date range (future feature)
2. Filter by class or student
3. Review attendance patterns
4. Identify students with excessive absences
5. Generate reports for parents/administration

## 🔐 Permissions

### Admin/Principal
- ✅ View all grades
- ✅ Add/Edit/Delete grades
- ✅ View all attendance
- ✅ Mark/Edit/Delete attendance
- ✅ Access all classes and students

### Teacher (Future)
- ✅ View grades for their classes
- ✅ Add/Edit grades for their subjects
- ✅ Mark attendance for their classes
- ❌ Cannot delete grades/attendance

### Parent (Future)
- ✅ View their child's grades
- ✅ View their child's attendance
- ❌ Cannot modify any data

## 📈 Future Enhancements

### Grades
- [ ] Grade reports and transcripts
- [ ] GPA calculation
- [ ] Grade distribution charts
- [ ] Export to PDF/Excel
- [ ] Grade history and trends
- [ ] Weighted grades
- [ ] Grade curves
- [ ] Parent notifications

### Attendance
- [ ] Attendance reports
- [ ] Absence notifications to parents
- [ ] Attendance percentage calculation
- [ ] Tardiness tracking
- [ ] Attendance trends and analytics
- [ ] Export to PDF/Excel
- [ ] Automated absence follow-up
- [ ] Integration with parent portal

## 🐛 Troubleshooting

### Grades not showing?
- Check that students are marked as ACTIVE
- Verify the filters are set correctly
- Ensure grades exist for the selected criteria
- Try clearing filters and refreshing

### Cannot add grade?
- Verify student is selected
- Check that all required fields are filled
- Ensure grade is between 0-100
- Check for duplicate grade (same student, subject, quarter, year)

### Attendance not saving?
- Verify date is selected
- Check that student exists and is active
- Ensure status is selected
- Try refreshing the page

### Bulk mode not working?
- Make sure you've selected status for each student
- Click "Save All" button to save
- Check browser console for errors
- Try marking individually if bulk fails

## 📚 Related Documentation
- `FINAL_SETUP_GUIDE.md` - Complete system setup
- `HOW_TO_MESSAGE.md` - Messaging system guide
- `docs/SAMPLE_DATA_GUIDE.md` - Test accounts and data

---

Need help? The grades and attendance systems are now fully functional and ready to use!
