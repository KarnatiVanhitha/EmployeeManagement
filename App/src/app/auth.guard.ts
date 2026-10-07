import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { EmployeeService } from './services/employee.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    return this.employeeService.isLoggedIn()
      ? true
      : this.router.createUrlTree(['/']);
  }
}
