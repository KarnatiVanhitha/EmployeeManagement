import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpContextToken,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_GLOBAL_LOADING)) {
      return next.handle(request);
    }

    this.loadingService.beginRequest();
    return next.handle(request).pipe(
      finalize(() => this.loadingService.endRequest())
    );
  }
}