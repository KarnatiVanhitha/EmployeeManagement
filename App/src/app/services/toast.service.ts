import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = '';
  type: 'success' | 'error' | 'info' = 'success';
  visible = false;

  private timer: any;

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    if (this.timer) { clearTimeout(this.timer); }
    this.message = message;
    this.type = type;
    this.visible = true;
    this.timer = setTimeout(() => { this.visible = false; }, 1800);
  }

  showSuccess(message: string): void { this.show(message, 'success'); }
  showError(message: string): void   { this.show(message, 'error'); }
  showInfo(message: string): void    { this.show(message, 'info'); }

  hide(): void {
    this.visible = false;
    if (this.timer) { clearTimeout(this.timer); }
  }
}
