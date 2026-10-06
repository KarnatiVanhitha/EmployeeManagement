import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { ManagerService } from '../services/managers.service';

import { AddEmployeeComponent } from './add-employee.component';

describe('AddEmployeeComponent', () => {
  let component: AddEmployeeComponent;
  let fixture: ComponentFixture<AddEmployeeComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    employeeService = jasmine.createSpyObj<EmployeeService>(
      'EmployeeService',
      [
        'getEmployees',
        'getDepartmentRoles',
        'getRolesByDepartment',
        'getEmployeeById',
        'getLoggedInUser',
        'getCurrentEmployeeId',
        'isLoggedIn',
        'registerEmployeeAccount',
        'addEmployee',
        'updateEmployee'
      ]
    );
    employeeService.getEmployees.and.returnValue(of([]));
    employeeService.getDepartmentRoles.and.returnValue(of({ departments: [], roles: [] }));
    employeeService.getRolesByDepartment.and.returnValue(of([]));
    employeeService.getEmployeeById.and.returnValue(of({}));
    employeeService.getLoggedInUser.and.returnValue(null);
    employeeService.getCurrentEmployeeId.and.returnValue(null);
    employeeService.isLoggedIn.and.returnValue(false);
    employeeService.registerEmployeeAccount.and.returnValue(of({ message: 'Account created' }));
    employeeService.addEmployee.and.returnValue(of({ isManager: 0 }));
    employeeService.updateEmployee.and.returnValue(of({ message: 'Profile Updated Successfully' }));

    const managerService = jasmine.createSpyObj<ManagerService>(
      'ManagerService',
      ['getManagers']
    );
    managerService.getManagers.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [AddEmployeeComponent],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: ManagerService, useValue: managerService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: { url: '', navigate: jasmine.createSpy('navigate') } }
      ]
    });
    fixture = TestBed.createComponent(AddEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only one option for roles with the same name', () => {
    const roles = (component as any).uniqueRoles([
      { RoleID: 1, RoleName: 'DevOps Engineer' },
      { RoleID: 2, RoleName: ' DevOps Engineer ' },
      { RoleID: 3, RoleName: 'QA Engineer' }
    ]);

    expect(roles.map((role: any) => role.RoleID)).toEqual([1, 3]);
  });

  it('creates the account from signup step 1 without moving to step 2', () => {
    component.isSelfRegistration = true;
    component.employee = {
      ...component.employee,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      Password: 'Password1',
      ConfirmPassword: 'Password1'
    };

    component.createSignupAccount();

    expect(employeeService.registerEmployeeAccount).toHaveBeenCalledWith({
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      Password: 'Password1'
    });
    expect(component.signupStep).toBe(1);
    expect(employeeService.addEmployee).not.toHaveBeenCalled();
  });

  it('keeps employee signup on step 1 when signed in', () => {
    const router = TestBed.inject(Router);
    (router as any).url = '/employee-signup';
    employeeService.isLoggedIn.and.returnValue(true);
    employeeService.getLoggedInUser.and.returnValue({
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com'
    });
    employeeService.getCurrentEmployeeId.and.returnValue(42);
    employeeService.getEmployeeById.and.returnValue(of({
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      MobileNumber: '1234567890',
      Gender: 'Female',
      DateOfBirth: '1995-01-01T00:00:00.000Z',
      JoiningDate: '2026-10-05T00:00:00.000Z',
      DepartmentID: 1,
      RoleID: 1,
      EmploymentType: 'Full Time',
      Experience: 2
    }));

    component.ngOnInit();

    expect(component.isSelfRegistration).toBeTrue();
    expect(component.isCompletingProfile).toBeFalse();
    expect(component.signupStep).toBe(1);
    expect(employeeService.getEmployeeById).not.toHaveBeenCalled();
  });

  it('opens step 2 and prefills the existing profile from the dashboard route', () => {
    const router = TestBed.inject(Router);
    (router as any).url = '/home/complete-profile';
    employeeService.isLoggedIn.and.returnValue(true);
    employeeService.getLoggedInUser.and.returnValue({
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com'
    });
    employeeService.getCurrentEmployeeId.and.returnValue(42);
    employeeService.getEmployeeById.and.returnValue(of({
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      MobileNumber: '1234567890',
      Gender: 'Female',
      DateOfBirth: '1995-01-01T00:00:00.000Z',
      JoiningDate: '2026-10-05T00:00:00.000Z',
      DepartmentID: 1,
      RoleID: 1,
      EmploymentType: 'Full Time',
      Experience: 2
    }));

    component.ngOnInit();

    expect(component.isCompletingProfile).toBeTrue();
    expect(component.signupStep).toBe(2);
    expect(component.employee.FullName).toBe('Taylor Employee');
    expect(component.employee.Email).toBe('taylor@desidea.com');
    expect(component.employee.MobileNumber).toBe('1234567890');
    expect(component.employee.DateOfBirth).toBe('1995-01-01');
  });

  it('returns to the dashboard when backing out of profile completion', () => {
    const router = TestBed.inject(Router);
    component.isCompletingProfile = true;
    component.signupStep = 2;

    component.previousSignupStep();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.signupStep).toBe(2);
  });

  it('updates the signed-in employee instead of creating a duplicate account', () => {
    component.isSelfRegistration = true;
    component.isCompletingProfile = true;
    component.employee = {
      ...component.employee,
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      MobileNumber: '1234567890',
      Gender: 'Female',
      DateOfBirth: '1995-01-01',
      JoiningDate: '2026-10-05',
      DepartmentID: '1',
      RoleID: '1',
      EmploymentType: 'Full Time',
      Experience: '2'
    };

    component.registerEmployee();

    expect(employeeService.updateEmployee).toHaveBeenCalledWith(42, jasmine.any(Object));
    expect(employeeService.addEmployee).not.toHaveBeenCalled();
  });
});
