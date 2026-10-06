import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],
      declarations: [DashboardComponent]
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows no manager when none is assigned to the employee department', () => {
    component.currentEmployee = {
      EmployeeID: 7,
      DepartmentID: null,
      RoleID: null
    };
    component.currentUserEmployeeId = 7;

    component.findCurrentManager(
      [{ EmployeeID: 12, FullName: 'Another Department Manager' }],
      []
    );

    expect(component.managerInfo.name).toBe('Not Assigned');
    expect(component.managerInfo.role).toBe('Not Assigned');
  });
});
