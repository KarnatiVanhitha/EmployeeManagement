import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADING } from './loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = '/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(payload: any): Observable<any> {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    return this.http.post<any>(this.apiUrl, body, {
      context: new HttpContext().set(SKIP_GLOBAL_LOADING, true)
    });
  }
}
