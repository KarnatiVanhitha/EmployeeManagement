import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from '../services/teacher.service';

@Component({
  selector: 'app-settingsandprofile',
  templateUrl: './settingsandprofile.component.html',
  styleUrls: ['./settingsandprofile.component.css']
})
export class SettingsandprofileComponent implements OnInit {
  activeTab = 'profile';
  message = '';
  messageType: 'success' | 'error' = 'success';
  teacherCount = 0;
  staffCount = 0;
  studentCount = 0;

  profile = {
    image: '',
    fullName: 'Admin User',
    role: 'Administrator',
    email: 'admin@schoolapp.com',
    phone: '+1 (555) 123-4567',
    school: 'Sunrise Academy',
    address: '123 School Street, Cityville',
    bio: 'Responsible for managing school operations, staff, students, and system settings.',
    joined: '2022-08-14'
  };

  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;
  notificationsForm!: FormGroup;

  preferences = {
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false,
    profileVisibleToStaff: true,
    weeklySummary: 'weekly'
  };

  notifications = {
    messageAlerts: true,
    eventUpdates: true,
    newsletter: false,
    reminderTime: '08:00'
  };

  sessions = [
    { device: 'Chrome on Windows', location: 'Cityville', lastActive: '2 minutes ago' },
    { device: 'Mobile Safari', location: 'Home', lastActive: '1 hour ago' },
    { device: 'Edge on Laptop', location: 'School Office', lastActive: 'Yesterday' }
  ];

  activity = [
    { time: 'Today', event: 'Updated school calendar settings.' },
    { time: 'Yesterday', event: 'Changed profile photo and display name.' },
    { time: '2 days ago', event: 'Enabled daily email reminders for teachers.' }
  ];

  constructor(private formBuilder: FormBuilder, private teacherService: TeacherService) {}

  ngOnInit(): void {
  this.loadCounts();

  const savedProfile = localStorage.getItem('profile');

  if (savedProfile) {
    this.profile = JSON.parse(savedProfile);
  }

  this.profileForm = this.formBuilder.group({
    fullName: [this.profile.fullName, [Validators.required, Validators.minLength(3)]],
    role: [this.profile.role, Validators.required],
    email: [this.profile.email, [Validators.required, Validators.email]],
    phone: [this.profile.phone, [Validators.required, Validators.pattern(/^[0-9+()\s-]+$/)]],
    school: [this.profile.school, Validators.required],
    address: [this.profile.address, Validators.required],
    bio: [this.profile.bio, Validators.maxLength(250)]
  });

  this.preferencesForm = this.formBuilder.group({
    emailNotifications: [this.preferences.emailNotifications],
    smsAlerts: [this.preferences.smsAlerts],
    darkMode: [this.preferences.darkMode],
    profileVisibleToStaff: [this.preferences.profileVisibleToStaff],
    weeklySummary: [this.preferences.weeklySummary]
  });

  this.securityForm = this.formBuilder.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    twoFactorAuth: [true]
  });

  this.notificationsForm = this.formBuilder.group({
    messageAlerts: [this.notifications.messageAlerts],
    eventUpdates: [this.notifications.eventUpdates],
    newsletter: [this.notifications.newsletter],
    reminderTime: [this.notifications.reminderTime]
  });
}
  selectTab(tab: string): void {
    this.activeTab = tab;
    this.message = '';
  }

 saveProfile(): void {
  if (this.profileForm.invalid) {
    this.setMessage(
      'Please fix validation errors before saving profile.',
      'error'
    );
    return;
  }

  this.profile = {
    ...this.profile,
    ...this.profileForm.value
  };

  localStorage.setItem(
    'profile',
    JSON.stringify(this.profile)
  );

  this.setMessage(
    'Profile information saved successfully.',
    'success'
  );
}
  savePreferences(): void {
    this.preferences = { ...this.preferences, ...this.preferencesForm.value };
    this.setMessage('Preferences updated successfully.', 'success');
  }

  updateSecurity(): void {
    const { currentPassword, newPassword, confirmPassword } = this.securityForm.value;

    if (this.securityForm.invalid) {
      this.setMessage('Please complete all security fields and follow password rules.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.setMessage('Password confirmation does not match.', 'error');
      return;
    }

    this.securityForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    this.setMessage('Password and security settings updated.', 'success');
  }

  saveNotifications(): void {
    this.notifications = { ...this.notifications, ...this.notificationsForm.value };
    this.setMessage('Notification preferences saved successfully.', 'success');
  }

 uploadAvatar(event: any): void {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.profile.image = e.target.result;

      localStorage.setItem(
        'profile',
        JSON.stringify(this.profile)
      );
    };

    reader.readAsDataURL(file);
  }
}

  private loadCounts(): void {
    const teachers = this.teacherService.getTeachers();
    this.teacherCount = Array.isArray(teachers) ? teachers.length : 0;

    const staff = JSON.parse(localStorage.getItem('staffList') || '[]');
    this.staffCount = Array.isArray(staff) ? staff.length : 0;

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    this.studentCount = Array.isArray(students) ? students.length : 0;
  }

  private setMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;
  }
  
}
