import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ProjectsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the Jira sprint board endpoint', () => {
    service.getJiraSprints('100').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/jira/sprints?boardId=100');
    expect(req.request.method).toBe('GET');
    req.flush({ values: [] });
  });

  it('should look up Jira boards for the selected project', () => {
    service.getJiraBoards('1337').subscribe();

    const req = httpMock.expectOne(
      'http://localhost:3000/api/jira/boards?projectKeyOrId=1337&maxResults=100'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ values: [] });
  });
});
