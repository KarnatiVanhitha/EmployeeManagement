import { TestBed } from '@angular/core/testing';

import { ManagerService } from './managers.service';

describe('ManagersService', () => {
  let service: ManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
