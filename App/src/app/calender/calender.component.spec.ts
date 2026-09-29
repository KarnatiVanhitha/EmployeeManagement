import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import { of } from 'rxjs';

import { CalenderComponent } from './calender.component';
import { CalendarService } from '../services/calendar.service';
import { ToastService } from '../services/toast.service';

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CalenderComponent],
      providers: [
        { provide: CalendarService, useValue: { getMeetings: () => of([]), getHolidays: () => of([]) } },
        { provide: ToastService, useValue: { showError: jasmine.createSpy('showError'), showSuccess: jasmine.createSpy('showSuccess') } }
      ]
    });
    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
