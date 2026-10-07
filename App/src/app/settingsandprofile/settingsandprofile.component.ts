import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from '../services/teacher.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-settingsandprofile',
  templateUrl: './settingsandprofile.component.html',
  styleUrls: ['./settingsandprofile.component.css']
})
export class SettingsandprofileComponent implements OnInit {
  activeTab = 'profile';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  teacherCount = 0;
  staffCount = 0;
  studentCount = 0;
  employeeId: number | null = null;
  isEmployeeProfile = false;
  isSavingProfile = false;
  departments: any[] = [];
  roles: any[] = [];

  profile = {
    image: '',
    fullName: '',
    role: '',
    email: '',
    phone: '',
    school: '',
    address: '',
    bio: '',
    joined: '',
    employeeId: '',
    gender: '',
    dateOfBirth: '',
    departmentId: '',
    departmentName: '',
    roleId: '',
    employmentType: '',
    salary: '',
    experience: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyPhoneNumber: ''
  };

  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;
  notificationsForm!: FormGroup;

  preferences = {
    emailNotifications: true,
    smsAlerts: false,
    theme: 'light',
    fontFamily: 'Arial',
    fontSize: 'medium',
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

  constructor(
    private formBuilder: FormBuilder,
    private teacherService: TeacherService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadPreferences();
    this.initializeForms();

    this.employeeId = this.employeeService.getCurrentEmployeeId();
    if (this.employeeId !== null) {
      this.isEmployeeProfile = true;
      this.loadEmployeeProfile(this.employeeId);
      this.loadDepartmentsAndRoles();
    }
  }

  private initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: [''],
      dateOfBirth: [''],
      departmentId: [''],
      roleId: [''],
      joiningDate: [''],
      employmentType: [''],
      salary: [''],
      experience: [''],
      presentAddress: [''],
      permanentAddress: [''],
      emergencyContactName: [''],
      emergencyRelationship: [''],
      emergencyPhoneNumber: ['']
    });

    this.preferencesForm = this.formBuilder.group({
      emailNotifications: [this.preferences.emailNotifications],
      smsAlerts: [this.preferences.smsAlerts],
      theme: [this.preferences.theme],
      fontFamily: [this.preferences.fontFamily],
      fontSize: [this.preferences.fontSize],
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

  private loadEmployeeProfile(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (response: any) => {
        const employee = response?.employee ?? response?.data ?? response;
        if (!employee || typeof employee !== 'object') {
          this.setMessage('Employee profile details could not be loaded.', 'error');
          return;
        }

        this.profile = {
          ...this.profile,
          image: employee.EmployeePhoto ?? employee.employeePhoto ?? '',
          fullName: employee.FullName ?? employee.fullName ?? '',
          email: employee.Email ?? employee.email ?? '',
          phone: employee.MobileNumber ?? employee.mobileNumber ?? '',
          role: employee.RoleName ?? employee.roleName ?? '',
          school: employee.DepartmentName ?? employee.departmentName ?? '',
          joined: this.dateInputValue(employee.JoiningDate ?? employee.joiningDate),
          employeeId: String(employee.EmployeeID ?? employee.employeeId ?? employeeId),
          gender: employee.Gender ?? employee.gender ?? '',
          dateOfBirth: this.dateInputValue(employee.DateOfBirth ?? employee.dateOfBirth),
          departmentId: String(employee.DepartmentID ?? employee.departmentId ?? ''),
          departmentName: employee.DepartmentName ?? employee.departmentName ?? '',
          roleId: String(employee.RoleID ?? employee.roleId ?? ''),
          employmentType: employee.EmploymentType ?? employee.employmentType ?? '',
          salary: employee.Salary ?? employee.salary ?? '',
          experience: employee.Experience ?? employee.experience ?? '',
          address: employee.PresentAddress ?? employee.presentAddress ?? '',
          permanentAddress: employee.PermanentAddress ?? employee.permanentAddress ?? '',
          emergencyContactName: employee.EmergencyContactName ?? employee.emergencyContactName ?? '',
          emergencyRelationship: employee.EmergencyRelationship ?? employee.emergencyRelationship ?? '',
          emergencyPhoneNumber: employee.EmergencyPhoneNumber ?? employee.emergencyPhoneNumber ?? ''
        };

        this.profileForm.patchValue({
          fullName: this.profile.fullName,
          email: this.profile.email,
          phone: this.profile.phone,
          gender: this.profile.gender,
          dateOfBirth: this.profile.dateOfBirth,
          departmentId: this.profile.departmentId,
          roleId: this.profile.roleId,
          joiningDate: this.profile.joined,
          employmentType: this.profile.employmentType,
          salary: this.profile.salary,
          experience: this.profile.experience,
          presentAddress: this.profile.address,
          permanentAddress: this.profile.permanentAddress,
          emergencyContactName: this.profile.emergencyContactName,
          emergencyRelationship: this.profile.emergencyRelationship,
          emergencyPhoneNumber: this.profile.emergencyPhoneNumber
        });

        if (this.profile.departmentId) {
          this.loadRolesForDepartment(Number(this.profile.departmentId), this.profile.roleId);
        }
      },
      error: (error) => {
        console.error('Unable to load employee profile:', error);
        this.setMessage(error.error?.message || 'Employee profile details could not be loaded.', 'error');
      }
    });
  }

  private loadDepartmentsAndRoles(): void {
    this.employeeService.getDepartmentRoles().subscribe({
      next: (data: any) => {
        this.departments = Array.isArray(data?.departments) ? data.departments : [];
      },
      error: (error) => {
        console.error('Unable to load departments:', error);
        this.setMessage('Departments could not be loaded.', 'error');
      }
    });
  }

  onDepartmentChange(): void {
    const departmentId = Number(this.profileForm.get('departmentId')?.value);
    this.profileForm.patchValue({ roleId: '' });

    if (!departmentId) {
      this.roles = [];
      return;
    }

    this.loadRolesForDepartment(departmentId);
  }

  private loadRolesForDepartment(departmentId: number, selectedRoleId: any = ''): void {
    this.employeeService.getRolesByDepartment(departmentId).subscribe({
      next: (data: any) => {
        this.roles = Array.isArray(data) ? data : [];
        const matchingRole = this.roles.some(
          (role: any) => Number(role.RoleID ?? role.roleId) === Number(selectedRoleId)
        );
        this.profileForm.patchValue({ roleId: matchingRole ? selectedRoleId : '' });
      },
      error: (error) => {
        console.error('Unable to load roles for selected department:', error);
        this.roles = [];
        this.profileForm.patchValue({ roleId: '' });
        this.setMessage('Roles for the selected department could not be loaded.', 'error');
      }
    });
  }

  private loadPreferences(): void {
    const savedPreferences = localStorage.getItem('appPreferences');
    if (!savedPreferences) {
      this.applyPreferences();
      return;
    }

    try {
      const saved = JSON.parse(savedPreferences);
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        this.preferences = { ...this.preferences, ...saved };
      }
    } catch (error) {
      console.error('Unable to read saved preferences:', error);
    }

    this.applyPreferences();
  }

  private applyPreferences(): void {
    document.body.classList.toggle('app-dark-mode', this.preferences.theme === 'dark');
    this.preferences.fontFamily = 'Arial';
    document.documentElement.style.fontSize =
      this.preferences.fontSize === 'small' ? '14px' :
      this.preferences.fontSize === 'large' ? '18px' : '16px';
    document.documentElement.style.setProperty('--app-font-family', 'Arial');
  }

  private dateInputValue(value: any): string {
    return value ? String(value).substring(0, 10) : '';
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.message = '';
  }

 saveProfile(): void {
  if (this.profileForm.invalid) {
    this.profileForm.markAllAsTouched();
    this.setMessage('Please enter a valid name and email address before saving.', 'error');
    return;
  }

  if (this.employeeId === null) {
    this.setMessage('No signed-in employee profile is available to update.', 'error');
    return;
  }

  this.isSavingProfile = true;
  const formValue = this.profileForm.getRawValue();
  const employeeData = {
    EmployeePhoto: this.profile.image || null,
    FullName: formValue.fullName.trim(),
    Email: formValue.email.trim(),
    MobileNumber: formValue.phone,
    Gender: formValue.gender,
    DateOfBirth: formValue.dateOfBirth,
    DepartmentID: formValue.departmentId,
    RoleID: formValue.roleId,
    JoiningDate: formValue.joiningDate,
    EmploymentType: formValue.employmentType,
    Salary: formValue.salary,
    Experience: formValue.experience,
    PresentAddress: formValue.presentAddress,
    PermanentAddress: formValue.permanentAddress,
    EmergencyContactName: formValue.emergencyContactName,
    EmergencyRelationship: formValue.emergencyRelationship,
    EmergencyPhoneNumber: formValue.emergencyPhoneNumber
  };

  this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
    next: () => {
      this.isSavingProfile = false;
      const selectedDepartment = this.departments.find(
        (department: any) => Number(department.DepartmentID ?? department.departmentId) === Number(formValue.departmentId)
      );
      const selectedRole = this.roles.find(
        (role: any) => Number(role.RoleID ?? role.roleId) === Number(formValue.roleId)
      );

      this.profile = {
        ...this.profile,
        image: employeeData.EmployeePhoto || this.profile.image,
        fullName: employeeData.FullName,
        email: employeeData.Email,
        phone: employeeData.MobileNumber,
        role: selectedRole?.RoleName ?? selectedRole?.roleName ?? this.profile.role,
        school: selectedDepartment?.DepartmentName ?? selectedDepartment?.departmentName ?? this.profile.school,
        joined: employeeData.JoiningDate,
        departmentId: employeeData.DepartmentID,
        departmentName: selectedDepartment?.DepartmentName ?? selectedDepartment?.departmentName ?? '',
        roleId: employeeData.RoleID,
        gender: employeeData.Gender,
        dateOfBirth: employeeData.DateOfBirth,
        employmentType: employeeData.EmploymentType,
        salary: employeeData.Salary,
        experience: employeeData.Experience,
        address: employeeData.PresentAddress,
        permanentAddress: employeeData.PermanentAddress,
        emergencyContactName: employeeData.EmergencyContactName,
        emergencyRelationship: employeeData.EmergencyRelationship,
        emergencyPhoneNumber: employeeData.EmergencyPhoneNumber
      };

      const user = this.employeeService.getLoggedInUser() || {};
      const updatedUser = {
        ...user,
        EmployeeID: this.employeeId,
        FullName: employeeData.FullName,
        Email: employeeData.Email,
        EmployeePhoto: this.profile.image,
        RoleName: this.profile.role
      };
      this.employeeService.setLoggedInUser(updatedUser);
      window.dispatchEvent(new CustomEvent('employeeProfileUpdated', { detail: updatedUser }));
      this.setMessage('Profile information saved successfully.', 'success');
    },
    error: (error) => {
      this.isSavingProfile = false;
      console.error('Unable to save employee profile:', error);
      this.setMessage(error.error?.message || 'Profile information could not be saved.', 'error');
    }
  });
}
  savePreferences(): void {
    this.preferences = { ...this.preferences, ...this.preferencesForm.value };
    localStorage.setItem('appPreferences', JSON.stringify(this.preferences));
    this.applyPreferences();
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

 uploadAvatar(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  if (!file.type.startsWith('image/')) {
    this.setMessage('Choose a valid image file.', 'error');
    input.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    this.setMessage('Profile images must be 5 MB or smaller.', 'error');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      this.setMessage('The selected profile image could not be read.', 'error');
      return;
    }
    this.profile.image = reader.result;
    this.setMessage('Image selected. Save your profile to apply it.', 'success');
  };
  reader.onerror = () => this.setMessage('The selected profile image could not be read.', 'error');
  reader.readAsDataURL(file);
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
