import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

 
  constructor( private http:HttpClient) { }
  private apiUrl = '/api/projects';
  private tasksUrl = '/api/tasks';
  private useCasesUrl = '/api/usecases';
  private sprintsUrl = '/api/sprints';

  addProject(project: any) {
    return this.http.post(this.apiUrl, project);
  }

  getProjects() {
    return this.http.get(this.apiUrl);
  }

  getJiraProjects() {
    return this.http.get<any>(
      '/api/jira/projects',
      {
        params: {
          maxResults: 100,
          orderBy: 'name'
        }
      }
    );
  }

  getJiraIssueTypes(): Observable<any[]> {
    return this.http.get<any[]>(
      '/api/jira/issue-types'
    );
  }

  getJiraSpaces(params?: any): Observable<any> {
    return this.http.get<any>(
      '/api/jira/spaces',
      {
        params: params || { limit: 100 }
      }
    );
  }

  getJiraEpics(projectId: string): Observable<any> {
    return this.http.get<any>(
      '/api/jira/issues/search',
      {
        params: {
          jql: `project = ${projectId} AND issuetype = Epic`,
          maxResults: 100
        }
      }
    );
  }

  getJiraTasks(projectId: string): Observable<any> {
    return this.http.get<any>(
      '/api/jira/issues/search',
      {
        params: {
          jql: `project = ${projectId} AND issuetype in (Task, Story, Bug, "Sub-task") ORDER BY created DESC`,
          maxResults: 100
        }
      }
    );
  }

  getJiraSprints(boardId: string = '100'): Observable<any> {
    return this.http.get<any>(
      '/api/jira/sprints',
      {
        params: {
          boardId
        }
      }
    );
  }

  getJiraBoards(projectId: string): Observable<any> {
    return this.http.get<any>(
      '/api/jira/boards',
      {
        params: {
          projectKeyOrId: projectId,
          maxResults: 100
        }
      }
    );
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/managers`
    );
  }

  // =========================
  // USE CASES
  // =========================

  createUseCase(data: any): Observable<any> {
    return this.http.post(
      this.useCasesUrl,
      data
    );
  }

  getUseCasesByProject(
    projectId: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.useCasesUrl}/project/${projectId}`
    );
  }

  // =========================
  // SPRINTS
  // =========================

  createSprint(data: any): Observable<any> {
    return this.http.post(
      this.sprintsUrl,
      data
    );
  }

  getSprintsByProject(
    projectId: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.sprintsUrl}/project/${projectId}`
    );
  }

  // =========================
  // CREATE TASK
  // =========================

  createTask(data: any): Observable<any> {
    return this.http.post(
      this.tasksUrl,
      data
    );
  }

  // =========================
  // GET TASKS BY PROJECT
  // =========================

  getTasksByProject(
    projectId: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.tasksUrl}/project/${projectId}`
    );
  }

  // =========================
  // GET TASKS BY SPRINT
  // =========================

  getTasksBySprint(
    sprintId: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/tasks/sprint/${sprintId}`
    );
  }

  // =========================
  // GET SINGLE TASK
  // =========================

  getTaskById(
    taskId: number
  ): Observable<any> {
    return this.http.get(
      `${this.tasksUrl}/${taskId}`
    );
  }

  // =========================
  // UPDATE TASK
  // =========================

  updateTask(
    taskId: number,
    data: any
  ): Observable<any> {
    return this.http.put(
      `${this.tasksUrl}/${taskId}`,
      data
    );
  }

  // =========================
  // ASSIGN TASK
  // =========================

  assignTask(
    taskId: number,
    assignedTo: number,
    status: string = 'Assigned'
  ): Observable<any> {
    return this.http.put(
      `${this.tasksUrl}/${taskId}/assign`,
      { AssignedTo: assignedTo, Status: status }
    );
  }

  // =========================
  // UPDATE TASK STATUS & PROGRESS
  // =========================

  updateTaskStatus(
    taskId: number,
    status: string,
    progress?: number
  ): Observable<any> {
    return this.http.put(
      `${this.tasksUrl}/${taskId}/status`,
      { status, progress }
    );
  }

  // =========================
  // DELETE TASK
  // =========================

  deleteTask(
    taskId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.tasksUrl}/${taskId}`
    );
  }
}
