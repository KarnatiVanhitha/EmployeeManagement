import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'App';
  loading$: Observable<boolean>;

  constructor(loadingService: LoadingService) {
    this.loading$ = loadingService.loading$;
    this.applySavedPreferences();
  }

  private applySavedPreferences(): void {
    const savedPreferences = localStorage.getItem('appPreferences');
    if (!savedPreferences) {
      return;
    }

    try {
      const preferences = JSON.parse(savedPreferences);
      if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
        return;
      }

      document.body.classList.toggle('app-dark-mode', preferences.theme === 'dark');
      document.documentElement.style.fontSize =
        preferences.fontSize === 'small' ? '14px' :
        preferences.fontSize === 'large' ? '18px' : '16px';
      const fontFamilies = ['Kumbh Sans', 'Arial', 'Georgia'];
      const fontFamily = fontFamilies.includes(preferences.fontFamily)
        ? preferences.fontFamily
        : 'Kumbh Sans';
      document.documentElement.style.setProperty('--app-font-family', fontFamily);
    } catch (error) {
      console.error('Unable to apply saved appearance preferences:', error);
    }
  }
}
