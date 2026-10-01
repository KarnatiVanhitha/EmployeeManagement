import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  constructor(private http: HttpClient) { }

  getSalaryData(employeeId?: number, email?: string) {
    let params = new HttpParams();
    if (employeeId) params = params.set('employeeId', employeeId);
    if (email) params = params.set('email', email);
    return this.http.get<any>('/api/salary-data', { params });
  }

  getSalaries() {

  return this.http.get('/api/salaries');

}

getSalariesByEmployeeId(employeeId: number) {

  return this.http.get(`/api/salaries/employee/${employeeId}`);

}

addSalary(data: any) {

  return this.http.post(
    '/api/salaries',
    data
  );

}

updateSalary(id: number, data: any) {

  return this.http.put(
    `/api/salaries/${id}`,
    data
  );

}
}
