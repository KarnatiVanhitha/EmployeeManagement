import { Component } from '@angular/core';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent {
  // ================= TS FILE =================

classes = [
  { name: 'Class 1', students: 35 },
  { name: 'Class 2', students: 40 },
  { name: 'Class 3', students: 28 },
  { name: 'Class 4', students: 50 },
  { name: 'Class 5', students: 42 },
  { name: 'Class 6', students: 31 },
  { name: 'Class 7', students: 48 },
  { name: 'Class 8', students: 44 },
  { name: 'Class 9', students: 52 },
  { name: 'Class 10', students: 60 }
];

sections = ['Section A', 'Section B', 'Section C'];

students = [
  {
    name: 'Rahul Sharma',
    roll: 101,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Priya Reddy',
    roll: 102,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Arjun Kumar',
    roll: 103,
    image: 'https://randomuser.me/api/portraits/men/55.jpg'
  }
];

selectedClass: any = null;
selectedSection: any = '';
selectedStudent: any = null;

// SELECT CLASS
selectClass(cls: any) {

  this.selectedClass = cls.name;

  this.selectedSection = '';

  this.selectedStudent = null;
}

// VIEW STUDENT
viewStudent(student: any) {

  this.selectedStudent = student;
}
}
