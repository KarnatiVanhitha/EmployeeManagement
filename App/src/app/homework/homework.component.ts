import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../services/teacher.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-homework',
  templateUrl: './homework.component.html',
  styleUrls: ['./homework.component.css']
})
export class HomeworkComponent implements OnInit {
  selectedClass = '';
  selectedSection = '';
  classes = ['9', '10', '11', '12'];
  sections = ['A', 'B', 'C'];
  isTableVisible = false;
  homeworkRows: any[] = [];
  teachers: any[] = [];
  noHomeworkMessage = '';
  classError = '';
  sectionError = '';

  homeworkData: Record<string, any[]> = {
    '9-A': [
      { subject: 'Mathematics', description: 'Complete exercise 5 from chapter 4', dueDate: '2026-06-10' },
      { subject: 'English', description: 'Write a short story on environmental conservation', dueDate: '2026-06-11' }
    ],
    '10-A': [
      { subject: 'Physics', description: 'Solve problems 1–10 from chapter 6', dueDate: '2026-06-12' },
      { subject: 'Computer Science', description: 'Prepare a flowchart for the ATM program', dueDate: '2026-06-13' }
    ],
    '10-B': [
      { subject: 'Biology', description: 'Draw the diagram of a flowering plant', dueDate: '2026-06-12' },
      { subject: 'Mathematics', description: 'Practice algebra worksheets 2 and 3', dueDate: '2026-06-14' }
    ],
    '11-A': [
      { subject: 'Chemistry', description: 'Complete the organic chemistry assignment', dueDate: '2026-06-15' },
      { subject: 'History', description: 'Read and summarize chapter 8', dueDate: '2026-06-16' }
    ]
  };

  constructor(private teacherService: TeacherService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.teachers = this.teacherService.getTeachers() || [];
  }

  showHomework(): void {
    this.classError = '';
    this.sectionError = '';
    let hasError = false;

    if (!this.selectedClass) {
      this.classError = 'Please select Class';
      hasError = true;
    }
    if (!this.selectedSection) {
      this.sectionError = 'Please select Section';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please select Class and Section');
      return;
    }

    const key = `${this.selectedClass}-${this.selectedSection}`;
    const rows = this.homeworkData[key] || [];

    this.homeworkRows = rows.map(item => ({
      ...item,
      teacher: this.findTeacherForSubject(item.subject) || 'TBD'
    }));

    this.noHomeworkMessage = this.homeworkRows.length
      ? ''
      : 'No homework found for the selected class and section.';
    this.isTableVisible = true;
  }

  private findTeacherForSubject(subject: string): string | null {
    const teacher = this.teachers.find((t: any) => {
      const teacherSubject = (t.subject || '').toString().trim().toLowerCase();
      const classMatch = !t.class || t.class.toString().trim().toLowerCase() === this.selectedClass.toLowerCase();
      return teacherSubject === subject.toLowerCase() && classMatch;
    });

    if (!teacher) {
      return null;
    }

    return (
      teacher.fullName ||
      `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() ||
      teacher.email ||
      'TBD'
    );
  }
}
