import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../services/calendar.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  role: string = '';
  searchText: string = '';
  showMeetingModal = false;
  isEditingMeeting = false;
  showHolidayModal = false;
  currentDate: Date = new Date();
  currentMonth!: number;
  currentYear!: number;
  calendar: any[][] = [];

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  meetings: any[] = [];
  meeting = {
    id: 0,
    title: '',
    type: '',
    date: '',
    time: '',
    organizer: '',
    location: '',
    description: ''
  };

  holidays: any[] = [];
  holiday = {
    id: 0,
    title: '',
    date: '',
    description: ''
  };

  meetingTitleError = '';
  meetingDateError = '';
  meetingTimeError = '';
  holidayTitleError = '';
  holidayDateError = '';

  clearMeetingErrors(): void {
    this.meetingTitleError = '';
    this.meetingDateError = '';
    this.meetingTimeError = '';
  }

  clearHolidayErrors(): void {
    this.holidayTitleError = '';
    this.holidayDateError = '';
  }

  constructor(private calendarService: CalendarService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') || '';
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.loadMeetings();
    this.loadHolidays();
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendar = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const startDay = firstDay.getDay();
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > totalDays) {
          week.push({ day: '', date: '' });
        } else {
          const fullDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          week.push({ day: day, date: fullDate });
          day++;
        }
      }
      this.calendar.push(week);
    }
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  canAdd(): boolean {
    const roleStr = (this.role || '').trim().toLowerCase();
    return ['office', 'project manager', 'team lead', 'hr', 'manager', 'school', 'admin', 'superadmin'].includes(roleStr);
  }

  loadMeetings(): void {
    this.calendarService.getMeetings().subscribe({
      next: (data) => {
        this.meetings = data;
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
        this.meetings = [];
      }
    });
  }

  getMeetingStatus(meeting: any): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);

    if (meetingDate.getTime() > today.getTime()) {
      return 'Upcoming';
    }
    if (meetingDate.getTime() < today.getTime()) {
      return 'Completed';
    }
    return 'In Progress';
  }

  getMeetingStatusClass(meeting: any): string {
    const status = this.getMeetingStatus(meeting);
    if (status === 'Upcoming') return 'upcoming-meeting';
    if (status === 'Completed') return 'completed-meeting';
    return 'progress-meeting';
  }

  loadHolidays(): void {
    this.calendarService.getHolidays().subscribe({
      next: (data) => {
        this.holidays = data;
      },
      error: (err) => {
        console.error('Error loading holidays:', err);
        this.holidays = [];
      }
    });
  }

  refreshCalendar(): void {
    this.loadMeetings();
    this.loadHolidays();
    this.generateCalendar();
  }

  addMeeting(): void {
    this.clearMeetingErrors();
    let hasError = false;

    if (!this.meeting.title?.trim()) {
      this.meetingTitleError = 'Meeting title is required';
      hasError = true;
    }
    if (!this.meeting.date) {
      this.meetingDateError = 'Meeting date is required';
      hasError = true;
    }
    if (!this.meeting.time) {
      this.meetingTimeError = 'Meeting time is required';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fill all required fields.');
      return;
    }

    this.calendarService.addMeeting(this.meeting).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || 'Meeting Added Successfully');
        this.showMeetingModal = false;
        this.meeting = {
          id: 0, title: '', type: '', date: '', time: '', organizer: '', location: '', description: ''
        };
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error adding meeting:', err);
        this.toastService.showError('Failed to add meeting');
      }
    });
  }

  editMeeting(meeting: any): void {
    const formatDateStr = (dateVal: any) => {
      if (!dateVal) return '';
      return dateVal.split('T')[0];
    };
    this.meeting = { ...meeting, date: formatDateStr(meeting.date) };
    this.isEditingMeeting = true;
    this.showMeetingModal = true;
  }

  updateMeeting(): void {
    this.calendarService.updateMeeting(this.meeting.id, this.meeting).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || 'Meeting Updated Successfully');
        this.showMeetingModal = false;
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error updating meeting:', err);
        this.toastService.showError('Failed to update meeting');
      }
    });
  }

  deleteMeeting(id: number): void {
    if (!confirm('Delete this meeting?')) return;

    this.calendarService.deleteMeeting(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Meeting Deleted Successfully');
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error deleting meeting:', err);
        this.toastService.showError('Failed to delete meeting');
      }
    });
  }

  addHoliday(): void {
    this.clearHolidayErrors();
    let hasError = false;

    if (!this.holiday.title?.trim()) {
      this.holidayTitleError = 'Holiday name is required';
      hasError = true;
    }
    if (!this.holiday.date) {
      this.holidayDateError = 'Holiday date is required';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please enter Holiday Name and Date.');
      return;
    }

    this.calendarService.addHoliday(this.holiday).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || 'Holiday Added Successfully');
        this.showHolidayModal = false;
        this.holiday = { id: 0, title: '', date: '', description: '' };
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error adding holiday:', err);
        this.toastService.showError('Failed to add holiday');
      }
    });
  }

  editHoliday(holiday: any): void {
    const formatDateStr = (dateVal: any) => {
      if (!dateVal) return '';
      return dateVal.split('T')[0];
    };
    this.holiday = { ...holiday, date: formatDateStr(holiday.date) };
    this.showHolidayModal = true;
  }

  updateHoliday(): void {
    this.calendarService.updateHoliday(this.holiday.id, this.holiday).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || 'Holiday Updated Successfully');
        this.showHolidayModal = false;
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error updating holiday:', err);
        this.toastService.showError('Failed to update holiday');
      }
    });
  }

  deleteHoliday(id: number): void {
    if (!confirm('Delete this holiday?')) return;

    this.calendarService.deleteHoliday(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Holiday Deleted Successfully');
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error deleting holiday:', err);
        this.toastService.showError('Failed to delete holiday');
      }
    });
  }

  getMeetings(date: string): any[] {
    if (!date) return [];
    return this.meetings.filter((meeting: any) => {
      if (!meeting.date) return false;
      return meeting.date.split('T')[0] === date;
    });
  }

  getHoliday(date: string): any[] {
    if (!date) return [];
    return this.holidays.filter((holiday: any) => {
      if (!holiday.date) return false;
      return holiday.date.split('T')[0] === date;
    });
  }

  searchMeetings(): any[] {
    if (!this.searchText) return this.meetings;
    return this.meetings.filter((meeting: any) =>
      meeting.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      meeting.organizer?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      meeting.location?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      meeting.type?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  isToday(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return date === todayString;
  }

  getMeetingClass(type: string): string {
    switch (type) {
      case 'Office Meeting': return 'meeting-office';
      case 'Client Meeting': return 'meeting-client';
      case 'Interview': return 'meeting-interview';
      case 'Follow Up': return 'meeting-followup';
      default: return 'meeting-default';
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  clearSearch(): void {
    this.searchText = '';
  }

  totalMeetings(): number {
    return this.meetings.length;
  }

  totalHolidays(): number {
    return this.holidays.length;
  }

  openMeetingModal(): void {
    this.isEditingMeeting = false;
    this.meeting = {
      id: 0, title: '', type: '', date: '', time: '', organizer: '', location: '', description: ''
    };
    this.showMeetingModal = true;
  }

  closeMeetingModal(): void {
    this.showMeetingModal = false;
    this.isEditingMeeting = false;
  }

  saveMeeting(): void {
    if (this.isEditingMeeting) {
      this.updateMeeting();
    } else {
      this.addMeeting();
    }
  }
}