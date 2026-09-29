import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="app-toast"
         [class.show]="toast.visible"
         [class.toast-success]="toast.type === 'success'"
         [class.toast-error]="toast.type === 'error'"
         [class.toast-info]="toast.type === 'info'">
      <span class="toast-icon">
        <i [class]="toast.type === 'success' ? 'bi bi-check-circle-fill' :
                    toast.type === 'error'   ? 'bi bi-x-circle-fill' :
                                               'bi bi-info-circle-fill'"></i>
      </span>
      <span class="toast-text">{{ toast.message }}</span>
      <button class="toast-close" (click)="toast.hide()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `,
  styles: [`
    .app-toast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.96);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      min-width: 280px;
      max-width: 420px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      font-size: 0.92rem;
      font-weight: 500;
      color: #fff;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      text-align: center;
    }
    .app-toast.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
    }
    .app-toast.toast-success { background: linear-gradient(135deg, #1a9e5e, #27c47c); }
    .app-toast.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }
    .app-toast.toast-info    { background: linear-gradient(135deg, #086caf, #2196f3); }
    .toast-icon { font-size: 1.3rem; display: flex; align-items: center; flex-shrink: 0; }
    .toast-text { flex: 1; line-height: 1.4; }
    .toast-close {
      background: none; border: none; color: rgba(255,255,255,0.8);
      cursor: pointer; font-size: 1.1rem; padding: 0; margin-left: 4px;
      display: flex; align-items: center;
    }
    .toast-close:hover { color: #fff; }
  `]
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
