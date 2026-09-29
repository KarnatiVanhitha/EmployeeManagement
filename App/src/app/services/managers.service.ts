import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private apiUrl = 'http://localhost:3000/api/managers';

  constructor(private http: HttpClient) { }

  // Get All Managers
  getManagers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get Manager By Id
  getManagerById(id: number): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Add Manager
  addManager(manager: any): Observable<any> {
    return this.http.post(this.apiUrl, manager);
  }

  // Update Manager
  updateManager(id: number, manager: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, manager);
  }

  // Delete Manager
  deleteManager(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
