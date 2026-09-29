import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';


@Component({

  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent {
  constructor(private toastService: ToastService) {}
  role = 'admin';

  selectedClass = '';
  selectedSection = '';

  isTableVisible = false;
  isEditMode = false;

  selectedRow: any = null;

  periodForm = {
    time: '',
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    teacher: ''
  };

  timetableData: any[] = [
    {
      class: '9',
      section: 'A',
      time: '09:00 AM - 10:00 AM',
      Monday: 'Maths',
      Tuesday: 'Science',
      Wednesday: 'English',
      Thursday: 'Social',
      Friday: 'Hindi',
      teacher: 'Ravi Kumar'
    },
    {
      class: '9',
      section: 'A',
      time: '10:00 AM - 11:00 AM',
      Monday: 'Science',
      Tuesday: 'Maths',
      Wednesday: 'Hindi',
      Thursday: 'English',
      Friday: 'Social',
      teacher: 'Priya Sharma'
    },
    {
      class: '10',
      section: 'B',
      time: '09:00 AM - 10:00 AM',
      Monday: 'Physics',
      Tuesday: 'Chemistry',
      Wednesday: 'Biology',
      Thursday: 'Maths',
      Friday: 'English',
      teacher: 'Suresh'
    }
  ];

  filteredTimetable: any[] = [];
  classError = '';
  sectionError = '';
  timeError = '';
  teacherError = '';

  clearFilterErrors(): void {
    this.classError = '';
    this.sectionError = '';
  }

  clearPeriodErrors(): void {
    this.timeError = '';
    this.teacherError = '';
  }

  showTimetable(): void {
    this.clearFilterErrors();
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

    this.isTableVisible = true;

    this.filteredTimetable = this.timetableData.filter(
      item =>
        item.class === this.selectedClass &&
        item.section === this.selectedSection
    );
  }

  openAddModal(): void {

    this.isEditMode = false;

    this.periodForm = {
      time: '',
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      teacher: ''
    };
  }

  openEditModal(row: any): void {

    this.isEditMode = true;

    this.selectedRow = row;

    this.periodForm = {
      time: row.time,
      Monday: row.Monday,
      Tuesday: row.Tuesday,
      Wednesday: row.Wednesday,
      Thursday: row.Thursday,
      Friday: row.Friday,
      teacher: row.teacher
    };
  }

  savePeriod(): void {
    this.clearPeriodErrors();
    let hasError = false;

    if (!this.periodForm.time?.trim()) {
      this.timeError = 'Time is required';
      hasError = true;
    }
    if (!this.periodForm.teacher?.trim()) {
      this.teacherError = 'Teacher is required';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fill all required fields');
      return;
    }

    if (this.isEditMode) {

      Object.assign(
        this.selectedRow,
        this.periodForm
      );

    } else {

      this.timetableData.push({
        class: this.selectedClass,
        section: this.selectedSection,
        ...this.periodForm
      });

    }

    this.showTimetable();
  }

  deleteRow(row: any): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this period?'
    );

    if (!confirmDelete) {
      return;
    }

    this.timetableData = this.timetableData.filter(
      item => item !== row
    );

    this.showTimetable();
  }

}
