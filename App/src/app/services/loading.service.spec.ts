import { fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;
  let loadingStates: boolean[];

  beforeEach(() => {
    service = new LoadingService();
    loadingStates = [];
    service.loading$.subscribe(isLoading => loadingStates.push(isLoading));
  });

  it('shows the indicator while a page is navigating', () => {
    service.beginNavigation();

    expect(loadingStates).toEqual([false, true]);

    service.endNavigation();

    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  });

  it('shows the indicator immediately while an explicit task is running', () => {
    service.beginTask();

    expect(loadingStates).toEqual([false, true]);

    service.endTask();

    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  });

  it('keeps the indicator visible until both an explicit task and request finish', () => {
    service.beginTask();
    service.beginRequest();

    service.endTask();
    expect(loadingStates[loadingStates.length - 1]).toBeTrue();

    service.endRequest();
    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  });

  it('keeps the indicator visible until both navigation and API requests finish', () => {
    service.beginNavigation();
    service.beginRequest();

    service.endNavigation();
    expect(loadingStates[loadingStates.length - 1]).toBeTrue();

    service.endRequest();
    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  });

  it('shows the indicator for API requests that take longer than the display delay', fakeAsync(() => {
    service.beginRequest();
    tick(250);
    expect(loadingStates[loadingStates.length - 1]).toBeTrue();

    service.endRequest();
    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  }));

  it('does not show the indicator for short API requests', fakeAsync(() => {
    service.beginRequest();
    tick(100);
    service.endRequest();
    tick(200);

    expect(loadingStates).not.toContain(true);
  }));
});
