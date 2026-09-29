import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl =
    'http://localhost:3000/api/tasks';

  constructor(
    private http: HttpClient
  ) {}

  // Get all tasks
  getTasks(): Observable<any[]> {

    return this.http.get<any[]>(
      this.apiUrl
    );

  }

  // Get task by ID
  getTaskById(
    taskId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${taskId}`
    );

  }

  // Get tasks by project
  getTasksByProjectId(
    projectId: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/project/${projectId}`
    );

  }

  // Get tasks assigned to employee
  getTasksByEmployeeId(
    employeeId: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/employee/${employeeId}`
    );

  }

  // Create task
  addTask(
    data: any
  ): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      data
    );

  }

  // Update task
  updateTask(
    taskId: number,
    data: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${taskId}`,
      data
    );

  }

  // Update task status
  updateTaskStatus(
    taskId: number,
    status: string,
    progress: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${taskId}/status`,
      {
        status,
        progress
      }
    );

  }

  // Delete task
  deleteTask(
    taskId: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${taskId}`
    );

  }

}