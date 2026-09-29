import { TestBed } from '@angular/core/testing';

import { JiraserviceService } from './jiraservice.service';

describe('JiraserviceService', () => {
  let service: JiraserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
