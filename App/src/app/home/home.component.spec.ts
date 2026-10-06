import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { EmployeeService } from '../services/employee.service';
import {SidebarComponent} from '../sidebar/sidebar.component';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    const employeeService = jasmine.createSpyObj<EmployeeService>(
      'EmployeeService',
      ['getLoggedInUser', 'getCurrentEmployeeId', 'getEmployeeById']
    );
    employeeService.getLoggedInUser.and.returnValue(null);
    employeeService.getCurrentEmployeeId.and.returnValue(null);
    employeeService.getEmployeeById.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [HomeComponent, SidebarComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: EmployeeService, useValue: employeeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
