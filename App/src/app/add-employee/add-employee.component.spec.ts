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
      ['getEmployees', 'getDepartmentRoles', 'getRolesByDepartment', 'addEmployee']
    );
    employeeService.getEmployees.and.returnValue(of([]));
    employeeService.getDepartmentRoles.and.returnValue(of({ departments: [], roles: [] }));
    employeeService.getRolesByDepartment.and.returnValue(of([]));
    employeeService.addEmployee.and.returnValue(of({ isManager: 0 }));

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

  it('allows signup with the required profile fields and no optional address or emergency details', () => {
    component.isSelfRegistration = true;
    component.employee = {
      ...component.employee,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      MobileNumber: '1234567890',
      Password: 'Password1',
      ConfirmPassword: 'Password1',
      Gender: 'Female',
      DateOfBirth: '1995-01-01',
      JoiningDate: '2026-10-05',
      DepartmentID: '1',
      RoleID: '1',
      EmploymentType: 'Full Time',
      Experience: '2'
    };

    component.registerEmployee();

    expect(employeeService.addEmployee).toHaveBeenCalled();
    expect(component.presentAddressError).toBe('');
    expect(component.permanentAddressError).toBe('');
    expect(component.emergencyNameError).toBe('');
    expect(component.emergencyRelationError).toBe('');
    expect(component.emergencyPhoneError).toBe('');
  });
});
