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
  const email = this.email.trim();
  // Email Required & Email Validation
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {

    this.emailerror = "Email is required.";
    return;

  }
 

  else if (!emailPattern.test(email)) {


    this.emailerror = "Please enter a valid Email Address.";
    return;

  }

   if (this.authService.forgotpassword === 1) {

      this.authService.verifyEmail(email).subscribe({

        next: (res: any) => {

          this.successMessage = res.message;
          localStorage.setItem("resetEmail", email);
          localStorage.setItem("resetType", "admin");
          this.authService.forgotpassword = 0;
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

      this.employeeService.verifyEmail(email).subscribe({

        next: (res: any) => {

   
          this.successMessage = res.message;
          localStorage.setItem("resetEmail", email);
          localStorage.setItem("resetType", "employee");
          this.authService.forgotpassword = 0;
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 2000);
        },

        error: (err: any) => {

         
          this.emailerror = err.error?.message || "Email not found.";
        }

      });

    }

    else {
      this.emailerror = 'Open Forgot Password from your employee or admin login page.';
    }

  }


}
