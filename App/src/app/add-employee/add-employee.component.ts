import { Component } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { ManagerService } from '../services/managers.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
declare const bootstrap: any;
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {
  constructor(private employeeService: EmployeeService, private managerService: ManagerService, private route:ActivatedRoute,private router:Router) { }

 employees: any[] = [];
 existingManagers: any[] = [];
 managerRoles: string[] = [];
  totalMembers = 0;
  totalProjects = 0;
  successMessage = '';
  managerNameError = '';
  emailError = '';
  teamNameError = '';
  membersError = '';
  projectsError = '';
  errorMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;
  employeeImagePreview: string = '';
  roles: any[] = [];
  departments:any[]=[];
  isEditMode = false;
  isSelfRegistration = false;
  signupStep = 1;

  
  manager: {
    ManagerID: number;
    ManagerName: string;
    Email: string;
    TeamName: string;
    Members: number;
    Projects: number;
  } = {
    ManagerID: 0,
    ManagerName: '',
    Email: '',
    TeamName: '',
    Members: 0,
    Projects: 0
  };  
    fullNameError = '';
    mobileError = '';
    passwordError = '';
    confirmPasswordError = '';
    genderError = '';
    dobError = '';
    departmentError = '';
    roleError = '';
    joiningDateError = '';
    employmentTypeError = '';
    experienceError = '';
    presentAddressError = '';
    permanentAddressError = '';
    emergencyNameError = '';
    emergencyRelationError = '';
    emergencyPhoneError = '';
    photoError = '';
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => { this.toastVisible = false; }, 3500);
  }

  clearErrors(): void {

    this.fullNameError = '';
    this.emailError = '';
    this.mobileError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.genderError = '';
    this.dobError = '';
    this.departmentError = '';
    this.roleError = '';
    this.joiningDateError = '';
    this.employmentTypeError = '';
    this.experienceError = '';
    this.presentAddressError = '';
    this.permanentAddressError = '';
    this.emergencyNameError = '';
    this.emergencyRelationError = '';
    this.emergencyPhoneError = '';
    this.photoError = '';

  };

  employee = {
  EmployeeID: 0,
  EmployeePhoto: this.employeeImagePreview,
  FullName: '',
  Email: '',
  MobileNumber: '',
  Password: '',
  ConfirmPassword: '',
  Gender: '',
  DateOfBirth: '',
  DepartmentID: '',
  Designation: '',
  JoiningDate: '',
  EmploymentType: '',
  Salary: '0',
  Experience: '',
  PresentAddress: '',
  PermanentAddress: '',
  EmergencyContactName: '',
  EmergencyRelationship: '',
  EmergencyPhoneNumber: '',
  RoleID: '',
};


  ngOnInit(): void {
    this.isSelfRegistration = this.router.url === '/employee-signup';
    this.loadEmployees();
    this.loadExistingManagers();
    this.loadDepartmentAndRoles();
    this.loaddetails();
  }

  nextSignupStep(): void {
    this.clearErrors();
    let hasError = false;

    if (!this.employee.FullName?.trim()) {
      this.fullNameError = 'Full Name is required';
      hasError = true;
    }

    if (!this.employee.Email?.trim()) {
      this.emailError = 'Email is required';
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@desidea\.com$/i;
      if (!emailRegex.test(this.employee.Email)) {
        this.emailError = 'Employee email must use the @desidea.com domain';
        hasError = true;
      }
    }

    if (!this.employee.Password) {
      this.passwordError = 'Password is required';
      hasError = true;
    } else if (this.employee.Password.length < 8) {
      this.passwordError = 'Password must contain at least 8 characters';
      hasError = true;
    }

    if (!this.employee.ConfirmPassword) {
      this.confirmPasswordError = 'Confirm Password is required';
      hasError = true;
    } else if (this.employee.Password !== this.employee.ConfirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    if (!hasError) {
      this.signupStep = 2;
    }
  }

  previousSignupStep(): void {
    this.signupStep = 1;
  }
  //=======================================================================LOADDEPARTMENTANDROLES=========================================================//
  loadDepartmentAndRoles(): void {
    this.employeeService.getDepartmentRoles().subscribe({
      next: (data) => {
        this.departments = data.departments;
        this.roles = data.roles;
      },
      error: (err) => {
        console.error(err);
      }
    });
}

loadExistingManagers(): void {
  this.managerService.getManagers().subscribe({
    next: (data: any) => {
      this.existingManagers = Array.isArray(data) ? data : [];
    },
    error: (err) => {
      console.error('Error loading manager details:', err);
      this.existingManagers = [];
    }
  });
}

onDepartmentChange(): void {
  const departmentId = Number(this.employee.DepartmentID);
  console.log('Department selected:', departmentId);

  if (!departmentId) {
    this.roles = [];
    this.employee.RoleID = '';
    console.log('No department selected, clearing roles');
    return;
  }

  this.employeeService.getRolesByDepartment(departmentId).subscribe({
    next: (data: any) => {
      console.log('Roles fetched for department:', data);
      this.roles = data;
      const currentRoleId = Number(this.employee.RoleID);
      if (!this.roles.some((role: any) => Number(role.RoleID) === currentRoleId)) {
        this.employee.RoleID = '';
      }
    },
    error: (err) => {
      console.error('Error fetching roles:', err);
      this.roles = [];
      this.employee.RoleID = '';
      this.showToast('Error loading roles for this department. Please try again.', 'error');
    }
  });
}
//=============================================================UPDATEEMPLOYEE=======================================================//
updateEmployee(): void {
this.clearErrors();
  // Full Name
  if (!this.employee.FullName || this.employee.FullName.trim() === '') {
    this.fullNameError = 'Full Name is required';
    return;
  }

  // Email
  if (!this.employee.Email || this.employee.Email.trim() === '') {
    this.emailError = 'Email is required';
    return;
  }

  const emailRegex = /^[^\s@]+@desidea\.com$/i;

  if (!emailRegex.test(this.employee.Email)) {
    this.emailError = 'Employee email must use the @desidea.com domain';
    return;
  }

  // Mobile Number
  if (!this.employee.MobileNumber || this.employee.MobileNumber.trim() === '') {
    this.mobileError = 'Mobile Number is required';
    return;
  }

  const mobileRegex = /^\+?[0-9()\-\s]{7,20}$/;

  if (!mobileRegex.test(this.employee.MobileNumber)) {
    this.mobileError = 'Please enter a valid Mobile Number';
    return;
  }

  // Gender
  if (!this.employee.Gender) {
    this.genderError = 'Please select Gender';
    return;
  }

  // Date of Birth
  if (!this.employee.DateOfBirth) {
    this.dobError = 'Please select Date of Birth';
    return;
  }

  // Joining Date
  if (!this.employee.JoiningDate) {
    this.joiningDateError = 'Please select Joining Date';
    return;
  }

  // Department
  if (!this.employee.DepartmentID) {
    this.departmentError = 'Please select Department';
    return;
  }

  // Role
  if (!this.employee.RoleID) {
    this.roleError = 'Please select Role';
    return;
  }

  // Employment Type
  if (!this.employee.EmploymentType) {
    this.employmentTypeError = 'Please select Employment Type';
    return;
  }

  if (this.employee.Experience === '' || this.employee.Experience === null || this.employee.Experience === undefined) {
    this.experienceError = 'Experience is required';
    return;
  }

  if (Number(this.employee.Experience) < 0) {
    this.experienceError = 'Experience must be zero or greater';
    return;
  }

  // Present Address
  if (!this.employee.PresentAddress || this.employee.PresentAddress.trim() === '') {
    this.presentAddressError = 'Present Address is required';
    return;
  }

  // Permanent Address
  if (!this.employee.PermanentAddress || this.employee.PermanentAddress.trim() === '') {
    this.permanentAddressError = 'Permanent Address is required';
    return;
  }

  // Emergency Contact Name
  if (!this.employee.EmergencyContactName || this.employee.EmergencyContactName.trim() === '') {
    this.emergencyNameError = 'Emergency Contact Name is required';
    return;
  }

  // Emergency Relationship
  if (!this.employee.EmergencyRelationship || this.employee.EmergencyRelationship.trim() === '') {
    this.emergencyRelationError = 'Emergency Relationship is required';
    return;
  }

  // Emergency Phone Number
  if (!this.employee.EmergencyPhoneNumber || this.employee.EmergencyPhoneNumber.trim() === '') {
    this.emergencyPhoneError = 'Emergency Phone Number is required';
    return;
  }

  const emergencyRegex = /^\+?[0-9()\-\s]{7,20}$/;

  if (!emergencyRegex.test(this.employee.EmergencyPhoneNumber)) {
    this.emergencyPhoneError = 'Please enter a valid Emergency Phone Number';
    return;
  }

  // Employee Photo
  if (!this.employeeImagePreview) {
    this.photoError = 'Please upload Employee Photo';
    return;
  }

  const employeeData = {

    ...this.employee,

    EmployeePhoto: this.employeeImagePreview

  };

  this.employeeService.updateEmployee(

    this.employee.EmployeeID,

    employeeData

  ).subscribe({

    next: (res: any) => {

      this.showToast(res.message, 'success');

    },

    error: (err: any) => {

      console.log(err);

      this.showToast(err.error?.message || 'Something went wrong', 'error');

    }

  });

}
//=============================================READING IMAGE========================================================================//
onImageChange(event: any): void {

  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // Allow only image files
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    this.photoError = 'Please select a JPG, JPEG, PNG or WEBP image.';
    return;
  }

  // Maximum image size: 2 MB
  const maxSize = 2 * 1024 * 1024;

  if (file.size > maxSize) {
    this.photoError = 'Image size should be less than 2 MB.';
    return;
  }

  console.log('Image Name:', file.name);
  console.log('Image Type:', file.type);
  console.log('Image Size (Bytes):', file.size);
  console.log('Image Size (KB):', (file.size / 1024).toFixed(2));
  console.log('Image Size (MB):', (file.size / 1024 / 1024).toFixed(2));

  const reader = new FileReader();

  reader.onload = (e: any) => {

    this.employeeImagePreview = e.target.result;
    this.employee.EmployeePhoto = e.target.result;

    console.log('Base64 Length:', this.employeeImagePreview.length);

  };
  
  reader.onerror = () => {
    this.photoError = 'Failed to read image. Please try again.';
  };

  reader.readAsDataURL(file);

}
//============================================================LOADEMPLOYEES==========================================================//
  loadEmployees(): void {

    this.employeeService.getEmployees().subscribe({

      next: (data: any) => {

        this.employees = data;

      },

      error: (err) => {

        console.error(err);

      }

    });

  }
  //============================================================LOADEMPLOYEEDETAILS===================================================//
  loaddetails(){
    const id = this.route.snapshot.paramMap.get('id');

  this.isEditMode = !!id;

  if (this.isEditMode) {

    this.employeeService.getEmployeeById(+id!).subscribe({

      next: (data: any) => {

        const employeeData = data?.employee ?? data?.data ?? data;
        if (!employeeData || typeof employeeData !== 'object') {
          this.showToast('Employee details could not be loaded.', 'error');
          return;
        }

        const mobileValue = employeeData.MobileNumber ?? employeeData.mobileNumber ?? employeeData.Phone ?? employeeData.phone ?? '';
        const mobileContainsEmail = typeof mobileValue === 'string' && mobileValue.includes('@');

        this.employee = {

          EmployeeID: employeeData.EmployeeID ?? employeeData.employeeID ?? employeeData.id,
          EmployeePhoto: employeeData.EmployeePhoto ?? employeeData.employeePhoto ?? employeeData.image ?? '',

          FullName: employeeData.FullName ?? employeeData.fullName ?? employeeData.EmployeeName ?? employeeData.employeeName ?? employeeData.Name ?? '',
          Email: employeeData.Email ?? employeeData.email ?? employeeData.EmailAddress ?? employeeData.emailAddress ?? (mobileContainsEmail ? mobileValue : ''),
          MobileNumber: mobileContainsEmail ? '' : mobileValue,

          Password: employeeData.Password ?? employeeData.password ?? '',
          ConfirmPassword: employeeData.Password ?? employeeData.password ?? '',

          Gender: employeeData.Gender ?? employeeData.gender ?? '',

          DateOfBirth: employeeData.DateOfBirth ?? employeeData.dateOfBirth
            ? String(employeeData.DateOfBirth ?? employeeData.dateOfBirth).substring(0, 10)
            : '',

          DepartmentID: employeeData.DepartmentID ?? employeeData.departmentID ?? employeeData.departmentId ?? '',

          Designation: employeeData.Designation ?? employeeData.designation ?? '',

          JoiningDate: employeeData.JoiningDate ?? employeeData.joiningDate
            ? String(employeeData.JoiningDate ?? employeeData.joiningDate).substring(0, 10)
            : '',

          EmploymentType: employeeData.EmploymentType ?? employeeData.employmentType ?? '',

          Salary: employeeData.Salary ?? employeeData.salary ?? '0',

          Experience: employeeData.Experience ?? employeeData.experience ?? '',

          PresentAddress: employeeData.PresentAddress ?? employeeData.presentAddress ?? '',

          PermanentAddress: employeeData.PermanentAddress ?? employeeData.permanentAddress ?? '',

          EmergencyContactName: employeeData.EmergencyContactName ?? employeeData.emergencyContactName ?? '',

          EmergencyRelationship: employeeData.EmergencyRelationship ?? employeeData.emergencyRelationship ?? '',

          EmergencyPhoneNumber: employeeData.EmergencyPhoneNumber ?? employeeData.emergencyPhoneNumber ?? '',

          RoleID: employeeData.RoleID ?? employeeData.roleID ?? employeeData.roleId ?? ''

        };
        this.onDepartmentChange();

        this.employeeImagePreview = this.employee.EmployeePhoto;

      },

      error: (err) => {
        console.log(err);
        this.showToast(err.error?.message || 'Employee details could not be loaded.', 'error');
      }

    });

  }

}
//==================================================================REGISTEREMPLOYEE==================================================//

  registerEmployee(): void {

  // ---------------- Validation ----------------
  this.clearErrors();
  let hasError = false;

  if (!this.employee.FullName?.trim()) {
    this.fullNameError = 'Full Name is required';
    hasError = true;
  }

  if (!this.employee.Email?.trim()) {
    this.emailError = 'Email is required';
    hasError = true;
  } else {
    const emailRegex = /^[^\s@]+@desidea\.com$/i;
    if (!emailRegex.test(this.employee.Email)) {
      this.emailError = 'Employee email must use the @desidea.com domain';
      hasError = true;
    }
  }

  if (!this.employee.MobileNumber?.trim()) {
    this.mobileError = 'Mobile Number is required';
    hasError = true;
  } else {
    const mobileRegex = /^\+?[0-9()\-\s]{7,20}$/;
    if (!mobileRegex.test(this.employee.MobileNumber)) {
      this.mobileError = 'Please enter a valid Mobile Number';
      hasError = true;
    }
  }

  if (!this.employee.Password) {
    this.passwordError = 'Password is required';
    hasError = true;
  } else if (this.employee.Password.length < 8) {
    this.passwordError = 'Password must contain at least 8 characters';
    hasError = true;
  }

  if (!this.employee.ConfirmPassword) {
    this.confirmPasswordError = 'Confirm Password is required';
    hasError = true;
  } else if (this.employee.Password !== this.employee.ConfirmPassword) {
    this.confirmPasswordError = 'Passwords do not match';
    hasError = true;
  }

  if (!this.employee.Gender) {
    this.genderError = 'Please select Gender';
    hasError = true;
  }

  if (!this.employee.DateOfBirth) {
    this.dobError = 'Please select Date of Birth';
    hasError = true;
  }

  if (!this.employee.DepartmentID) {
    this.departmentError = 'Please select Department';
    hasError = true;
  }

  if (!this.employee.RoleID) {
    this.roleError = 'Please select Role';
    hasError = true;
  }

  if (!this.employee.JoiningDate) {
    this.joiningDateError = 'Please select Joining Date';
    hasError = true;
  }

  if (!this.employee.EmploymentType) {
    this.employmentTypeError = 'Please select Employment Type';
    hasError = true;
  }

  if (this.employee.Experience === '' || this.employee.Experience === null || this.employee.Experience === undefined) {
    this.experienceError = 'Experience is required';
    hasError = true;
  } else if (Number(this.employee.Experience) < 0) {
    this.experienceError = 'Experience must be zero or greater';
    hasError = true;
  }

  if (!this.employee.PresentAddress?.trim()) {
    this.presentAddressError = 'Present Address is required';
    hasError = true;
  }

  if (!this.employee.PermanentAddress?.trim()) {
    this.permanentAddressError = 'Permanent Address is required';
    hasError = true;
  }

  if (!this.employee.EmergencyContactName?.trim()) {
    this.emergencyNameError = 'Emergency Contact Name is required';
    hasError = true;
  }

  if (!this.employee.EmergencyRelationship?.trim()) {
    this.emergencyRelationError = 'Emergency Relationship is required';
    hasError = true;
  }

  if (!this.employee.EmergencyPhoneNumber?.trim()) {
    this.emergencyPhoneError = 'Emergency Phone Number is required';
    hasError = true;
  } else {
    const emergencyRegex = /^\+?[0-9()\-\s]{7,20}$/;
    if (!emergencyRegex.test(this.employee.EmergencyPhoneNumber)) {
      this.emergencyPhoneError = 'Please enter a valid Emergency Phone Number';
      hasError = true;
    }
  }

  if (hasError) return;

  // ---------------- Data ----------------

  const employeeData = {

    ...this.employee,

    EmployeePhoto: this.employeeImagePreview

  };

  // ---------------- Save Employee ----------------

  this.employeeService.addEmployee(employeeData).subscribe({

    next: (res: any) => {

      console.log("Response :", res);
      console.log("isManager Value :", res.isManager);

      // Check selected role to ensure Team Lead never gets the popup
      const selectedRole = this.roles.find(
        (r: any) => Number(r.RoleID) === Number(this.employee.RoleID)
      );
      const roleName = (selectedRole?.RoleName || selectedRole?.roleName || '').toLowerCase().trim();
      const isTeamLead = roleName.includes('team lead') || roleName.includes('lead') || roleName === 'teamlead';

      if (res.isManager === 1 && !isTeamLead) {

        console.log("Manager Role Detected");

        this.manager = {

          ManagerID: res.employee.EmployeeID,

          ManagerName: res.employee.FullName,

          Email: res.employee.Email,

          TeamName: res.employee.DepartmentName || (this.departments.find((d: any) => Number(d.DepartmentID) === Number(this.employee.DepartmentID))?.DepartmentName || ''),

          Members: 0,

          Projects: 0

        };

        const modalElement = document.getElementById("managerModal");

        console.log(modalElement);

        if (modalElement) {

          const modal = new bootstrap.Modal(modalElement);

          modal.show();

        } else {

          console.log("Manager Modal Not Found");

        }

        return;

      }

      this.successMessage = "Employee Added Successfully";

      setTimeout(() => {

        this.successMessage = "";

        this.router.navigate([this.isSelfRegistration ? '/' : '/home/employee']);

      }, 2000);

    },

    error: (err: any) => {

      console.log(err);

      this.showToast(err.error?.message || 'Something went wrong', 'error');

    }

  });

}
//=====================================================================EDITEMPLOYEE====================================================//
  editEmployee(emp: any): void {

    this.employee = { ...emp };

    this.employeeImagePreview = emp.image;

  }
//=====================================================================DELETEEMPLOYEE===================================================//
  deleteEmployee(id: number): void {

    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({

      next: (res: any) => {

        this.showToast(res.message, 'success');

        this.loadEmployees();

      },

      error: (err) => {

        console.error(err);

        this.showToast(err.error?.message || 'Something went wrong', 'error');

      }

    });

  }
//======================================================================RESEETFORM=======================================================//
  resetForm(): void {

    this.employeeImagePreview = '';

    this.employee = {

      EmployeeID: 0,
      EmployeePhoto: '',
      FullName: '',
      Email: '',
      MobileNumber: '',
      Password: '',
      ConfirmPassword: '',
      Gender: '',
      DateOfBirth: '',
      DepartmentID: '',
      Designation: '',
      JoiningDate: '',
      EmploymentType: '',
      Salary: '0',
      Experience: '',
      PresentAddress: '',
      PermanentAddress: '',
      EmergencyContactName: '',
      EmergencyRelationship: '',
      EmergencyPhoneNumber: '',
      RoleID: ''
    };

  }
  //=====================================================================REGISTERMANAGER====================================================//
  registerManager() {

      this.managerService.addManager(this.manager).subscribe({

    next: (res: any) => {

      this.successMessage = res.message;

      bootstrap.Modal.getInstance(
        document.getElementById('managerModal')
      )?.hide();

      setTimeout(() => {

        this.successMessage = '';

        this.router.navigate([this.isSelfRegistration ? '/' : '/home/managers']);

      }, 2000);

    },

    error: (err: any) => {

      console.log(err);

    }

  });

}
};


