// import { Component, OnDestroy } from '@angular/core';
// import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
// import { Observable, Subscription } from 'rxjs';
// import { filter } from 'rxjs/operators';
// import { LoadingService } from './services/loading.service';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnDestroy {
//   title = 'App';
//   loading$: Observable<boolean>;
//   private readonly navigationSubscription: Subscription;
//   private readonly loadingNavigationIds = new Set<number>();

//   constructor(loadingService: LoadingService, router: Router) {
//     this.loading$ = loadingService.loading$;
//     this.navigationSubscription = router.events.pipe(
//       filter(event =>
//         event instanceof NavigationStart ||
//         event instanceof NavigationEnd ||
//         event instanceof NavigationCancel ||
//         event instanceof NavigationError
//       )
//     ).subscribe(event => {
//       if (event instanceof NavigationStart) {
//         if (!this.isLoginUrl(event.url) && !this.isSignupUrl(event.url)) {
//           this.loadingNavigationIds.add(event.id);
//           loadingService.beginNavigation();
//         }
//       } else if (
//         event instanceof NavigationEnd ||
//         event instanceof NavigationCancel ||
//         event instanceof NavigationError
//       ) {
//         if (this.loadingNavigationIds.delete(event.id)) {
//           loadingService.endNavigation();
//         }
//       }
//     });
//     this.applySavedPreferences();
//   }

//   ngOnDestroy(): void {
//     this.navigationSubscription.unsubscribe();
//   }

//   private isSignupUrl(url: string): boolean {
//     return url.split('?')[0] === '/employee-signup';
//   }

//   private isLoginUrl(url: string): boolean {
//     const path = url.split('?')[0];
//     return path === '' || path === '/';
//   }

//   private applySavedPreferences(): void {
//     const savedPreferences = localStorage.getItem('appPreferences');
//     if (!savedPreferences) {
//       return;
//     }

//     try {
//       const preferences = JSON.parse(savedPreferences);
//       if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
//         return;
//       }

//       document.body.classList.toggle('app-dark-mode', preferences.theme === 'dark');
//       document.documentElement.style.fontSize =
//         preferences.fontSize === 'small' ? '14px' :
//         preferences.fontSize === 'large' ? '18px' : '16px';
//       const fontFamilies = ['Kumbh Sans', 'Arial', 'Georgia'];
//       const fontFamily = fontFamilies.includes(preferences.fontFamily)
//         ? preferences.fontFamily
//         : 'Kumbh Sans';
//       document.documentElement.style.setProperty('--app-font-family', fontFamily);
//     } catch (error) {
//       console.error('Unable to apply saved appearance preferences:', error);
//     }
//   }
// }

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

      if (
        !preferences ||
        typeof preferences !== 'object' ||
        Array.isArray(preferences)
      ) {
        return;
      }

      document.body.classList.toggle(
        'app-dark-mode',
        preferences.theme === 'dark'
      );

      document.documentElement.style.fontSize =
        preferences.fontSize === 'small'
          ? '14px'
          : preferences.fontSize === 'large'
            ? '18px'
            : '16px';

      const fontFamilies = ['Kumbh Sans', 'Arial', 'Georgia'];

      const fontFamily = fontFamilies.includes(preferences.fontFamily)
        ? preferences.fontFamily
        : 'Kumbh Sans';

      document.documentElement.style.setProperty(
        '--app-font-family',
        fontFamily
      );

    } catch (error) {
      console.error(
        'Unable to apply saved appearance preferences:',
        error
      );
    }
  }
}
