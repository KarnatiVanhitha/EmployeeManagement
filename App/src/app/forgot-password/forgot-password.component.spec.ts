import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: { forgotpassword: number; verifyEmail: jasmine.Spy };
  let employeeService: { verifyEmail: jasmine.Spy };
  let router: jasmine.SpyObj<any>;

  beforeEach(() => {
    localStorage.removeItem('resetEmail');
    localStorage.removeItem('resetType');
    authService = {
      forgotpassword: 2,
      verifyEmail: jasmine.createSpy('verifyEmail')
        .and.returnValue(of({ message: 'Email verified successfully.' }))
    };

    employeeService = {
      verifyEmail: jasmine.createSpy('verifyEmail')
        .and.returnValue(of({ message: 'Email verified successfully.' }))
    };

    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [ForgotPasswordComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: EmployeeService, useValue: employeeService },
        { provide: Router, useValue: router }
      ]
    });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('verifies a trimmed employee email and stores the reset type', () => {
    component.email = '  employee@desidea.com  ';
    component.verifyEmail();

    expect(employeeService.verifyEmail).toHaveBeenCalledWith('employee@desidea.com');
    expect(localStorage.getItem('resetEmail')).toBe('employee@desidea.com');
    expect(localStorage.getItem('resetType')).toBe('employee');
    expect(authService.forgotpassword).toBe(0);
  });

  it('reports an error if the login type is not selected', () => {
    authService.forgotpassword = 0;
    component.email = 'employee@desidea.com';

    component.verifyEmail();

    expect(component.emailerror).toContain('Open Forgot Password');
    expect(employeeService.verifyEmail).not.toHaveBeenCalled();
    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });
});
