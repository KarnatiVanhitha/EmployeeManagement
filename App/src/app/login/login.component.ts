import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  emailError: string = '';
  passwordError: string = '';
  loginError: string = '';
  loginSuccess: string = '';

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) { }


Login(): void {

// Clear previous errors
this.emailError = '';
this.passwordError = '';
this.loginError = '';
this.loginSuccess = '';

// Email Validation
if (!this.email.trim()) {
  this.emailError = "Email is required.";
} else {
  const emailPattern = /^[^\s@]+@desidea\.com$/i;

  if (!emailPattern.test(this.email)) {
    this.emailError = "Only a valid @desidea.com email address can sign in.";
  }
}

// Password Validation
if (!this.password.trim()) {
  this.passwordError = "Password is required.";
}

// Stop login if any validation failed
if (this.emailError || this.passwordError) {
  return;
}



  const loginData = {
    Email: this.email.trim(),
    Password: this.password
  };

  this.employeeService.login(loginData).subscribe({

    next: (res: any) => {

      this.loginSuccess = res.message;

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", res.role || 'Employee');
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(res.user)
      );
      setTimeout(() => {
        this.route.navigate(['/home']);
      }, 1000);

    },

    error: (err: any) => {

      this.loginError = err.error?.message || "Invalid email or password. Please try again.";

    }

  });

}
forgot() {  
    this.authService.forgotpassword = 2;
}
}