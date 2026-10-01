import { Component } from '@angular/core';
import { TeacherService } from '../services/teacher.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-add-teacher',
  templateUrl: './add-teacher.component.html',
  styleUrls: ['./add-teacher.component.css']
})
export class AddTeacherComponent {


  // =========================
  // TEACHER OBJECT
  // =========================

  teacher: any = {
    teacherId: '',
  firstName: '',
  lastName: '',
  class: '',
  subject: '',
  gender: '',
  phone: '',
  email: '',
  bloodGroup: '',
  joiningDate: '',
  fatherName: '',
  motherName: '',
  dob: '',
  maritalStatus: '',
  qualification: '',
  experience: '',
  previousSchool: '',
  previousSchoolAddress: '',
  address: '',
  permanentAddress: '',
  pan: '',
  status: '',
  image: ''

};

  // =========================
  // ERRORS
  // =========================

  errors: any = {
    file: ''
  };

  // selectedFile: File | null = null;

  constructor(
    private teacherService: TeacherService,
    private router: Router,
    private toastService: ToastService
  ) {}

  // =========================
  // FILE SELECT
  // =========================

  onImageChange(event: any, type: string) {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      if (type === 'teacher') {
        this.teacher.image = reader.result;
      }


    };

    reader.readAsDataURL(file);

  }
}
  // =========================
  // EMAIL VALIDATION
  // =========================

  isValidEmail(email: string): boolean {

    const regex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

  }

  // =========================
  // PHONE VALIDATION
  // =========================

  isValidPhone(phone: string): boolean {

    const regex = /^[6-9]\d{9}$/;

    return regex.test(phone);

  }

  // =========================
  // COMPLETE FORM VALIDATION
  // =========================

  validateForm(): boolean {

    this.errors = {};

    // First Name
    if (!this.teacher.firstName?.trim()) {
      this.errors.firstName = 'First Name is required';
    }

    // Last Name
    if (!this.teacher.lastName?.trim()) {
      this.errors.lastName = 'Last Name is required';
    }

    // Email
    if (!this.teacher.email?.trim()) {
      this.errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.teacher.email)) {
      this.errors.email = 'Invalid Email';
    }

    // Class
    if (!this.teacher.class?.trim()) {
      this.errors.class = 'Class is required';
    }

    // Gender
    if (!this.teacher.gender?.trim()) {
      this.errors.gender = 'Gender is required';
    }

    // Phone
    if (!this.teacher.phone?.trim()) {
      this.errors.phone = 'Phone number is required';
    } else if (!this.isValidPhone(this.teacher.phone)) {
      this.errors.phone = 'Invalid phone number';
    }

    // Subject
    if (!this.teacher.subject?.trim()) {
      this.errors.subject = 'Subject is required';
    }

    // Document
    if (!this.teacher.image) {

      this.errors.file =
        'Teacher image is required';

    }
console.log('Validation Errors:', this.errors);
    return Object.keys(this.errors).length === 0;

  }

  // =========================
  // BUTTON DISABLE
  // =========================

  isFormInvalid(): boolean {

    return !this.validateForm();

  }

  // =========================
  // ADD TEACHER
  // =========================

  addTeacher(): void {

    if (!this.validateForm()) {

      console.log('Validation Errors:', this.errors);

      this.toastService.showError('Please fill all required fields correctly');
      return;

    }

    const payload = {

      ...this.teacher,
      // file: this.selectedFile

    };

    // Save Teacher
    this.teacherService.addTeacher(payload);

    this.toastService.showSuccess('Teacher Added Successfully');

    // Reset Form
    this.teacher = {
      fullName: '',
      email: '',
      class: '',
      gender: '',
      Age: '',
      Password: '',
      phone: '',
      subject: '',
      image: '',
    };

    // this.selectedFile = null;

    // Redirect
    this.router.navigate(['/home/teachers']);
    
  }


}
