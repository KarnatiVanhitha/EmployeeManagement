import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterLinkActive, RouterOutlet} from '@angular/router';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterLinkActive, RouterOutlet],
      declarations: [SidebarComponent]
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows office links for any non-school role', () => {
    component.role = 'R&D Manager';
    expect(component.isOfficeRole).toBeTrue();

    component.role = 'Custom Office Role';
    expect(component.isOfficeRole).toBeTrue();
  });

  it('normalizes role names and excludes school roles', () => {
    component.role = '  PROJECT_MANAGER ';
    expect(component.isOfficeRole).toBeTrue();

    component.role = 'School Admin';
    expect(component.isOfficeRole).toBeFalse();

    component.role = 'student';
    expect(component.isOfficeRole).toBeFalse();

    component.role = '';
    expect(component.isOfficeRole).toBeFalse();
  });

  it('shows employee management only to admin roles', () => {
    component.role = 'office';
    expect(component.canManageEmployees).toBeTrue();

    component.role = 'SuperAdmin';
    expect(component.canManageEmployees).toBeTrue();

    component.role = 'admin';
    expect(component.canManageEmployees).toBeTrue();

    component.role = 'Employee';
    expect(component.canManageEmployees).toBeFalse();
  });
});
