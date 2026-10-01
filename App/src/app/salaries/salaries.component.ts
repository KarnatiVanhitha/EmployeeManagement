import { Component, OnInit } from '@angular/core';
import { SalaryService } from '../services/salary.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html',
  styleUrls: ['./salaries.component.css']
})
export class SalariesComponent implements OnInit {

  salaries: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  roles: any[] = [];
  selectedRole = '';
  role = '';
  basicSalaryError = '';
  experienceError = '';
  // Modal state
  showSalaryModal = false;
  selectedEmployee: any = null;
  isEditMode = false;

  // Salary Form
  salaryForm = {
    BasicSalary: 0,
   ExperienceYears: '' as number | string,
    HikePercentage: 0,
    HikeAmount: 0,
    Bonus: 0,
    Allowances: 0,
    Deductions: 0,
    SalaryMonth: '',
    PaymentDate: '',
    PaymentStatus: 'Pending'
  };
  // Experience → Hike Slabs (auto-assigned based on experience)
  readonly HIKE_SLABS = [
    { label: '0 – 2 years',  min: 0,  max: 2,       hike: 5  },
    { label: '2 – 5 years',  min: 2,  max: 5,       hike: 10 },
    { label: '5 – 10 years', min: 5,  max: 10,      hike: 15 },
    { label: '10+ years',    min: 10, max: Infinity, hike: 20 }
  ];

  constructor(
    private salaryService: SalaryService,
    private toastService: ToastService
  ) { }

  private normalizeRole(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }

  isAdminRole(): boolean {
    const r = this.normalizeRole(this.role);
    return ['superadmin', 'school', 'office', 'admin'].includes(r);
  }

  ngOnInit(): void {
    this.role = this.normalizeRole(localStorage.getItem('role'));
    this.loadSalaryData();
  }

  loadSalaryData(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const employeeId = Number(
      loggedInUser.EmployeeID ?? loggedInUser.employeeID ?? loggedInUser.id ?? 0
    );
    const email = (loggedInUser.Email || loggedInUser.email || '').toLowerCase();
    const request = this.isAdminRole()
      ? this.salaryService.getSalaryData()
      : this.salaryService.getSalaryData(employeeId || undefined, employeeId ? undefined : email);

    request.subscribe({
      next: (result: any) => {
        this.employees = result.employees || [];
        this.filteredEmployees = this.employees;
        this.roles = result.roles || [];
        this.salaries = result.salaries || [];
      },
      error: (err) => {
        console.error(err);
        this.employees = [];
        this.filteredEmployees = [];
        this.roles = [];
        this.salaries = [];
      }
    });
  }

  // ─── Role Filter ─────────────────────────────────────────
  onRoleChange(): void {
    if (!this.selectedRole) {
      this.filteredEmployees = this.employees;
      return;
    }
    const selectedRoleName = this.selectedRole.toLowerCase();
    this.filteredEmployees = this.employees.filter((emp: any) => {
      const employeeRoleName = (emp.RoleName || '').toLowerCase();
      const employeeRoleId   = Number(emp.RoleID);
      const matchedRole = this.roles.find((role: any) =>
        (role.RoleName || '').toLowerCase() === selectedRoleName
      );
      const selectedRoleId = matchedRole ? Number(matchedRole.RoleID) : null;
      return employeeRoleName === selectedRoleName || employeeRoleId === selectedRoleId;
    });
  }

  // ─── Experience Slab Helper ──────────────────────────────
  getSlabForExperience(years: string | number): { label: string; hike: number } {
    const numYears = years === '' ? 0 : Number(years);
    const slab = this.HIKE_SLABS.find(s => numYears >= s.min && numYears < s.max);
    return slab ? { label: slab.label, hike: slab.hike } : { label: 'N/A', hike: 0 };
  }

  // ─── Auto-calculate Hike from Experience ─────────────────
  onExperienceChange(): void {
    const slab = this.getSlabForExperience(this.salaryForm.ExperienceYears);
    this.salaryForm.HikePercentage = slab.hike;
    this.recalcHikeAmount();
  }

  onHikePercentageChange(): void {
    this.recalcHikeAmount();
  }

  onBasicSalaryChange(): void {
    this.recalcHikeAmount();
  }

  recalcHikeAmount(): void {
    this.salaryForm.HikeAmount = parseFloat(
      ((this.salaryForm.BasicSalary * this.salaryForm.HikePercentage) / 100).toFixed(2)
    );
  }

  // ─── Computed Total Salary ───────────────────────────────
  get computedTotal(): number {
    return (
      (this.salaryForm.BasicSalary  || 0) +
      (this.salaryForm.Allowances   || 0) +
      (this.salaryForm.Bonus        || 0) +
      (this.salaryForm.HikeAmount   || 0) -
      (this.salaryForm.Deductions   || 0)
    );
  }

  // ─── Open Add Modal ──────────────────────────────────────
  openAddSalary(employee: any): void {
    this.selectedEmployee = employee;
    this.isEditMode = false;
    const exp   = employee.Experience ?? 0;
    const slab  = this.getSlabForExperience(exp);
    const basic = employee.Salary ?? 0;

    this.salaryForm = {
      BasicSalary:     basic,
      ExperienceYears: exp,
      HikePercentage:  slab.hike,
      HikeAmount:      parseFloat(((basic * slab.hike) / 100).toFixed(2)),
      Bonus:           0,
      Allowances:      0,
      Deductions:      0,
      SalaryMonth:     new Date().toISOString().substring(0, 7) + '-01',
      PaymentDate:     '',
      PaymentStatus:   'Pending'
    };
    this.showSalaryModal = true;
  }

  // ─── Open Edit Modal ─────────────────────────────────────
  openEditSalary(salary: any): void {
    this.isEditMode = true;
    this.selectedEmployee = {
      EmployeeID: salary.EmployeeID,
      FullName:   salary.employeeName,
      SalaryID:   salary.SalaryID
    };
    this.salaryForm = {
      BasicSalary:     salary.BasicSalary    ?? 0,
      ExperienceYears: salary.experience     ?? 0,
      HikePercentage:  salary.hikePercentage ?? 0,
      HikeAmount:      salary.hikeAmount     ?? 0,
      Bonus:           salary.Bonus          ?? 0,
      Allowances:      salary.Allowances     ?? 0,
      Deductions:      salary.Deductions     ?? 0,
      SalaryMonth:     salary.SalaryMonth ? salary.SalaryMonth.substring(0, 10) : '',
      PaymentDate:     salary.PaymentDate ? salary.PaymentDate.substring(0, 10) : '',
      PaymentStatus:   salary.PaymentStatus  ?? 'Pending'
    };
    this.showSalaryModal = true;
  }

  closeSalaryModal(): void {
    this.showSalaryModal  = false;
    this.selectedEmployee = null;
  }

  clearErrors(): void {
    this.basicSalaryError = '';
    this.experienceError = '';
  }

  // ─── Save Salary ─────────────────────────────────────────
  saveSalary(): void {
    if (!this.selectedEmployee) return;

    this.clearErrors();
    let hasError = false;

    if (!this.salaryForm.BasicSalary || Number(this.salaryForm.BasicSalary) <= 0) {
      this.basicSalaryError = 'Basic salary must be greater than 0';
      hasError = true;
    }

    if (this.salaryForm.ExperienceYears === '' || this.salaryForm.ExperienceYears === null || this.salaryForm.ExperienceYears === undefined || Number(this.salaryForm.ExperienceYears) < 0) {
      this.experienceError = 'Experience must be 0 or greater';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fix the errors below.');
      return;
    }

    const payload = {
      EmployeeID:      this.selectedEmployee.EmployeeID,
      BasicSalary:     Number(this.salaryForm.BasicSalary) || 0,
      Allowances:      Number(this.salaryForm.Allowances) || 0,
      Bonus:           Number(this.salaryForm.Bonus) || 0,
      Deductions:      Number(this.salaryForm.Deductions) || 0,
      ExperienceYears: this.salaryForm.ExperienceYears === '' ? 0 : Number(this.salaryForm.ExperienceYears),
      HikePercentage:  Number(this.salaryForm.HikePercentage) || 0,
      HikeAmount:      Number(this.salaryForm.HikeAmount) || 0,
      SalaryMonth:     this.salaryForm.SalaryMonth || new Date().toISOString().substring(0, 10),
      PaymentDate:     this.salaryForm.PaymentDate || null,
      PaymentStatus:   this.salaryForm.PaymentStatus
    };

    const call = this.isEditMode
      ? this.salaryService.updateSalary(this.selectedEmployee.SalaryID, payload)
      : this.salaryService.addSalary(payload);

    call.subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res?.message || 'Salary saved successfully.');
        this.closeSalaryModal();
        this.loadSalaries();
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Failed to save salary. Please try again.');
      }
    });
  }

  // ─── Load Salaries ───────────────────────────────────────
  loadSalaries(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    if (this.isAdminRole()) {
      this.salaryService.getSalaries().subscribe({
        next: (res: any) => { this.salaries = res || []; },
        error: (err) => { console.log(err); this.salaries = []; }
      });
      return;
    }

    const loggedInEmployeeId = Number(
      loggedInUser.EmployeeID ?? loggedInUser.employeeID ?? loggedInUser.id ?? 0
    );

    if (loggedInEmployeeId) {
      this.salaryService.getSalariesByEmployeeId(loggedInEmployeeId).subscribe({
        next: (res: any) => {
          this.salaries = Array.isArray(res) ? res : [res].filter(Boolean);
        },
        error: (err) => { console.log(err); this.salaries = []; }
      });
      return;
    }

    this.salaryService.getSalaries().subscribe({
      next: (res: any) => {
        const loggedInEmail = (loggedInUser.Email || loggedInUser.email || '').toLowerCase();
        this.salaries = (res || []).filter((s: any) =>
          !!loggedInEmail && (s.email || '').toLowerCase() === loggedInEmail
        );
      },
      error: (err) => console.log(err)
    });
  }

  // ─── Helpers ─────────────────────────────────────────────
  getPaymentStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'paid':    return 'badge-paid';
      case 'pending': return 'badge-pending';
      case 'failed':  return 'badge-failed';
      default:        return 'badge-pending';
    }
  }

  formatCurrency(val: number): string {
    return '₹ ' + (val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}