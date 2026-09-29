import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent {
  constructor(private toastService: ToastService) {}
  selectedClass = '';
  selectedSection = '';
  classes = ['9', '10', '11', '12'];
  sections = ['A', 'B', 'C'];

  students = [
    { name: 'Aarav Patel', roll: 'S101', grade: '9', section: 'A', route: 'Route 1', pickup: '07:30 AM', drop: '03:30 PM' },
    { name: 'Neha Verma', roll: 'S102', grade: '9', section: 'A', route: 'Route 2', pickup: '07:45 AM', drop: '03:20 PM' },
    { name: 'Rohan Gupta', roll: 'S103', grade: '10', section: 'B', route: 'Route 3', pickup: '07:40 AM', drop: '03:25 PM' },
    { name: 'Priya Jain', roll: 'S104', grade: '11', section: 'C', route: 'Route 1', pickup: '07:35 AM', drop: '03:30 PM' },
    { name: 'Aisha Khan', roll: 'S105', grade: '10', section: 'B', route: 'Route 4', pickup: '07:50 AM', drop: '03:15 PM' }
  ];

  filteredStudents: any[] = [];
  message = '';
  classError = '';
  sectionError = '';

  showTransport(): void {
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

    this.filteredStudents = this.students.filter(student =>
      student.grade === this.selectedClass && student.section === this.selectedSection
    );

    this.message = this.filteredStudents.length
      ? ''
      : 'No students found for the selected Class and Section.';
  }
}
