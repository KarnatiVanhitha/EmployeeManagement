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
  }
}
