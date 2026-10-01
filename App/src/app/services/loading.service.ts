import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private activeRequests = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  beginRequest(): void {
    this.activeRequests += 1;
    if (this.activeRequests === 1) {
      this.showTimer = setTimeout(() => {
        if (this.activeRequests > 0) {
          this.loadingSubject.next(true);
        }
      }, 250);
    }
  }

  endRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
      this.loadingSubject.next(false);
    }
  }
}