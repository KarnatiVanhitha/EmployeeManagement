import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import { TeachersComponent } from './teachers.component';

describe('TeachersComponent', () => {
  let component: TeachersComponent;
  let fixture: ComponentFixture<TeachersComponent>;

beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [TeachersComponent],
    imports: [
      FormsModule
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (key: string) => null
            }
          }
        }
      }
    ]
  });

  fixture = TestBed.createComponent(TeachersComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
