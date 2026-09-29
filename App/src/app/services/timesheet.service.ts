import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private apiUrl = 'http://localhost:3000/api/timesheets';

  constructor(private http: HttpClient) {}

  getTimesheets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTimesheetsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getTimesheetsByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getTimesheetsByTask(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/task/${taskId}`);
  }

  addTimesheet(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  deleteTimesheet(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

