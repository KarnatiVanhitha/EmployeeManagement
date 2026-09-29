import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = '/api/calendar';

  constructor(private http: HttpClient) {}

  // Meetings
  getMeetings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meetings`);
  }

  addMeeting(meeting: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings`, meeting);
  }

  updateMeeting(id: number, meeting: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/meetings/${id}`, meeting);
  }

  deleteMeeting(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/meetings/${id}`);
  }

  // Holidays
  getHolidays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/holidays`);
  }

  addHoliday(holiday: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/holidays`, holiday);
  }

  updateHoliday(id: number, holiday: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/holidays/${id}`, holiday);
  }

  deleteHoliday(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/holidays/${id}`);
  }
}
