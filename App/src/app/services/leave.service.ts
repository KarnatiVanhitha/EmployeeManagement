import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  private apiUrl = 'http://localhost:3000/api/leaves';

  constructor(private http: HttpClient) { }

  getLeaves() {
    return this.http.get(this.apiUrl);
  }

  getEmployeeLeaves() {
    return this.http.get(`${this.apiUrl}/employee-leaves/all`);
  }

  getLeavesByEmployeeId(employeeId: number) {
    return this.http.get(`${this.apiUrl}/employee/${employeeId}`);
  }

  addLeave(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateLeaveStatus(id: number, status: string) {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}
