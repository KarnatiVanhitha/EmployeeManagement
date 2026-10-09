import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!/\/api\/chat(?:\/|$|\?)/.test(request.url)) {
      return next.handle(request);
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return next.handle(request);
    }

    return next.handle(request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }
}
