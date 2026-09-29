import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent  {
  
  step = 1;

  students: any[] = [];

  accountForm: FormGroup;
  passwordForm: FormGroup;
  staffForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private toastService: ToastService
  ) {

    this.accountForm = this.fb.group({
      adminName: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      schoolName: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      role: [
        '',
        Validators.required
      ]
    });

    this.passwordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'
            )
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );

    this.staffForm = this.fb.group({
      staffCount: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
        ]
      ]
    });

  }

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return {
        passwordMismatch: true
      };
    }

    return null;
  }

  next(): void {

    if (this.step === 1) {

      this.accountForm.markAllAsTouched();

      if (this.accountForm.valid) {
        this.step++;
      }

    }

    else if (this.step === 2) {

      this.passwordForm.markAllAsTouched();

      if (this.passwordForm.valid) {
        this.step++;
      }

    }

    else if (this.step === 3) {

      this.staffForm.markAllAsTouched();

      if (this.staffForm.valid) {
        this.submit();
      }

    }
  }

  back(): void {

    if (this.step > 1) {
      this.step--;
    }

  }

  submit(): void {

    if (
      this.accountForm.invalid ||
      this.passwordForm.invalid ||
      this.staffForm.invalid
    ) {

      this.toastService.showError('Please fill all required fields correctly.');
      return;
    }

    const data = {
      id: Date.now(),

      ...this.accountForm.value,

      ...this.passwordForm.value,

      ...this.staffForm.value,

      createdAt: new Date()
    };

    const users = JSON.parse(
      localStorage.getItem('users') || '[]'
    );

    const userExists = users.some(
      (user: any) =>
        user.email.toLowerCase() ===
        data.email.toLowerCase()
    );

    if (userExists) {

      this.toastService.showError('Email already registered!');
      return;
    }

    users.push(data);

    localStorage.setItem(
      'users',
      JSON.stringify(users)
    );

    console.log(
      'Registered Data:',
      data
    );

    console.log(
      'All Users:',
      users
    );

    this.toastService.showSuccess('Registration Successful');

    this.accountForm.reset();
    this.passwordForm.reset();
    this.staffForm.reset();

    this.step = 1;

    this.route.navigate(['/']);
  }

  get adminName() {
    return this.accountForm.get('adminName');
  }

  get schoolName() {
    return this.accountForm.get('schoolName');
  }

  get email() {
    return this.accountForm.get('email');
  }

  get role() {
    return this.accountForm.get('role');
  }

  get password() {
    return this.passwordForm.get('password');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  get staffCount() {
    return this.staffForm.get('staffCount');
  }

  get address() {
    return this.staffForm.get('address');
  }

}
