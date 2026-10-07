import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  email: string = '';
  password: string = '';
  showPassword = false;

  emailError: string = '';
  passwordError: string = '';
  loginError: string = '';
  loginSuccess: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  adminLogin(): void {

    // Clear previous errors
    this.emailError = '';
    this.passwordError = '';
    this.loginError = '';
    this.loginSuccess = '';

    //Email Required & Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!this.email.trim()) {

      this.emailError = "Email is required.";

    } else if (this.email && !emailPattern.test(this.email)) {

      this.emailError = "Please enter a valid email address.";

    }

    //Password Required
    if(!this.password.trim()) {
      
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

    this.authService.login(loginData).subscribe({

      next: (res: any) => {
        if (res.role === "school") {
          this.loginError = "School access is temporarily disabled.";
          return;
        }

        this.loginSuccess = res.message;

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", res.role);
        localStorage.setItem("loggedInUser", JSON.stringify(res.user));

        if (
          res.role === "SuperAdmin" ||
          res.role === "office"
        ) {
          setTimeout(() => {
          this.router.navigate(['/home']);
          }, 1000);
        } else {

          this.loginError = "Invalid Admin Type.";

        }

      },

      error: (err: any) => {

        this.loginError =
          err.error?.message || "Invalid Email or Password.Please try again.";

      }

    });

  }

  forgot() {

    this.authService.forgotpassword = 1;

    console.log(this.authService.forgotpassword);

  }
}
