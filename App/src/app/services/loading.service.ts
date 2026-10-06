import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private activeRequests = 0;
  private activeNavigations = 0;
  private activeTasks = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  beginTask(): void {
    this.activeTasks += 1;
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.loadingSubject.next(true);
  }

  endTask(): void {
    if (this.activeTasks > 0) {
      this.activeTasks -= 1;
      this.updateLoadingState();
    }
  }

  beginRequest(): void {
    this.activeRequests += 1;
    if (this.activeRequests + this.activeNavigations + this.activeTasks === 1) {
      this.showTimer = setTimeout(() => {
        if (this.hasActiveWork()) {
          this.loadingSubject.next(true);
        }
        this.showTimer = null;
      }, 250);
    }
  }

  endRequest(): void {
    if (this.activeRequests > 0) {
      this.activeRequests -= 1;
      this.updateLoadingState();
    }
  }

  beginNavigation(): void {
    this.activeNavigations += 1;
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.loadingSubject.next(true);
  }

  endNavigation(): void {
    if (this.activeNavigations > 0) {
      this.activeNavigations -= 1;
      this.updateLoadingState();
    }
  }

  private hasActiveWork(): boolean {
    return this.activeRequests + this.activeNavigations + this.activeTasks > 0;
  }

  private updateLoadingState(): void {
    if (this.hasActiveWork()) {
      return;
    }

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.loadingSubject.next(false);
  }
}