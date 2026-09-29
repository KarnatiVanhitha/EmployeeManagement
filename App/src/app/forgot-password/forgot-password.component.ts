import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  email = '';
  userType = ''; 
   emailerror = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private employeeService: EmployeeService
  ) { }

verifyEmail(): void {
  this.emailerror = '';
  this.successMessage = '';
  // Email Required & Email Validation
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!this.email.trim()) {

    this.emailerror = "Email is required.";
    return;

  }
 

  else if (!emailPattern.test(this.email)) {


    this.emailerror = "Please enter a valid Email Address.";
    return;

  }

   if (this.authService.forgotpassword === 1) {

      this.authService.verifyEmail(this.email).subscribe({

        next: (res: any) => {

          this.successMessage = res.message;
          localStorage.setItem("resetEmail", this.email);
          localStorage.setItem("resetType", "admin");
          setTimeout(() => {
          this.router.navigate(['/reset-password']);
          }, 2000); 
        },

        error: (err: any) => {

          this.emailerror = err.error?.message || "Email not found.";

        }

      });

    }

    // Employee Forgot Password
    else if (this.authService.forgotpassword === 2) {

      this.employeeService.verifyEmail(this.email).subscribe({

        next: (res: any) => {

   
          this.successMessage = res.message;
          localStorage.setItem("resetEmail", this.email);
          localStorage.setItem("resetType", "employee");
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 2000);
        },

        error: (err: any) => {

         
          this.emailerror = err.error?.message || "Email not found.";
        }

      });

    }

  }


}
