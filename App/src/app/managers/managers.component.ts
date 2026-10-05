import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { ManagerService } from '../services/managers.service';

@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.css']
})
export class ManagersComponent implements OnInit {
  managers: any[] = [];
  employees: any[] = [];
  searchText = '';

  private currentEmployeeId: number | null = null;
  private currentDepartmentId: number | null = null;
  private currentDepartmentName = '';

  constructor(
    private managerService: ManagerService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentEmployeeId = this.employeeService.getCurrentEmployeeId();

    const loggedInUser = this.employeeService.getLoggedInUser();
    this.currentDepartmentId = this.toPositiveNumber(
      loggedInUser?.DepartmentID ??
      loggedInUser?.departmentId ??
      loggedInUser?.DepartmentId
    );
    this.currentDepartmentName = this.normalizeDepartmentName(
      loggedInUser?.DepartmentName ?? loggedInUser?.departmentName
    );

    this.loadManagers();
    this.loadEmployees();
  }

  loadManagers(): void {
    this.managerService.getManagers().subscribe({
      next: (data: any) => {
        this.managers = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading managers:', err);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        this.employees = Array.isArray(data) ? data : [];
        this.resolveCurrentEmployeeDepartment();
      },
      error: (err: any) => {
        console.error('Error loading employees in ManagersComponent:', err);
      }
    });
  }

  private resolveCurrentEmployeeDepartment(): void {
    if (this.currentEmployeeId === null) {
      return;
    }

    const currentEmployee = this.employees.find((employee: any) => {
      const employeeId = employee.EmployeeID ??
        employee.employeeId ??
        employee.EmployeeId ??
        employee.id;
      return Number(employeeId) === this.currentEmployeeId;
    });

    if (currentEmployee) {
      this.currentDepartmentId = this.toPositiveNumber(
        currentEmployee.DepartmentID ??
        currentEmployee.departmentId ??
        currentEmployee.DepartmentId
      );
      this.currentDepartmentName = this.normalizeDepartmentName(
        currentEmployee.DepartmentName ??
        currentEmployee.departmentName ??
        currentEmployee.Department
      );
    }
  }

  isCurrentEmployeeDepartment(manager: any): boolean {
    if (!manager || (this.currentDepartmentId === null && !this.currentDepartmentName)) {
      return false;
    }

    const managerDepartmentId = this.toPositiveNumber(
      manager.DepartmentID ?? manager.departmentId ?? manager.DepartmentId
    );
    if (this.currentDepartmentId !== null && managerDepartmentId !== null) {
      return this.currentDepartmentId === managerDepartmentId;
    }

    const managerDepartmentName = this.normalizeDepartmentName(
      manager.DepartmentName ?? manager.departmentName ??
      manager.TeamName ?? manager.teamName
    );
    return !!this.currentDepartmentName &&
      managerDepartmentName === this.currentDepartmentName;
  }

  filteredManagers(): any[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return this.managers;
    }

    return this.managers.filter((manager: any) => {
      const department = manager.DepartmentName ??
        manager.departmentName ??
        manager.TeamName ??
        manager.teamName ??
        '';
      const name = manager.ManagerName ??
        manager.FullName ??
        manager.managerName ??
        '';
      const email = manager.Email ?? manager.email ?? '';

      return [department, name, email]
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }

  private toPositiveNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
  }

  private normalizeDepartmentName(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
