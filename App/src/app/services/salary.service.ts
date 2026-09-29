import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  constructor(private http: HttpClient) { }
  getSalaries() {

  return this.http.get('http://localhost:3000/api/salaries');

}

getSalariesByEmployeeId(employeeId: number) {

  return this.http.get(`http://localhost:3000/api/salaries/employee/${employeeId}`);

}

addSalary(data: any) {

  return this.http.post(
    'http://localhost:3000/api/salaries',
    data
  );

}

updateSalary(id: number, data: any) {

  return this.http.put(
    `http://localhost:3000/api/salaries/${id}`,
    data
  );

}
}
