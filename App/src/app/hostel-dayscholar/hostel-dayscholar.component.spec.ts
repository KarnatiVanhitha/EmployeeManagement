import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';

import { HostelDayscholarComponent } from './hostel-dayscholar.component';

describe('HostelDayscholarComponent', () => {
  let component: HostelDayscholarComponent;
  let fixture: ComponentFixture<HostelDayscholarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [HostelDayscholarComponent]
    });
    fixture = TestBed.createComponent(HostelDayscholarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
