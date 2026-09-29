import { Component } from '@angular/core';

@Component({
  selector: 'app-hostel-dayscholar',
  templateUrl: './hostel-dayscholar.component.html',
  styleUrls: ['./hostel-dayscholar.component.css']
})
export class HostelDayscholarComponent {
  selectedType = '';
  selectedClass = '';
  selectedSection = '';

  typeOptions = [
    { value: 'hostel', label: 'Hostel' },
    { value: 'dayscholar', label: 'Dayscholar' }
  ];

  classes = ['9', '10', '11', '12'];
  sections = ['A', 'B', 'C'];

  filteredStudents: any[] = [];
  infoMessage = 'Please select Hostel or Dayscholar, Class, and Section.';

  students = [
    { name: 'Aarav Patel', roll: 'H101', class: '9', section: 'A', type: 'hostel' },
    { name: 'Neha Verma', roll: 'H105', class: '9', section: 'A', type: 'hostel' },
    { name: 'Nisha Sharma', roll: 'H102', class: '10', section: 'B', type: 'hostel' },
    { name: 'Rohan Gupta', roll: 'H103', class: '11', section: 'C', type: 'hostel' },
    { name: 'Priya Jain', roll: 'D101', class: '9', section: 'A', type: 'dayscholar' },
    { name: 'Aisha Khan', roll: 'D104', class: '9', section: 'A', type: 'dayscholar' },
    { name: 'Vikram Singh', roll: 'D102', class: '10', section: 'B', type: 'dayscholar' },
    { name: 'Sara Khan', roll: 'D103', class: '11', section: 'C', type: 'dayscholar' }
  ];

  showStudents(): void {
    if (!this.selectedType) {
      this.filteredStudents = [];
      this.infoMessage = 'Please select Hostel or Dayscholar.';
      return;
    }

    if (!this.selectedClass || !this.selectedSection) {
      this.filteredStudents = [];
      this.infoMessage = 'Please select Class and Section.';
      return;
    }

    this.filteredStudents = this.students.filter(
      student => student.type === this.selectedType &&
                 student.class === this.selectedClass &&
                 student.section === this.selectedSection
    );

    this.infoMessage = this.filteredStudents.length
      ? `${this.filteredStudents.length} ${this.selectedType === 'hostel' ? 'Hostel' : 'Dayscholar'} students found for Class ${this.selectedClass}, Section ${this.selectedSection}.`
      : `No ${this.selectedType === 'hostel' ? 'hostel' : 'dayscholar'} students found for the selected class and section.`;
  }
}
