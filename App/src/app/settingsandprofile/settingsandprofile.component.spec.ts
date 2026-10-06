import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { of } from 'rxjs';
import { EmployeeService } from '../services/employee.service';
import { TeacherService } from '../services/teacher.service';

import { SettingsandprofileComponent } from './settingsandprofile.component';

describe('SettingsandprofileComponent', () => {
  let component: SettingsandprofileComponent;
  let fixture: ComponentFixture<SettingsandprofileComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    employeeService = jasmine.createSpyObj<EmployeeService>(
      'EmployeeService',
      [
        'getCurrentEmployeeId',
        'getEmployeeById',
        'getDepartmentRoles',
        'getRolesByDepartment',
        'updateEmployee',
        'getLoggedInUser',
        'setLoggedInUser'
      ]
    );
    employeeService.getCurrentEmployeeId.and.returnValue(null);
    employeeService.getDepartmentRoles.and.returnValue(of({ departments: [], roles: [] }));
    employeeService.getRolesByDepartment.and.returnValue(of([]));
    employeeService.getEmployeeById.and.returnValue(of({}));
    employeeService.updateEmployee.and.returnValue(of({ message: 'Profile updated' }));
    employeeService.getLoggedInUser.and.returnValue(null);

    const teacherService = jasmine.createSpyObj<TeacherService>('TeacherService', ['getTeachers']);
    teacherService.getTeachers.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SettingsandprofileComponent],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: TeacherService, useValue: teacherService }
      ]
    });
    fixture = TestBed.createComponent(SettingsandprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('appPreferences');
    document.body.classList.remove('app-dark-mode');
    document.documentElement.style.fontSize = '';
    document.documentElement.style.removeProperty('--app-font-family');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saves and applies light/dark appearance and font preferences', () => {
    component.preferencesForm.patchValue({
      theme: 'dark',
      fontFamily: 'Arial',
      fontSize: 'large'
    });

    component.savePreferences();

    expect(document.body.classList.contains('app-dark-mode')).toBeTrue();
    expect(document.documentElement.style.fontSize).toBe('18px');
    expect(document.documentElement.style.getPropertyValue('--app-font-family')).toBe('Arial');
    expect(JSON.parse(localStorage.getItem('appPreferences') || '{}').theme).toBe('dark');
  });

  it('loads employee data including fields that are still empty', () => {
    employeeService.getCurrentEmployeeId.and.returnValue(42);
    employeeService.getEmployeeById.and.returnValue(of({
      EmployeeID: 42,
      FullName: 'Taylor Employee',
      Email: 'taylor@desidea.com',
      DepartmentID: null,
      RoleID: null,
      MobileNumber: null
    }));

    component.ngOnInit();

    expect(component.isEmployeeProfile).toBeTrue();
    expect(component.profileForm.get('fullName')?.value).toBe('Taylor Employee');
    expect(component.profileForm.get('phone')?.value).toBe('');
    expect(component.profileForm.get('departmentId')?.value).toBe('');
    expect(component.profileForm.get('roleId')?.value).toBe('');
  });

  it('saves edited employee profile details through the employee service', () => {
    employeeService.getCurrentEmployeeId.and.returnValue(42);
    component.ngOnInit();
    component.profileForm.patchValue({
      fullName: 'Taylor Employee',
      email: 'taylor@desidea.com',
      phone: '1234567890'
    });

    component.saveProfile();

    expect(employeeService.updateEmployee).toHaveBeenCalledWith(
      42,
      jasmine.objectContaining({
        FullName: 'Taylor Employee',
        Email: 'taylor@desidea.com',
        MobileNumber: '1234567890'
      })
    );
    expect(employeeService.setLoggedInUser).toHaveBeenCalled();
  });
});
