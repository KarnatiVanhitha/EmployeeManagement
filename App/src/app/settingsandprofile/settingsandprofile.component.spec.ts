import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import { SettingsandprofileComponent } from './settingsandprofile.component';

describe('SettingsandprofileComponent', () => {
  let component: SettingsandprofileComponent;
  let fixture: ComponentFixture<SettingsandprofileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SettingsandprofileComponent]
    });
    fixture = TestBed.createComponent(SettingsandprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
