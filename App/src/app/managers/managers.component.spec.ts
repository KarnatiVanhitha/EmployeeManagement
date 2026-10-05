import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ManagersComponent } from './managers.component';
import { ManagerService } from '../services/managers.service';
import { EmployeeService } from '../services/employee.service';
import { LeaveService } from '../services/leave.service';

describe('ManagersComponent', () => {
  let component: ManagersComponent;
  let fixture: ComponentFixture<ManagersComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    employeeService = jasmine.createSpyObj<EmployeeService>(
      'EmployeeService',
      ['getEmployees', 'getCurrentEmployeeId', 'getLoggedInUser']
    );
    employeeService.getEmployees.and.returnValue(of([]));
    employeeService.getCurrentEmployeeId.and.returnValue(5);
    employeeService.getLoggedInUser.and.returnValue({ DepartmentID: 2 });

    const managerService = jasmine.createSpyObj<ManagerService>(
      'ManagerService',
      ['getManagers']
    );
    managerService.getManagers.and.returnValue(of([]));

    const leaveService = jasmine.createSpyObj<LeaveService>(
      'LeaveService',
      ['getLeaves']
    );
    leaveService.getLeaves.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ManagersComponent],
      providers: [
        { provide: ManagerService, useValue: managerService },
        { provide: EmployeeService, useValue: employeeService },
        { provide: LeaveService, useValue: leaveService }
      ]
    });
    fixture = TestBed.createComponent(ManagersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('highlights the manager whose department matches the logged-in employee', () => {
    employeeService.getEmployees.and.returnValue(of([
      { EmployeeID: 5, DepartmentID: 3, DepartmentName: 'Engineering' }
    ]));
    component.loadEmployees();

    expect(component.isCurrentEmployeeDepartment({
      DepartmentID: 3,
      DepartmentName: 'Engineering'
    })).toBeTrue();
    expect(component.isCurrentEmployeeDepartment({
      DepartmentID: 4,
      DepartmentName: 'Finance'
    })).toBeFalse();
  });

  it('falls back to a normalized department name when IDs are unavailable', () => {
    employeeService.getCurrentEmployeeId.and.returnValue(null);
    employeeService.getLoggedInUser.and.returnValue({
      DepartmentName: '  Product Design '
    });
    component.ngOnInit();

    expect(component.isCurrentEmployeeDepartment({
      TeamName: 'product design'
    })).toBeTrue();
    expect(component.isCurrentEmployeeDepartment({
      TeamName: 'Engineering'
    })).toBeFalse();
  });
});
