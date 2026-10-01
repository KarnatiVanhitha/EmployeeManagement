import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-add-staff',
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css']
})
export class AddStaffComponent {
  constructor(private toastService: ToastService) {}
staff:any = {
  staffId: '',
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
  image:'',
};

// Field Errors
firstNameError = '';
lastNameError = '';
genderError = '';
phoneError = '';
emailError = '';

clearErrors(): void {
  this.firstNameError = '';
  this.lastNameError = '';
  this.genderError = '';
  this.phoneError = '';
  this.emailError = '';
}

onImageChange(event: any, type: string) {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      if (type === 'staff') {
        this.staff.image = reader.result;
      }

    };

    reader.readAsDataURL(file);

  }
}
addStaff() {
  this.clearErrors();
  let hasError = false;

  if (!this.staff.firstName?.trim()) {
    this.firstNameError = 'First Name is required';
    hasError = true;
  }
  if (!this.staff.lastName?.trim()) {
    this.lastNameError = 'Last Name is required';
    hasError = true;
  }
  if (!this.staff.gender) {
    this.genderError = 'Gender is required';
    hasError = true;
  }
  if (!this.staff.phone?.trim()) {
    this.phoneError = 'Phone Number is required';
    hasError = true;
  }
  if (!this.staff.email?.trim()) {
    this.emailError = 'Email is required';
    hasError = true;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.staff.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }
  }

  if (hasError) {
    this.toastService.showError('Please fill all required fields correctly');
    return;
  }

  // Existing Staff
  const existingData = localStorage.getItem('staffList');

  const staffList = existingData
    ? JSON.parse(existingData)
    : [];

  // Create Staff Object
  const newStaff = {
    ...this.staff,
    role: 'Staff',
    id: Date.now()
  };

  // Save Staff
  staffList.push(newStaff);

  localStorage.setItem(
    'staffList',
    JSON.stringify(staffList)
  );

  this.toastService.showSuccess('Staff Added Successfully');

  // Reset Form
  this.staff = {
    staffId: '',
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
    image: '',
  };

}
}
