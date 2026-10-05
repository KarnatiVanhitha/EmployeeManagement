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

  beforeEach(() => {
    const employeeService = jasmine.createSpyObj<EmployeeService>(
      'EmployeeService',
      ['getEmployees', 'getDepartmentRoles', 'getRolesByDepartment']
    );
    employeeService.getEmployees.and.returnValue(of([]));
    employeeService.getDepartmentRoles.and.returnValue(of({ departments: [], roles: [] }));
    employeeService.getRolesByDepartment.and.returnValue(of([]));

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
});
