import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../services/leave.service';
import { ToastService } from '../services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {

  fullName = '';
  role = '';
  a: number = 0;
  currentUserName = '';
  activeTab = 'myLeaves';

  myLeaves: any[] = [];
  employeeLeaves: any[] = [];

  private normalizeRole(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }

  isAdminRole(): boolean {
    const role = this.normalizeRole(this.role);
    return ['superadmin', 'school', 'office', 'admin', 'hr'].includes(role);
  }

  leaveForm = {
    type: '',
    startDate: '',
    endDate: '',
    contactNumber: '',
    reason: ''
  };

  typeError = '';
  startDateError = '';
  endDateError = '';
  contactNumberError = '';
  reasonError = '';

  clearErrors(): void {
    this.typeError = '';
    this.startDateError = '';
    this.endDateError = '';
    this.contactNumberError = '';
    this.reasonError = '';
  }

  resetLeaveForm(): void {
    this.leaveForm = {
      type: '',
      startDate: '',
      endDate: '',
      contactNumber: '',
      reason: ''
    };
    this.clearErrors();
  }

  constructor(private leaveService: LeaveService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.role = this.normalizeRole(localStorage.getItem('role'));
    this.loadLeaves();
  }

  loadLeaves(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const employeeId = Number(loggedInUser.EmployeeID ?? loggedInUser.employeeID ?? loggedInUser.id ?? 0);
    const userName = loggedInUser.FullName || loggedInUser.fullName || loggedInUser.name || '';

    this.currentUserName = userName;

    if (this.isAdminRole()) {
      // Admin/HR - fetch both their own leaves and employee leaves
      this.leaveService.getLeavesByEmployeeId(employeeId).subscribe({
        next: (res: any) => {
          this.myLeaves = Array.isArray(res) ? res : [];
        },
        error: (err) => {
          console.log(err);
          this.myLeaves = [];
        }
      });

      this.leaveService.getEmployeeLeaves().subscribe({
        next: (res: any) => {
          this.employeeLeaves = Array.isArray(res) ? res : [];
        },
        error: (err) => {
          console.log(err);
          this.employeeLeaves = [];
        }
      });
    } else {
      // Employee - fetch only their own leaves
      this.leaveService.getLeavesByEmployeeId(employeeId).subscribe({
        next: (res: any) => {
          this.myLeaves = Array.isArray(res) ? res : [];
          this.employeeLeaves = [];
        },
        error: (err) => {
          console.log(err);
          this.employeeLeaves = [];
          this.myLeaves = [];
        }
      });
    }
  }

  submitLeave(): void {
    this.clearErrors();
    let hasError = false;

    if (!this.leaveForm.type) {
      this.typeError = 'Please select leave type';
      hasError = true;
    }
    if (!this.leaveForm.startDate) {
      this.startDateError = 'Please select start date';
      hasError = true;
    }
    if (!this.leaveForm.endDate) {
      this.endDateError = 'Please select end date';
      hasError = true;
    }
    if (!this.leaveForm.contactNumber?.trim()) {
      this.contactNumberError = 'Contact number is required';
      hasError = true;
    }
    if (!this.leaveForm.reason?.trim()) {
      this.reasonError = 'Reason is required';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fill all required fields');
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const employeeId = Number(loggedInUser.EmployeeID ?? loggedInUser.employeeID ?? loggedInUser.id ?? 0);

    const payload = {
      EmployeeID: employeeId,
      ApplicantName: loggedInUser.FullName || loggedInUser.fullName || loggedInUser.name || this.currentUserName,
      ApplicantRole: this.role,
      LeaveType: this.leaveForm.type,
      StartDate: this.leaveForm.startDate,
      EndDate: this.leaveForm.endDate,
      ContactNumber: this.leaveForm.contactNumber,
      Reason: this.leaveForm.reason,
      Status: 'Pending'
    };

    this.leaveService.addLeave(payload).subscribe({
      next: (res: any) => {
        this.resetLeaveForm();
        this.loadLeaves();
        this.toastService.showSuccess(res.message || 'Leave Applied Successfully');
        const modalEl = document.getElementById('leaveModal');
        if (modalEl) {
          const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
      },
      error: (err) => {
        console.log(err);
        this.toastService.showError(err.error?.message || 'Failed to apply leave');
      }
    });
  }

  approveLeave(id: number): void {
    this.leaveService.updateLeaveStatus(id, 'Approved').subscribe({
      next: () => this.loadLeaves(),
      error: (err) => console.log(err)
    });
  }

  rejectLeave(id: number): void {
    this.leaveService.updateLeaveStatus(id, 'Rejected').subscribe({
      next: () => this.loadLeaves(),
      error: (err) => console.log(err)
    });
  }
}
