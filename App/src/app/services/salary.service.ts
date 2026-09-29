import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  constructor(private http: HttpClient) { }
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
