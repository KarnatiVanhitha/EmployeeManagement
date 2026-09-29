import { Component } from '@angular/core';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent {
students: any[] = [];

  selectedStudent: any = null;
  

  expandedRow: number | null = null;

  ngOnInit(): void {

    const data = localStorage.getItem('students');
  

    if (data) {
      this.students = JSON.parse(data);
    }

  }

  openTeacherDetails(student: any) {

    this.selectedStudent = student;

  }

  toggleDropdown(index: number) {

    if (this.expandedRow === index) {
      this.expandedRow = null;
    } else {
      this.expandedRow = index;
    }

  }

  deleteStudent(index: number) {

    this.students.splice(index, 1);

    localStorage.setItem(
      'students',
      JSON.stringify(this.students)
    );

    this.selectedStudent = null;

  }
  // ================= EDIT STUDENT =================

editStudent: any = {...this.students};

openEditStudent(student: any): void {
  // create a copy so original data is not directly edited
  this.editStudent = { ...student };
}

saveStudent(): void {
  if (!this.editStudent) return;

  const index = this.students.findIndex(
    s => s.studentid === this.editStudent.studentid
  );

  if (index !== -1) {
    this.students[index] = { ...this.editStudent };
  }

  this.editStudent = this.students;
}

closeEdit(): void {
  this.editStudent = null;
}

}
