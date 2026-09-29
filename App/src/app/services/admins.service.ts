import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = '/api/admins';

  constructor(private http: HttpClient) { }

  addAdmin(admin: any) {
  return this.http.post("/api/admins", admin);
}
  getAdmins(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getAdminById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}