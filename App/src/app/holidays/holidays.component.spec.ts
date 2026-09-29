import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import { of } from 'rxjs';

import { HolidaysComponent } from './holidays.component';
import { CalendarService } from '../services/calendar.service';
import { ToastService } from '../services/toast.service';

describe('HolidaysComponent', () => {
  let component: HolidaysComponent;
  let fixture: ComponentFixture<HolidaysComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [HolidaysComponent],
      providers: [
        { provide: CalendarService, useValue: { getHolidays: () => of([]) } },
        { provide: ToastService, useValue: { showError: jasmine.createSpy('showError'), showSuccess: jasmine.createSpy('showSuccess') } }
      ]
    });
    fixture = TestBed.createComponent(HolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
