import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css']
})
export class AddStudentComponent {
  constructor(private route: Router, private toastService: ToastService) {}
  firstName = '';
lastName = '';
email = '';
studentId = '';
studentClass = '';
gender = '';
age = 18;
class='';
image="";
 // ================= Father Variables =================
fatherName= '';
  fatherPhone= '';
  fatherOccupation= '';
  fatherEmail= '';
  fatherImage= '';
 // ================= Mother variables=================
  motherName= '';
  motherPhone='';
  motherOccupation= '';
  motherEmail= '';
  motherImage= '';
 // ================= GUARDIAN VARIABLES =================

guardianName = '';
guardianPhone = '';
guardianRelation = '';
guardianOccupation = '';
guardianEmail = '';
guardianImage = '';
role='';

// Field Errors
firstNameError = '';
lastNameError = '';
studentIdError = '';
emailError = '';
classError = '';
genderError = '';

clearErrors(): void {
  this.firstNameError = '';
  this.lastNameError = '';
  this.studentIdError = '';
  this.emailError = '';
  this.classError = '';
  this.genderError = '';
}

submitForm() {
  this.clearErrors();
  let hasError = false;

  if (!this.firstName?.trim()) {
    this.firstNameError = 'First Name is required';
    hasError = true;
  }
  if (!this.lastName?.trim()) {
    this.lastNameError = 'Last Name is required';
    hasError = true;
  }
  if (!this.studentId?.trim()) {
    this.studentIdError = 'Student ID is required';
    hasError = true;
  }
  if (!this.email?.trim()) {
    this.emailError = 'Email is required';
    hasError = true;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }
  }
  if (!this.studentClass) {
    this.classError = 'Class is required';
    hasError = true;
  }
  if (!this.gender) {
    this.genderError = 'Gender is required';
    hasError = true;
  }

  if (hasError) {
    this.toastService.showError('Please fill all required fields correctly');
    return;
  }

  const newStudent = {

    // STUDENT
    name: this.firstName + ' ' + this.lastName,

    studentid: this.studentId,

    email: this.email,

    class: this.studentClass,

    gender: this.gender,

    Age: this.age,

    designation: 'Student',

    image: this.studentImagePreview,

    // FATHER
    fatherName: this.fatherName,

    fatherPhone: this.fatherPhone,

    fatherEmail: this.fatherEmail,

    fatherOccupation: this.fatherOccupation,

    fatherImage: this.fatherImagePreview,

    // MOTHER
    motherName: this.motherName,

    motherPhone: this.motherPhone,

    motherEmail: this.motherEmail,

    motherOccupation: this.motherOccupation,

    motherImage: this.motherImagePreview,

    // GUARDIAN
    guardianName: this.guardianName,
    guardianPhone: this.guardianPhone,
    guardianOccupation: this.guardianOccupation,
    guardianRelation: this.guardianRelation,
    guardianEmail: this.guardianEmail,
    guardianImage: this.guardianImagePreview,
    timetable: [
      { period: '1', subject: 'Mathematics', time: '8:00 AM - 8:45 AM' },
      { period: '2', subject: 'English', time: '8:50 AM - 9:35 AM' },
      { period: '3', subject: 'Science', time: '9:45 AM - 10:30 AM' },
      { period: '4', subject: 'History', time: '10:45 AM - 11:30 AM' },
      { period: '5', subject: 'Computer Science', time: '11:40 AM - 12:25 PM' }
    ],
    homeworks: [
      { subject: 'Mathematics', task: 'Complete exercise 5 from chapter 4' },
      { subject: 'English', task: 'Write a short story on environmental conservation' },
      { subject: 'Science', task: 'Prepare the volcano model for Friday' }
    ]
  };

  const existingStudents =
    JSON.parse(localStorage.getItem('students') || '[]');

  existingStudents.push(newStudent);

  localStorage.setItem(
    'students',
    JSON.stringify(existingStudents)
  );

  this.toastService.showSuccess('Student Added Successfully');
  this.route.navigate(['./home/students'])
}
studentImagePreview: any = null;
fatherImagePreview: any = null;
motherImagePreview: any = null;
guardianImagePreview: any = null;

onImageChange(event: any, type: string) {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      if (type === 'student') {
        this.studentImagePreview = reader.result;
      }

      if (type === 'father') {
        this.fatherImagePreview = reader.result;
      }

      if (type === 'mother') {
        this.motherImagePreview = reader.result;
      }

      if (type === 'guardian') {
        this.guardianImagePreview = reader.result;
      }

    };

    reader.readAsDataURL(file);

  }
}
}
