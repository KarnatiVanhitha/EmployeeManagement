import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/admins';
  private _forgotpassword = 0;

  get forgotpassword(): number {
    const storedType = sessionStorage.getItem('forgotpasswordType');
    return storedType === null ? this._forgotpassword : Number(storedType);
  }

  set forgotpassword(value: number) {
    this._forgotpassword = value;
    sessionStorage.setItem('forgotpasswordType', String(value));
  }

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  verifyEmail(email: string) {
    return this.http.post(`${this.apiUrl}/verify-email`, { Email: email });
  }

  resetPassword(data: any) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
}
