
import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../services/calendar.service';
import { ToastService } from '../services/toast.service';
declare var bootstrap: any;

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent implements OnInit {
  constructor(
    private calendarService: CalendarService,
    private toastService: ToastService
  ) {}

  role: any = '';
  holidays: any[] = [];

  isEditMode = false;

  holidayForm = {
    id: 0,
    holiday: '',
    date: '',
    description: ''
  };

  holidayError = '';
  dateError = '';

  clearErrors(): void {
    this.holidayError = '';
    this.dateError = '';
  }

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.loadHolidays();
  }

  canManageHolidays(): boolean {
    const role = (this.role || '').trim().toLowerCase();
    return ['office', 'project manager', 'team lead', 'hr', 'manager', 'school', 'admin', 'superadmin'].includes(role);
  }

  loadHolidays(): void {
    this.calendarService.getHolidays().subscribe({
      next: (holidays) => {
        this.holidays = holidays.map((holiday: any) => ({
          ...holiday,
          holiday: holiday.title,
          date: this.formatDateInput(holiday.date)
        }));
        this.saveToLocalStorage();
      },
      error: () => {
        const savedHolidays = localStorage.getItem('holidays');
        this.holidays = savedHolidays
          ? JSON.parse(savedHolidays).map((holiday: any) => ({
            ...holiday,
            date: this.formatDateInput(holiday.date)
          }))
          : [];
        this.toastService.showError('Could not load holidays from the server');
      }
    });
  }

  private formatDateInput(date: string): string {
    if (!date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10);
  }

  private toApiHoliday(): any {
    return {
      title: this.holidayForm.holiday.trim(),
      date: this.holidayForm.date,
      description: this.holidayForm.description.trim()
    };
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('holidays', JSON.stringify(this.holidays));
  }

  openAddHoliday(): void {

    this.isEditMode = false;

    this.holidayForm = {
      id: 0,
      holiday: '',
      date: '',
      description: ''
    };

    const modalElement = document.getElementById('holidayModal');

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  editHoliday(holiday: any): void {

    this.isEditMode = true;

    this.holidayForm = {
      id: holiday.id,
      holiday: holiday.holiday,
      date: holiday.date,
      description: holiday.description || ''
    };

    const modalElement = document.getElementById('holidayModal');

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  saveHoliday(): void {
    this.clearErrors();
    let hasError = false;

    if (!this.holidayForm.holiday?.trim()) {
      this.holidayError = 'Holiday name is required';
      hasError = true;
    }
    if (!this.holidayForm.date) {
      this.dateError = 'Date is required';
      hasError = true;
    }
    if (hasError) {
      this.toastService.showError('Please fill all fields');
      return;
    }

    if (this.isEditMode) {
      this.calendarService.updateHoliday(this.holidayForm.id, this.toApiHoliday()).subscribe({
        next: () => {
          this.toastService.showSuccess('Holiday updated');
          this.loadHolidays();
          this.closeModal();
        },
        error: () => this.toastService.showError('Could not update holiday')
      });
    } else {
      this.calendarService.addHoliday(this.toApiHoliday()).subscribe({
        next: () => {
          this.toastService.showSuccess('Holiday added');
          this.loadHolidays();
          this.closeModal();
        },
        error: () => this.toastService.showError('Could not add holiday')
      });
    }
  }

  deleteHoliday(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this holiday?'
    );

    if (confirmDelete) {
      this.calendarService.deleteHoliday(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Holiday deleted');
          this.loadHolidays();
        },
        error: () => this.toastService.showError('Could not delete holiday')
      });
    }
  }

  closeModal(): void {

    const modalElement = document.getElementById('holidayModal');

    if (modalElement) {

      const modal =
        bootstrap.Modal.getInstance(modalElement);

      if (modal) {
        modal.hide();
      }
    }

    this.resetForm();
  }

  resetForm(): void {

    this.holidayForm = {
      id: 0,
      holiday: '',
      date: '',
      description: ''
    };

    this.isEditMode = false;
  }
}

