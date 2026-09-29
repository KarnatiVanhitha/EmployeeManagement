import { Component } from '@angular/core';
import { AdminService } from '../services/admins.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.css']
})
export class AddAdminComponent {

  constructor(private adminService: AdminService, private toastService: ToastService) {}

  adminImagePreview: string | ArrayBuffer | null = null;

  // Admin Details
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  role = '';
  department = '';
  address = '';

  // Organization
  organizationType = '';

  // School Details
  schoolName = '';
  schoolCode = '';
  schoolType = '';
  schoolAddress = '';

  // Office Details
  officeName = '';
  officeCode = '';
  officeType = '';
  officeAddress = '';

  // Field Errors
  fullNameError = '';
  emailError = '';
  phoneError = '';
  passwordError = '';
  confirmPasswordError = '';
  roleError = '';
  organizationTypeError = '';

  clearErrors(): void {
    this.fullNameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.roleError = '';
    this.organizationTypeError = '';
  }

  onImageChange(event: any): void {

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.adminImagePreview = reader.result;
    };

    reader.readAsDataURL(file);

  }

  registerAdmin(): void {
    this.clearErrors();
    let hasError = false;

    if (!this.fullName?.trim()) {
      this.fullNameError = 'Full Name is required';
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

    if (!this.phone?.trim()) {
      this.phoneError = 'Mobile Number is required';
      hasError = true;
    }

    if (!this.password?.trim()) {
      this.passwordError = 'Password is required';
      hasError = true;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (!this.confirmPassword?.trim()) {
      this.confirmPasswordError = 'Confirm Password is required';
      hasError = true;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    if (!this.role) {
      this.roleError = 'Please select Role';
      hasError = true;
    }

    if (!this.organizationType) {
      this.organizationTypeError = 'Please select School or Office';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fix the errors below.');
      return;
    }

    const adminData = {

      FullName: this.fullName,
      Email: this.email,
      MobileNumber: this.phone,
      Password: this.password,

      AdminType: this.organizationType,

      RoleID: Number(this.role),

      DepartmentID: Number(this.department),

      Address: this.address,

      SchoolName: this.schoolName,
      SchoolCode: this.schoolCode,
      SchoolType: this.schoolType,
      SchoolAddress: this.schoolAddress,

      OfficeName: this.officeName,
      OfficeCode: this.officeCode,
      OfficeType: this.officeType,
      OfficeAddress: this.officeAddress,

      AdminPhoto: this.adminImagePreview,

      IsActive: true

    };

    this.adminService.addAdmin(adminData).subscribe({

      next: (res: any) => {

        this.toastService.showSuccess(res.message);

        this.resetForm();

      },

      error: (err: any) => {

        console.log(err);

        this.toastService.showError(err.error?.message || 'Something went wrong.');

      }

    });

  }

  resetForm(): void {

    this.fullName = '';
    this.email = '';
    this.phone = '';
    this.password = '';
    this.confirmPassword = '';
    this.role = '';
    this.department = '';
    this.address = '';

    this.organizationType = '';

    this.schoolName = '';
    this.schoolCode = '';
    this.schoolType = '';
    this.schoolAddress = '';

    this.officeName = '';
    this.officeCode = '';
    this.officeType = '';
    this.officeAddress = '';

    this.adminImagePreview = null;

  }

}