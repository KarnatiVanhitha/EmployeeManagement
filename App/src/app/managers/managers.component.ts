import { Component } from '@angular/core';
import { ManagerService } from '../services/managers.service';
import { EmployeeService } from '../services/employee.service';
import { LeaveService } from '../services/leave.service';
import { SettingsandprofileComponent } from '../settingsandprofile/settingsandprofile.component';

declare const bootstrap: any;

@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.css']
})
export class ManagersComponent {
  role:any=''; 
  managers: any[] = [];
  employees: any[] = [];
  leaves: any[] = [];
  isEditMode = false;
  selectedManager: any = {};

  constructor(
    private managerService: ManagerService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService
  ) { }

  searchText = '';

  totalMembers = 0;
  totalProjects = 0;
  successMessage = '';
  managerNameError = '';
  emailError = '';
  teamNameError = '';
  membersError = '';
  projectsError = '';

  manager: any = {
    id: null,
    ManagerName: '',
    Email: '',
    TeamName: '',
    Members: 0,
    Projects: 0,
    image: 'assets/profile.png'
  };

  ngOnInit(): void {
    this.loadManagers();
    this.loadEmployees();
    this.loadLeaves();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        this.employees = Array.isArray(data) ? data : [];
      },
      error: (err: any) => {
        console.error('Error loading employees in ManagersComponent:', err);
      }
    });
  }

  loadLeaves(): void {
    this.leaveService.getLeaves().subscribe({
      next: (data: any) => {
        this.leaves = Array.isArray(data) ? data : [];
      },
      error: (err: any) => {
        console.error('Error loading leaves in ManagersComponent:', err);
      }
    });
  }

// ------------------------------------------------------------LoadManagers------------------------------------------------------------
loadManagers(): void {

  this.managerService.getManagers().subscribe({

    next: (data: any) => {

      console.log(data);

      this.managers = data;

      this.calculateSummary();

    },

    error: (err) => {

      console.error(err);

    }

  });

}
// ------------------------------------------------------------SaveManager &UpdateManager------------------------------------------------------------
saveManager(): void {

  // Clear previous errors
  this.managerNameError = '';
  this.emailError = '';
  this.teamNameError = '';
  this.membersError = '';
  this.projectsError = '';

  // Manager Name
  if (!this.manager.ManagerName?.trim()) {
    this.managerNameError = "Manager Name is required.";
  }

  // Email
  if (!this.manager.Email?.trim()) {

    this.emailError = "Email is required.";

  } else {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.manager.Email)) {

      this.emailError = "Please enter a valid Email Address.";

    }

  }

  // Team Name
  if (!this.manager.TeamName?.trim()) {

    this.teamNameError = "Team Name is required.";

  }

  // Members
  if (
    this.manager.Members === null ||
    this.manager.Members === '' ||
    this.manager.Members <= 0
  ) {

    this.membersError = "Members must be greater than 0.";

  }

  // Projects
  if (
    this.manager.Projects === null ||
    this.manager.Projects === '' ||
    this.manager.Projects <= 0
  ) {

    this.projectsError = "Projects must be greater than 0.";

  }

  // Stop if any validation failed
  if (
    this.managerNameError ||
    this.emailError ||
    this.teamNameError ||
    this.membersError ||
    this.projectsError
  ) {

    return;

  }

  // ------------------------------
  // Existing Save/Update Logic
  // ------------------------------

  if (this.isEditMode) {

    this.managerService.updateManager(
      this.manager.ManagerID,
      this.manager
    ).subscribe({

      next: (res: any) => {

        this.successMessage = res.message;

        setTimeout(() => {
          this.successMessage = '';
        }, 2000);

        this.loadManagers();

        this.resetForm();

        this.isEditMode = false;

        bootstrap.Modal.getInstance(
          document.getElementById("managerModal")
        )?.hide();

      },

      error: (err) => {

        console.log(err);

      }

    });

  } else {

    this.managerService.addManager(this.manager).subscribe({

      next: (res: any) => {

        this.successMessage = res.message;

        setTimeout(() => {
          this.successMessage = '';
        }, 2000);

        this.loadManagers();

        this.resetForm();

        bootstrap.Modal.getInstance(
          document.getElementById("managerModal")
        )?.hide();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

}
// ------------------------------------------------------------EditManager------------------------------------------------------------

 editManager(manager: any): void {

  this.manager = {

    ManagerID: manager.ManagerID,
    ManagerName: manager.ManagerName,
    Email: manager.Email,
    TeamName: manager.TeamName,
    Members: manager.Members,
    Projects: manager.Projects

  };

  this.isEditMode = true;

  const modal = new bootstrap.Modal(
    document.getElementById('managerModal')
  );

  modal.show();

}
// ------------------------------------------------------------DeleteManager------------------------------------------------------------
  deleteManager(id: number): void {

  if (!confirm("Delete this manager?")) {

    return;

  }

  this.managerService.deleteManager(id).subscribe({

    next: (res: any) => {
      
      this.successMessage = res.message;
      setTimeout(() => {  
            this.successMessage = '';

        }, 2000);
      this.loadManagers();

    },

    error: (err) => {

      console.log(err);

    }

  });

}
// ------------------------------------------------------------FilteredManagers------------------------------------------------------------

filteredManagers(): any[] {

  if (!this.searchText) {

    return this.managers;

  }

  return this.managers.filter((manager: any) =>

    manager.ManagerName?.toLowerCase().includes(this.searchText.toLowerCase()) ||

    manager.Email?.toLowerCase().includes(this.searchText.toLowerCase()) ||

    manager.TeamName?.toLowerCase().includes(this.searchText.toLowerCase())

  );

}
// ------------------------------------------------------------CalculateSummary------------------------------------------------------------
 calculateSummary(): void {

  this.totalMembers = 0;

  this.totalProjects = 0;

  this.managers.forEach((manager: any) => {

    this.totalMembers += Number(manager.Members);

    this.totalProjects += Number(manager.Projects);

  });

}
// ------------------------------------------------------------ResetForm------------------------------------------------------------
  resetForm(): void {

    this.manager = {

      id: null,

      ManagerName: '',

      Email: '',

      TeamName: '',

      Members: 0,

      Projects: 0,

      image: 'assets/profile.png'

    };

  }
  // ------------------------------------------------------------Get Team Leads for Manager------------------------------------------------------------
  getTeamLeadsForManager(manager: any): any[] {
    if (!manager || !this.employees || this.employees.length === 0) {
      return [];
    }

    const managerDeptName = (manager.TeamName || manager.DepartmentName || '').toLowerCase().trim();
    const managerDeptId = Number(manager.DepartmentID || manager.departmentId);

    return this.employees.filter((emp: any) => {
      const empDeptName = (emp.DepartmentName || emp.departmentName || '').toLowerCase().trim();
      const empDeptId = Number(emp.DepartmentID || emp.departmentId);
      const role = (emp.RoleName || emp.roleName || emp.Role || emp.role || emp.Designation || '').toLowerCase().trim();

      const isTL = role === 'team lead' || role === 'teamlead' || role.includes('team lead') || role.includes('lead');
      const sameDept = (managerDeptId && empDeptId && managerDeptId === empDeptId) ||
                       (managerDeptName && empDeptName && managerDeptName === empDeptName);

      return isTL && sameDept;
    });
  }

  // ------------------------------------------------------------Get Upcoming Leaves for Manager Team------------------------------------------------------------
  getUpcomingLeavesForManager(manager: any): any[] {
    if (!manager || !this.leaves || this.leaves.length === 0) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const managerDeptName = (manager.TeamName || manager.DepartmentName || '').toLowerCase().trim();
    const managerDeptId = Number(manager.DepartmentID || manager.departmentId);

    // Collect employee IDs in manager's department
    const deptEmpIds = new Set(
      this.employees
        .filter((emp: any) => {
          const empDeptName = (emp.DepartmentName || emp.departmentName || '').toLowerCase().trim();
          const empDeptId = Number(emp.DepartmentID || emp.departmentId);
          return (managerDeptId && empDeptId && managerDeptId === empDeptId) ||
                 (managerDeptName && empDeptName && managerDeptName === empDeptName);
        })
        .map((emp: any) => String(emp.EmployeeID || emp.employeeId || emp.id))
    );

    return this.leaves.filter((leave: any) => {
      const startValue = leave.StartDate ?? leave.startDate;
      if (!startValue) return false;
      const start = new Date(startValue);
      const status = (leave.Status ?? leave.status ?? '').toLowerCase();
      const empId = String(leave.EmployeeID ?? leave.employeeId ?? '');

      const isDeptLeave = deptEmpIds.size > 0 ? deptEmpIds.has(empId) : true;
      return start >= today && status === 'approved' && isDeptLeave;
    }).slice(0, 5);
  }

  // ------------------------------------------------------------ViewManager------------------------------------------------------------
  viewManager(manager: any): void {
    const teamLeads = this.getTeamLeadsForManager(manager);
    const upcomingLeaves = this.getUpcomingLeavesForManager(manager);

    this.selectedManager = {
      ...manager,
      teamLeads,
      upcomingLeaves
    };

    const modalElement = document.getElementById('viewManagerModal');

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

}
