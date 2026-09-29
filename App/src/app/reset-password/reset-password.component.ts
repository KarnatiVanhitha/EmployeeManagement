import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { ToastService } from '../services/toast.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {


  newPassword = '';
  confirmPassword = '';

  newPasswordError = '';
  confirmPasswordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private employeeService: EmployeeService,
    private toastService: ToastService
  ) { }

resetPassword(): void {

  const email = localStorage.getItem("resetEmail");

  if (!email) {
    this.toastService.showError('Session expired. Please verify your email again.');
    this.router.navigate(['/forgot-password']);
    return;
  }

  // New Password Required
  if (!this.newPassword.trim()) {
    this.newPasswordError = 'New Password is required.';
    return;
  }

  // Confirm Password Required
  if (!this.confirmPassword.trim()) {
    this.confirmPasswordError = 'Confirm Password is required.';
    return;
  }

  // Password Length
  if (this.newPassword.length < 6) {
    this.newPasswordError = 'Password must be at least 6 characters long.';
    return;
  }

  // Strong Password Validation
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{6,}$/;

  if (!passwordPattern.test(this.newPassword)) {
    this.newPasswordError = 'Password must contain uppercase, lowercase, number and special character.';
    return;
  }

  // Password Match
  if (this.newPassword !== this.confirmPassword) {
    this.confirmPasswordError = 'Passwords do not match.';
    return;
  }

const data = {

  Email: email,

  NewPassword: this.newPassword

};

const resetType = localStorage.getItem("resetType");

if (resetType === "admin") {

  this.authService.resetPassword(data).subscribe({

    next: (res: any) => {
      this.toastService.showSuccess(res.message);
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetType");
      this.router.navigate(['/Admin-login']);
    },
    error: (err: any) => {
      this.toastService.showError(err.error?.message || 'Something went wrong.');
    }

  });

}

else if (resetType === "employee") {

  this.employeeService.resetPassword(data).subscribe({

    next: (res: any) => {
      this.toastService.showSuccess(res.message);
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetType");
      this.router.navigate(['/login']);
    },
    error: (err: any) => {
      this.toastService.showError(err.error?.message || 'Something went wrong.');
    }

  });

}

else {

  this.toastService.showError('Invalid reset request.');

}
}
}
