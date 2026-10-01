import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admins.service';
import { EmployeeService } from '../services/employee.service';
import { LeaveService } from '../services/leave.service';
import { ManagerService } from '../services/managers.service';
import { CalendarService } from '../services/calendar.service';
import { ProjectsService } from '../services/projects.service';
import { TaskService } from '../services/task.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // =========================================================
  // USER INFORMATION
  // =========================================================

  role: any = '';

  employee: any[] = [];

  currentUser: any = null;

  currentUserName = '';

  currentUserEmployeeId: any = null;

  // Authoritative employee record for the logged-in user, resolved
  // from EmployeeService (not just whatever localStorage says).
  currentEmployee: any = null;

  teamProgress: number = 0;
completedTraining: number = 0;

totalTasks: number = 0;
completedTasks: number = 0;
pendingTasks: number = 0;

totalProjects: number = 0;
completedProjects: number = 0;
pendingProjects: number = 0;

myLeaveCount: number = 0;
availableLeaveCount: number = 0;

managerName: string = 'Not Assigned';
managerRole: string = 'Not Assigned';
managerAbsent: boolean = false;

myProjects: any[] = [];
myTasks: any[] = [];

roleEmployees: any[] = [];

  // =========================================================
  // MANAGER INFORMATION
  // =========================================================

  managerInfo: any = {
    name: 'Not Assigned',
    role: 'Not Assigned',
    isAbsent: false
  };

  // =========================================================
  // LEAVE INFORMATION
  // =========================================================

  leaveBalances: any[] = [];

  myAppliedLeaves: any[] = [];

  leaveRequests: any[] = [];

  monthlyLeaves: any[] = [];

  leaveStats = {
    pending: 0,
    approved: 0,
    declined: 0
  };

  leaveFormVisible = false;

  leaveForm = {
    type: '',
    startDate: '',
    endDate: '',
    contactNumber: '',
    reason: ''
  };

  // =========================================================
  // PROJECT INFORMATION
  // =========================================================

  userProjects: any[] = [];

  // =========================================================
  // TASK INFORMATION

  userTasks: any[] = [];

  taskCompletionPercentage = 0;

  // =========================================================

  employeesByRole: any[] = [];

    teamLeads: any[] = [];

  totalEmployees = 0;

  // =========================================================
  // ADMIN

  admins: any[] = [];

  schoolAdminCount = 0;

    officeAdminCount = 0;

  officeDashboardLoading = false;

  officeDashboardError = '';

    officeDashboardDepartments: any[] = [];

  officeDashboardManagers: any[] = [];

  officeDashboardPendingLeaves: any[] = [];

  officeDashboardRecentLeaves: any[] = [];

  officeDashboardUpcomingLeaves: any[] = [];

  officeDashboardEvents: any[] = [];

  officeDashboardOnLeaveToday = 0;

  updatingOfficeLeaveId: number | null = null;

  searchText = '';

  expandedAdminId: number | null = null;

  // =========================================================
  // CALENDAR
  // =========================================================

  currentDate = new Date();

  currentMonth = '';

  currentYear = 0;

  calendarDays: (number | null)[] = [];

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  // =========================================================
  // EVENTS
  // =========================================================

  showEventModal = false;

  events: any[] = [];

  calendarEvents: any[] = [];

  newEvent = {
    title: '',
    date: '',
    startTime: '',
    endTime: ''
  };

  editIndex: number | null = null;

  // =========================================================
  // STUDENT INFORMATION
  // =========================================================

  studentss: any[] = [];

  selectedStudent: any = null;

  readonly EXAMS: string[] = [
    'Unit Test 1',
    'Quarterly',
    'Half Yearly',
    'Annual'
  ];

  selectedExam = this.EXAMS[0];

  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  topCards = [
    {
      title: 'Employees',
      value: '0',
      bgColor: '#20c997',
      borderColor: '#20c997'
    },
    {
      title: 'Leaves',
      value: '0',
      bgColor: '#fd7e14',
      borderColor: '#fd7e14'
    },
  ];

  statsCards = [
    {
      title: 'Total Applications',
      count: '0',
      color: '#e83e8c'
    },
    {
      title: 'Total Shortlisted',
      count: '0',
      color: '#28a745'
    },
    {
      title: 'Total Rejected',
      count: '0',
      color: '#dc3545'
    }
  ];

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  employeeDepartments: any[] = [];

  departments: any[] = [];

  // Department overview for dashboard widget (manager, team leads, upcoming leaves per dept)
  departmentOverview: any[] = [];

  employeeStructure = [
    {
      title: 'Male',
      percentage: 0,
      color: '#f0b17a'
    },
    {
      title: 'Female',
      percentage: 0,
      color: '#e68aed'
    }
  ];

  // =========================================================
  // APPLICATIONS
  // =========================================================

  applications = [
    {
      name: 'Total',
      count: 0,
      percent: 100,
      color: '#9795f1'
    },
    {
      name: 'Selected',
      count: 0,
      percent: 0,
      color: '#87f3a0'
    },
    {
      name: 'Shortlisted',
      count: 0,
      percent: 0,
      color: '#f1c40f'
    },
    {
      name: 'Rejected',
      count: 0,
      percent: 0,
      color: '#f37b63'
    }
  ];


  // =========================================================
  // FEE CHART
  // =========================================================

  feeChart = [
    {
      label: 'Q1-2023',
      collected: 35
    },
    {
      label: 'Q2-2023',
      collected: 45
    },
    {
      label: 'Q3-2023',
      collected: 42
    },
    {
      label: 'Q4-2023',
      collected: 40
    },
    {
      label: 'Q1-2024',
      collected: 32
    },
    {
      label: 'Q2-2024',
      collected: 41
    }
  ];

  // =========================================================
  // QUICK CARDS
  // =========================================================

  quickCards = [
    {
      title: 'View Attendances',
      icon: 'bi-card-checklist',
      class: 'attendance-bg'
    },
    {
      title: 'New Events',
      icon: 'bi-stars',
      class: 'events-bg'
    },
    {
      title: 'Membership Plans',
      icon: 'bi-credit-card',
      class: 'plans-bg'
    },
    {
      title: 'Finance & Accounts',
      icon: 'bi-bank',
      class: 'finance-bg'
    }
  ];

  // =========================================================
  // FINANCE CARDS
  // =========================================================

  financeCards = [
    {
      title: 'Total Fees Collected',
      amount: '₹25,000',
      change: '+ 1.2%',
      badgeClass: 'bg-success-subtle text-success'
    },
    {
      title: 'Fine Collected till date',
      amount: '₹4,566',
      change: '- 1.1%',
      badgeClass: 'bg-danger-subtle text-danger'
    },
    {
      title: 'Students Not Paid',
      amount: '₹545',
      change: '+ 1.2%',
      badgeClass: 'bg-primary-subtle text-primary'
    },
    {
      title: 'Total Outstanding',
      amount: '₹4,566',
      change: '- 1.1%',
      badgeClass: 'bg-danger-subtle text-danger'
    }
  ];

  // =========================================================
  // TEACHER INFORMATION
  // =========================================================

  teacherInfo = {
    name: 'John Smith',
    message: 'Manage classes and student performance.'
  };

  stats = [
    {
      title: 'Classes Assigned',
      value: 12
    },
    {
      title: 'Students',
      value: 240
    },
    {
      title: 'Attendance',
      value: '96%'
    },
    {
      title: 'Assignments',
      value: 15
    }
  ];

  schedules = [
    {
      subject: 'Mathematics - Grade 10',
      time: '09:00 AM'
    },
    {
      subject: 'Physics - Grade 11',
      time: '11:00 AM'
    },
    {
      subject: 'Chemistry - Grade 12',
      time: '02:00 PM'
    }
  ];

  performances = [
    {
      class: 'Grade 10',
      percentage: 88
    },
    {
      class: 'Grade 11',
      percentage: 92
    },
    {
      class: 'Grade 12',
      percentage: 80
    }
  ];

  announcements = [
    'Parent-Teacher Meeting on 15th July',
    'Examination timetable has been published for 11th Grade',
    'Assignment submission deadline this Friday for 10th Grade'
  ];

  recentActivities = [
    { name: 'John Carter', action: 'Added New Project HRMS Dashboard', time: '06:20 PM' },
    { name: 'Sophia White', action: 'Commented on Uploaded Document', time: '04:00 PM' },
    { name: 'Michael Johnson', action: 'Approved Task Projects', time: '02:30 PM' },
    { name: 'Emily Clark', action: 'Requesting Access to Module Tickets', time: '12:10 PM' },
    { name: 'David Anderson', action: 'Downloaded App Reports', time: '10:40 AM' },
    { name: 'Olivia Haris', action: 'Completed ticket module in HRMS', time: '09:50 AM' }
  ];

  todayActivities = [
    { message: "Daniel Martinz's Birthday", image: 'assets/user1.jpg', icon: 'bi bi-gift', iconBg: '#ede7f6', iconColor: '#5e35b1' },
    { message: "Amelia Curr's Birthday", image: 'assets/user2.jpg', icon: 'bi bi-gift', iconBg: '#ede7f6', iconColor: '#5e35b1' },
    { message: "Emma Lewis's Birthday", image: 'assets/user3.jpg', icon: 'bi bi-gift', iconBg: '#ede7f6', iconColor: '#5e35b1' },
    { message: 'Madison Andrew is off sick today', image: 'assets/user1.jpg', icon: 'bi bi-calendar-x', iconBg: '#fff3e0', iconColor: '#fb8c00' },
    { message: 'Victoria Celestie is off sick today', image: 'assets/user2.jpg', icon: 'bi bi-calendar-x', iconBg: '#fff3e0', iconColor: '#fb8c00' },
    { message: 'Daniel Patrick is off sick today', image: 'assets/user3.jpg', icon: 'bi bi-calendar-x', iconBg: '#fff3e0', iconColor: '#fb8c00' },
    { message: 'Jessica Renee is off sick today', image: 'assets/user1.jpg', icon: 'bi bi-calendar-x', iconBg: '#fff3e0', iconColor: '#fb8c00' }
  ];

  
  // =========================================================
  // UPCOMING LEAVES & DEPARTMENT TEAM MEMBERS
  // =========================================================

  upcomingLeaves: any[] = [];
  departmentTeamMembers: any[] = [];



  
  // =========================================================
  // TODAY EVENTS
  // =========================================================

  todayEvents = [
    {
      text: "Daniel Martinz's Birthday",
      image: 'assets/user1.jpg'
    },
    {
      text: "Amelia Curr's Birthday",
      image: 'assets/user2.jpg'
    },
    {
      text: "Emma Lewis's Birthday",
      image: 'assets/user3.jpg'
    }
  ];

 // =========================================================
// ROLE DASHBOARD CONFIGURATION
// =========================================================

roleDashboardConfig: any = {

  // -------------------------------------------------------
  // SUPER ADMIN
  // -------------------------------------------------------

  'Super Admin': {
    sections: [
      'overview',
      'employees',
      'roles',
      'leaves',
      'managers',
      'projects',
      'tasks',
      'team',
      'admins',
      'departments',
      'settings'
    ]
  },

  // -------------------------------------------------------
  // ADMINISTRATOR
  // -------------------------------------------------------

  Administrator: {
    sections: [
      'overview',
      'employees',
      'roles',
      'leaves',
      'managers',
      'projects',
      'tasks',
      'team'
    ]
  },

  // -------------------------------------------------------
  // HR MANAGER
  // -------------------------------------------------------

  'HR Manager': {
    sections: [
      'overview',
      'employees',
      'roles',
      'leaves',
      'managers',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // PROJECT MANAGER
  // -------------------------------------------------------

  'Project Manager': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'projects',
      'tasks',
      'team'
    ]
  },

  // -------------------------------------------------------
  // TEAM LEAD
  // -------------------------------------------------------

  'Team Lead': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'team',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // SOFTWARE DEVELOPER
  // -------------------------------------------------------

  'Software Developer': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'myLeaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // UI/UX DESIGNER
  // -------------------------------------------------------

  'UI/UX Designer': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'myLeaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // QA ENGINEER
  // -------------------------------------------------------

  'QA Engineer': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'myLeaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // DEVOPS ENGINEER
  // -------------------------------------------------------

  'DevOps Engineer': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'myLeaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // ACCOUNTANT
  // -------------------------------------------------------

  Accountant: {
    sections: [
      'overview',
      'employees',
      'leaves',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // RECEPTIONIST
  // -------------------------------------------------------

  Receptionist: {
    sections: [
      'overview',
      'manager',
      'employees',
      'leaves',
      'events',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // SUPPORT EXECUTIVE
  // -------------------------------------------------------

  'Support Executive': {
    sections: [
      'overview',
      'manager',
      'leaves',
      'myLeaves',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // IT MANAGER
  // -------------------------------------------------------

  'IT Manager': {
    sections: [
      'overview',
      'employees',
      'roles',
      'manager',
      'projects',
      'tasks',
      'leaves'
    ]
  },

  // -------------------------------------------------------
  // FINANCE MANAGER
  // -------------------------------------------------------

  'Finance Manager': {
    sections: [
      'overview',
      'employees',
      'leaves',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // ADMINISTRATION MANAGER
  // -------------------------------------------------------

  'Administration Manager': {
    sections: [
      'overview',
      'employees',
      'roles',
      'leaves',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // SALES MANAGER
  // -------------------------------------------------------

  'Sales Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // MARKETING MANAGER
  // -------------------------------------------------------

  'Marketing Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // OPERATIONS MANAGER
  // -------------------------------------------------------

  'Operations Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // CUSTOMER SUPPORT MANAGER
  // -------------------------------------------------------

  'Customer Support Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // R&D MANAGER
  // -------------------------------------------------------

  'R&D Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // TRAINING MANAGER
  // -------------------------------------------------------

  'Training Manager': {
    sections: [
      'overview',
      'employees',
      'team',
      'leaves',
      'projects',
      'tasks'
    ]
  },

  // -------------------------------------------------------
  // PRODUCT OWNER
  // -------------------------------------------------------

  'Product Owner': {
    sections: [
      'overview',
      'manager',
      'projects',
      'tasks',
      'team',
      'leaves'
    ]
  },

  // -------------------------------------------------------
  // SCRUM MASTER
  // -------------------------------------------------------

  'Scrum Master': {
    sections: [
      'overview',
      'manager',
      'projects',
      'tasks',
      'team',
      'leaves'
    ]
  },

  // -------------------------------------------------------
  // BUSINESS ANALYST
  // -------------------------------------------------------

  'Business Analyst': {
    sections: [
      'overview',
      'manager',
      'projects',
      'tasks',
      'leaves'
    ]
  },

  // -------------------------------------------------------
  // PROJECT COORDINATOR
  // -------------------------------------------------------

  'Project Coordinator': {
    sections: [
      'overview',
      'manager',
      'projects',
      'tasks',
      'team',
      'leaves'
    ]
  },

  // -------------------------------------------------------
  // TECHNICAL LEAD
  // -------------------------------------------------------

  'Technical Lead': {
    sections: [
      'overview',
      'manager',
      'employees',
      'team',
      'projects',
      'tasks',
      'leaves'
    ]
  }
};


// =========================================================
// CONSTRUCTOR
// =========================================================

constructor(
  private adminService: AdminService,
  private employeeService: EmployeeService,
  private leaveService: LeaveService,
  private managerService: ManagerService,
  private calendarService: CalendarService,
  private projectsService: ProjectsService,
  private taskService: TaskService,
  private toastService: ToastService
) {}


// =========================================================
// INIT
// =========================================================

ngOnInit(): void {

  this.loadEvents();
  this.loadCalendarEvents();
  this.loadAdmins();

  const loginUser =
    this.employeeService.getLoggedInUser?.();

  if (loginUser) {

    this.applyLoginUser(loginUser);

    if (this.isAdminRole()) {
      this.loadAdminProfile();
      this.generateCalendar();
      this.loadStudentData();
      if (this.isOfficeAdmin()) {
        this.loadOfficeDashboardData();
      }
      return;
    }

    this.generateCalendar();
    this.loadStudentData();
    this.loadDashboardData();

  } else {

    const storedUser =
      this.getStoredLoginUser();

    if (!storedUser) {

      this.toastService.showError(
        'User session not found. Please log in again.'
      );

      return;
    }

    this.applyLoginUser(storedUser);

    if (this.isAdminRole()) {
      this.loadAdminProfile();
      this.generateCalendar();
      this.loadStudentData();
      if (this.isOfficeAdmin()) {
        this.loadOfficeDashboardData();
      }
      return;
    }

    this.generateCalendar();
    this.loadStudentData();
    this.loadDashboardData();
  }
}


// =========================================================
// GET STORED LOGIN USER
// =========================================================

private getStoredLoginUser(): any {

  try {

    const currentUser =
      localStorage.getItem('currentUser');

    if (currentUser) {
      return JSON.parse(currentUser);
    }

  } catch (error) {

    console.error(
      'Unable to read logged-in user:',
      error
    );

  }

  return null;
}


// =========================================================
// APPLY LOGIN USER
// =========================================================

private applyLoginUser(
  loginResponse: any
): void {

  if (!loginResponse) {
    return;
  }

  const employee =
    loginResponse.user ||
    loginResponse.employee ||
    loginResponse.data ||
    loginResponse;

  if (!employee) {
    return;
  }

  this.currentEmployee =
    employee;

  // -------------------------------------------------------
  // EMPLOYEE ID
  // -------------------------------------------------------

  this.currentUserEmployeeId =
    employee.EmployeeID ??
    employee.employeeId ??
    employee.EmployeeId ??
    employee.id ??
    null;

  // -------------------------------------------------------
  // EMPLOYEE NAME
  // -------------------------------------------------------

  this.currentUserName =
    employee.FullName ??
    employee.fullName ??
    employee.Name ??
    employee.name ??
    '';

  // -------------------------------------------------------
  // ROLE
  // -------------------------------------------------------

  const roleCandidates = [
    employee.AdminType,
    employee.adminType,
    loginResponse.role,
    localStorage.getItem('role'),
    employee.RoleName,
    employee.roleName,
    employee.Role,
    employee.role,
    employee.Designation,
    employee.designation
  ];

  this.role = roleCandidates.find(
    (value: any) =>
      typeof value === 'string' && value.trim().length > 0
  ) || '';

  // -------------------------------------------------------
  // CURRENT USER
  // -------------------------------------------------------

  this.currentUser = {

    ...employee,

    name:
      this.currentUserName,

    role:
      this.role,

    image:
      employee.EmployeePhoto ??
      employee.employeePhoto ??
      employee.image ??
      employee.profileImage ??
      employee.Image ??
      'assets/user1.jpg'

  };

  console.log(
    'Logged-in employee:',
    this.currentEmployee
  );

  console.log(
    'Employee ID:',
    this.currentUserEmployeeId
  );

  console.log(
    'Employee Name:',
    this.currentUserName
  );

  console.log(
    'Employee Role:',
    this.role
  );
}

private applyCurrentEmployee(employee: any): void {
  this.applyLoginUser({
    user: employee,
    role: employee?.RoleName ?? employee?.roleName
  });
}


// =========================================================
// LOAD STUDENT DATA
// =========================================================

private loadStudentData(): void {

  try {

    this.studentss =
      JSON.parse(
        localStorage.getItem('students') || '[]'
      );

  } catch {

    this.studentss = [];

  }

  this.studentss.forEach(
    (student: any) => {

      this.ensureStudentData(student);

    }
  );
}


// =========================================================
// DASHBOARD TITLE
// =========================================================

get dashboardTitle(): string {

  return `${this.role || 'User'} Dashboard`;

}

  get displayRole(): string {
    const role = String(this.role || '').trim();
    return ['office', 'school'].includes(role.toLowerCase())
      ? 'Admin'
      : role;
  }


// =========================================================
// ROLE SECTION CHECK
// =========================================================

hasSection(
  section: string
): boolean {

  const config =
    this.roleDashboardConfig[this.role];

  if (!config) {
    return true;
  }

  return config.sections.includes(section);
}


// =========================================================
// ROLE CHECK HELPERS
// =========================================================

isSuperAdmin(): boolean {
  return this.role === 'Super Admin';
}

isAdministrator(): boolean {
  return this.role === 'Administrator';
}

isHRManager(): boolean {
  return this.role === 'HR Manager';
}

isProjectManager(): boolean {
  return this.role === 'Project Manager';
}

isTeamLead(): boolean {
  return this.role === 'Team Lead';
}

isDeveloper(): boolean {
  return this.role === 'Software Developer';
}

isDesigner(): boolean {
  return this.role === 'UI/UX Designer';
}

isQAEngineer(): boolean {
  return this.role === 'QA Engineer';
}

isDevOpsEngineer(): boolean {
  return this.role === 'DevOps Engineer';
}

isAccountant(): boolean {
  return this.role === 'Accountant';
}

isReceptionist(): boolean {
  return this.role === 'Receptionist';
}

isSupportExecutive(): boolean {
  return this.role === 'Support Executive';
}

isITManager(): boolean {
  return this.role === 'IT Manager';
}

isFinanceManager(): boolean {
  return this.role === 'Finance Manager';
}

isAdministrationManager(): boolean {
  return this.role === 'Administration Manager';
}

isSalesManager(): boolean {
  return this.role === 'Sales Manager';
}

isMarketingManager(): boolean {
  return this.role === 'Marketing Manager';
}

isOperationsManager(): boolean {
  return this.role === 'Operations Manager';
}

isCustomerSupportManager(): boolean {
  return this.role === 'Customer Support Manager';
}

isRAndDManager(): boolean {
  return this.role === 'R&D Manager';
}

isTrainingManager(): boolean {
  return this.role === 'Training Manager';
}

isProductOwner(): boolean {
  return this.role === 'Product Owner';
}

isScrumMaster(): boolean {
  return this.role === 'Scrum Master';
}

isBusinessAnalyst(): boolean {
  return this.role === 'Business Analyst';
}

isProjectCoordinator(): boolean {
  return this.role === 'Project Coordinator';
}

isTechnicalLead(): boolean {
  return this.role === 'Technical Lead';
}


// =========================================================
// CHECK ADMINISTRATIVE ACCESS
// =========================================================

isAdminRole(): boolean {
  return [
    'super admin',
    'administrator',
    'superadmin',
    'school',
    'office'
  ].includes(String(this.role || '').toLowerCase().trim());
}

isOfficeAdmin(): boolean {
  return String(this.role || '').toLowerCase().trim() === 'office';
}

private loadAdminProfile(): void {

  const adminId = Number(
    this.currentEmployee?.AdminID ??
    this.currentEmployee?.adminId ??
    this.currentEmployee?.AdminId ??
    this.currentEmployee?.id
  );

  if (!adminId || isNaN(adminId)) {
    return;
  }

  this.adminService.getAdminById(adminId).subscribe({
    next: (admin: any) => {
      if (!admin) {
        return;
      }

      this.currentEmployee = admin;
      this.currentUser = {
        ...admin,
        name: admin.FullName ?? admin.fullName ?? admin.Name ?? admin.name ?? '',
        role: admin.AdminType ?? admin.adminType ?? this.role,
        image: admin.image ?? admin.profileImage ?? admin.Image ?? 'assets/user1.jpg'
      };
      this.currentUserName = this.currentUser.name;
      this.role = admin.AdminType ?? admin.adminType ?? this.role;
    },
    error: (error) => console.error('Failed to get current admin:', error)
  });
}


// =========================================================
// LOAD DASHBOARD DATA
// =========================================================

loadOfficeDashboardData(): void {
  this.officeDashboardLoading = true;
  this.officeDashboardError = '';

  forkJoin({
    employees: this.employeeService.getEmployees(),
    managers: this.managerService.getManagers().pipe(
      catchError((err) => {
        console.error('Office dashboard manager load error:', err);
        return of([]);
      })
    ),
    leaves: this.leaveService.getLeaves(),
    meetings: this.calendarService.getMeetings(),
    holidays: this.calendarService.getHolidays()
  }).subscribe({
    next: ({ employees, managers, leaves, meetings, holidays }: any) => {
      this.employee = Array.isArray(employees) ? employees : [];
      this.officeDashboardManagers = Array.isArray(managers) ? managers : [];
      this.leaveRequests = Array.isArray(leaves) ? leaves : [];
      this.totalEmployees = this.employee.length;
      this.officeDashboardEvents = [
        ...(Array.isArray(meetings) ? meetings : []).map((event: any) => ({
          ...event,
          category: 'Meeting'
        })),
        ...(Array.isArray(holidays) ? holidays : []).map((event: any) => ({
          ...event,
          category: 'Holiday'
        }))
      ];
      this.refreshOfficeDashboardSummaries();
      this.officeDashboardLoading = false;
    },
    error: (err) => {
      console.error('Office dashboard data load error:', err);
      this.officeDashboardError = 'Unable to load admin dashboard data.';
      this.officeDashboardLoading = false;
    }
  });
}

private refreshOfficeDashboardSummaries(): void {
  const today = this.officeDateOnly(new Date());
  const departmentCounts = new Map<string, number>();

  this.employee.forEach((employee: any) => {
    const department = String(
      employee.DepartmentName ??
      employee.departmentName ??
      employee.Department ??
      'Unassigned'
    ).trim() || 'Unassigned';
    departmentCounts.set(department, (departmentCounts.get(department) || 0) + 1);
  });

  this.officeDashboardDepartments = Array.from(departmentCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: this.totalEmployees ? Math.round((count / this.totalEmployees) * 100) : 0
    }))
    .sort((left, right) => right.count - left.count);

  this.officeDashboardManagers = this.officeDashboardManagers.map((manager: any) => {
    const managerDepartmentId = Number(manager.DepartmentID ?? manager.departmentId);
    const managerDepartmentName = String(
      manager.TeamName ?? manager.teamName ?? manager.DepartmentName ?? manager.departmentName ?? ''
    ).trim().toLowerCase();
    const teamLeads = this.employee.filter((employee: any) => {
      const role = String(
        employee.RoleName ?? employee.roleName ?? employee.Role ?? employee.role ??
        employee.Designation ?? employee.designation ?? ''
      ).trim().toLowerCase();
      const employeeDepartmentId = Number(
        employee.DepartmentID ?? employee.departmentId ?? employee.DepartmentId
      );
      const employeeDepartmentName = String(
        employee.DepartmentName ?? employee.departmentName ?? employee.Department ?? ''
      ).trim().toLowerCase();
      const isTeamLead = role === 'team lead' || role === 'teamlead' || role.includes('team lead') || role.includes('lead');
      const sameDepartment = (managerDepartmentId && employeeDepartmentId && managerDepartmentId === employeeDepartmentId) ||
        (managerDepartmentName && employeeDepartmentName && managerDepartmentName === employeeDepartmentName);

      return isTeamLead && sameDepartment;
    });

    return {
      ...manager,
      dashboardName: manager.ManagerName ?? manager.managerName ?? manager.FullName ?? 'Unnamed manager',
      dashboardDepartment: manager.TeamName ?? manager.teamName ?? manager.DepartmentName ?? manager.departmentName ?? 'Unassigned department',
      teamLeadNames: teamLeads.map((teamLead: any) =>
        teamLead.FullName ?? teamLead.fullName ?? teamLead.EmployeeName ?? teamLead.Name ?? teamLead.name ?? 'Unnamed team lead'
      ),
      teamLeadCount: teamLeads.length
    };
  });

  this.officeDashboardPendingLeaves = this.leaveRequests.filter((leave: any) =>
    String(leave.Status ?? leave.status ?? '').toLowerCase() === 'pending'
  );

  this.officeDashboardRecentLeaves = [...this.leaveRequests]
    .sort((left: any, right: any) =>
      new Date(right.appliedDate ?? right.AppliedDate ?? 0).getTime() -
      new Date(left.appliedDate ?? left.AppliedDate ?? 0).getTime()
    )
    .slice(0, 5);

  const approvedLeaves = this.leaveRequests.filter((leave: any) =>
    String(leave.Status ?? leave.status ?? '').toLowerCase() === 'approved'
  );

  this.officeDashboardOnLeaveToday = new Set(
    approvedLeaves
      .filter((leave: any) => {
        const startDate = this.officeDateOnly(leave.StartDate ?? leave.startDate);
        const endDate = this.officeDateOnly(leave.EndDate ?? leave.endDate);
        return startDate && endDate && startDate <= today && endDate >= today;
      })
      .map((leave: any) => leave.EmployeeID ?? leave.employeeId ?? leave.LeaveID ?? leave.leaveId)
  ).size;

  this.officeDashboardUpcomingLeaves = approvedLeaves
    .filter((leave: any) => {
      const endDate = this.officeDateOnly(leave.EndDate ?? leave.endDate);
      return endDate && endDate >= today;
    })
    .sort((left: any, right: any) =>
      this.officeDateOnly(left.StartDate ?? left.startDate).localeCompare(
        this.officeDateOnly(right.StartDate ?? right.startDate)
      )
    )
    .slice(0, 5);

  this.officeDashboardEvents = this.officeDashboardEvents
    .filter((event: any) => {
      const eventDate = this.officeDateOnly(event.date ?? event.Date);
      return eventDate && eventDate >= today;
    })
    .sort((left: any, right: any) =>
      this.officeDateOnly(left.date ?? left.Date).localeCompare(
        this.officeDateOnly(right.date ?? right.Date)
      )
    )
    .slice(0, 6);
}

private officeDateOnly(value: any): string {
  if (!value) {
    return '';
  }

  const dateText = value instanceof Date
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
    : String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : '';
}

updateOfficeLeaveStatus(leave: any, status: 'Approved' | 'Declined'): void {
  const leaveId = Number(leave.LeaveID ?? leave.leaveId);
  if (!leaveId || this.updatingOfficeLeaveId !== null) {
    return;
  }

  this.updatingOfficeLeaveId = leaveId;
  this.leaveService.updateLeaveStatus(leaveId, status).subscribe({
    next: () => {
      this.leaveRequests = this.leaveRequests.map((item: any) =>
        Number(item.LeaveID ?? item.leaveId) === leaveId
          ? { ...item, Status: status, status }
          : item
      );
      this.refreshOfficeDashboardSummaries();
      this.updatingOfficeLeaveId = null;
      this.toastService.showSuccess(`Leave request ${status.toLowerCase()}.`);
    },
    error: (err) => {
      console.error('Failed to update leave request:', err);
      this.updatingOfficeLeaveId = null;
      this.toastService.showError('Unable to update the leave request.');
    }
  });
}

loadDashboardData(): void {

  if (this.isAdminRole()) {
    return;
  }

  if (
    this.currentUserEmployeeId === null ||
    this.currentUserEmployeeId === undefined ||
    this.currentUserEmployeeId === ''
  ) {

    console.error(
      'No EmployeeID found for logged-in employee.'
    );

    this.toastService.showError(
      'Could not identify the logged-in employee. Please log in again.'
    );

    return;
  }

  const employeeId =
    Number(this.currentUserEmployeeId);

  if (isNaN(employeeId)) {

    console.error(
      'Invalid EmployeeID:',
      this.currentUserEmployeeId
    );

    this.toastService.showError(
      'Invalid employee session. Please log in again.'
    );

    return;
  }

  forkJoin({

    employees:
      this.employeeService.getEmployees(),

    currentEmployeeRecord:
      this.employeeService
        .getEmployeeById(employeeId)
        .pipe(
          catchError((err) => {

            console.error(
              'Failed to get current employee:',
              err
            );

            return of(null);

          })
        ),

    leaves:
      this.leaveService.getLeaves(),

    managers:
      this.managerService.getManagers()

  }).subscribe({

    next: ({
      employees,
      currentEmployeeRecord,
      leaves,
      managers
    }: any) => {

      // ---------------------------------------------------
      // EMPLOYEES
      // ---------------------------------------------------

      this.employee =
        Array.isArray(employees)
          ? employees
          : [];

      this.totalEmployees =
        this.employee.length;

      // ---------------------------------------------------
      // LEAVES
      // ---------------------------------------------------

      this.leaveRequests =
        Array.isArray(leaves)
          ? leaves
          : [];

      // ---------------------------------------------------
      // CURRENT EMPLOYEE
      // ---------------------------------------------------

      if (currentEmployeeRecord) {

        this.applyCurrentEmployee(
          currentEmployeeRecord
        );

      } else {

        this.resolveCurrentEmployee(
          this.employee
        );

      }

      // ---------------------------------------------------
      // MANAGER
      // ---------------------------------------------------

      this.findCurrentManager(
        Array.isArray(managers)
          ? managers
          : [],
        this.employee
      );

      // ---------------------------------------------------
      // MY LEAVES
      // ---------------------------------------------------

      this.loadMyAppliedLeaves(
        this.leaveRequests
      );

      // ---------------------------------------------------
      // LEAVE BALANCE
      // ---------------------------------------------------

      this.calculateLeaveBalances();

      // ---------------------------------------------------
      // EMPLOYEES BY ROLE
      // ---------------------------------------------------

      this.buildEmployeesByRole(
        this.employee
      );

      // ---------------------------------------------------
      // MONTHLY LEAVES
      // ---------------------------------------------------

      this.filterMonthlyLeaves();

      // ---------------------------------------------------
      // DASHBOARD STATISTICS
      // ---------------------------------------------------

      this.computeStatsFromEmployees(
        this.employee,
        this.leaveRequests
      );

      // ---------------------------------------------------
      // UPCOMING LEAVES
      // ---------------------------------------------------

      this.computeUpcomingLeaves(
        this.leaveRequests
      );

      // ---------------------------------------------------
      // TEAM LEADS & DEPARTMENT TEAM MEMBERS
      // ---------------------------------------------------

      this.computeTeamLeads(
        this.employee
      );

      this.computeDepartmentTeamMembers();

      // ---------------------------------------------------
      // DEPARTMENT OVERVIEW (Manager + Team Leads + Leaves)
      // ---------------------------------------------------

      this.computeDepartmentOverview(
        this.employee,
        this.leaveRequests
      );

      // ---------------------------------------------------
      // PROJECTS
      // ---------------------------------------------------

      this.loadUserProjects();

      console.log(
        'Dashboard loaded for:',
        this.currentEmployee
      );

    },

    error: (err) => {

      console.error(
        'Dashboard data load error:',
        err
      );

      this.toastService.showError(
        'Unable to load dashboard data.'
      );
    }
  });

  this.loadMyAppliedLeaves(this.leaveRequests);
  this.calculateLeaveBalances();
}


// =========================================================
// RESOLVE CURRENT EMPLOYEE
// =========================================================

resolveCurrentEmployee(
  employees: any[]
): void {

  if (
    !Array.isArray(employees) ||
    !employees.length
  ) {

    console.warn(
      'Employee list is empty.'
    );

    return;
  }

  const loginId =
    this.currentUserEmployeeId;

  if (
    loginId !== null &&
    loginId !== undefined
  ) {

    const matchedEmployee =
      employees.find(
        (employee: any) => {

          const employeeId =
            employee.EmployeeID ??
            employee.employeeId ??
            employee.EmployeeId ??
            employee.id;

          return (
            String(employeeId) ===
            String(loginId)
          );

        }
      );

    if (matchedEmployee) {

      this.applyCurrentEmployee(
        matchedEmployee
      );

      return;

    }

  }

  const loginUser =
    this.currentEmployee;

  const loginEmail =
    loginUser?.Email ??
    loginUser?.email;

  if (loginEmail) {

    const matchedEmployee =
      employees.find(
        (employee: any) => {

          const email =
            employee.Email ??
            employee.email;

          return (
            email &&
            email.toLowerCase() ===
            loginEmail.toLowerCase()
          );

        }
      );

    if (matchedEmployee) {

      this.applyCurrentEmployee(
        matchedEmployee
      );

      return;

    }

  }

  console.warn(
    'Unable to resolve current employee.'
  );

}


// =========================================================
// FIND CURRENT MANAGER
// =========================================================

findCurrentManager(
  managers: any[],
  employees: any[]
): void {

  const currentEmployee =
    this.currentEmployee ??
    employees.find(
      (employee: any) => {

        const id =
          employee.EmployeeID ??
          employee.employeeId ??
          employee.EmployeeId ??
          employee.id;

        return (
          String(id) ===
          String(this.currentUserEmployeeId)
        );

      }
    );

  const currentRole = (this.role || '').toLowerCase().trim();
  const currentDeptId = Number(
    currentEmployee?.DepartmentID ??
    currentEmployee?.departmentId ??
    currentEmployee?.DepartmentId
  );
  const currentDeptName = (
    currentEmployee?.DepartmentName ??
    currentEmployee?.departmentName ??
    currentEmployee?.Department ??
    ''
  ).toLowerCase().trim();

  // 1. Direct Manager ID
  const managerId =
    currentEmployee?.ManagerID ??
    currentEmployee?.managerId ??
    currentEmployee?.ReportingManagerID ??
    currentEmployee?.reportingManagerId;

  let manager: any = null;

  if (managerId) {
    manager = managers.find((item: any) => {
      const id = item.EmployeeID ?? item.ManagerID ?? item.managerId ?? item.EmployeeId;
      return String(id) === String(managerId);
    });

    if (!manager) {
      manager = employees.find((item: any) => {
        const id = item.EmployeeID ?? item.employeeId ?? item.EmployeeId ?? item.id;
        return String(id) === String(managerId);
      });
    }
  }

  // 2. Direct Manager Name on Employee
  if (!manager) {
    const managerName =
      currentEmployee?.ManagerName ??
      currentEmployee?.managerName ??
      currentEmployee?.ReportingManager;

    if (managerName) {
      manager =
        managers.find((item: any) => {
          const name = item.FullName ?? item.fullName ?? item.ManagerName ?? item.managerName ?? item.Name ?? item.name;
          return name && name.toLowerCase() === managerName.toLowerCase();
        }) ||
        employees.find((item: any) => {
          const name = item.FullName ?? item.fullName ?? item.Name ?? item.name;
          return name && name.toLowerCase() === managerName.toLowerCase();
        });
    }
  }

  // 3. Match from TeamManagers list by Department
  if (!manager && (currentDeptId || currentDeptName)) {
    manager = managers.find((item: any) => {
      const deptId = Number(item.DepartmentID ?? item.departmentId);
      const teamName = (item.TeamName ?? item.DepartmentName ?? item.teamName ?? '').toLowerCase().trim();
      return (currentDeptId && deptId && currentDeptId === deptId) ||
             (currentDeptName && teamName && currentDeptName === teamName);
    });
  }

  // 4. Match from Employees list where role is Manager in the same department
  if (!manager && (currentDeptId || currentDeptName)) {
    manager = employees.find((item: any) => {
      const deptId = Number(item.DepartmentID ?? item.departmentId);
      const deptName = (item.DepartmentName ?? item.departmentName ?? '').toLowerCase().trim();
      const r = (item.RoleName ?? item.roleName ?? item.Role ?? item.role ?? item.Designation ?? '').toLowerCase().trim();
      const isMgr = r === 'manager' || r === 'project manager' || r.includes('manager') || item.IsManager === 1 || item.IsManager === true;
      const sameDept = (currentDeptId && deptId && currentDeptId === deptId) ||
                       (currentDeptName && deptName && currentDeptName === deptName);
      const isNotSelf = String(item.EmployeeID ?? item.employeeId) !== String(this.currentUserEmployeeId);
      return isMgr && sameDept && isNotSelf;
    });
  }

  // 5. If current user IS a Manager themselves
  if (!manager && (currentRole === 'manager' || currentRole === 'project manager' || currentRole.includes('manager'))) {
    manager = currentEmployee;
  }

  // 6. Fallback to any active manager in managers list
  if (!manager && managers && managers.length > 0) {
    manager = managers[0];
  }

  if (!manager) {
    this.managerInfo = {
      name: 'Not Assigned',
      role: 'Not Assigned',
      department: '',
      image: 'assets/user1.jpg',
      isAbsent: false
    };
    return;
  }

  this.managerInfo = {
    name:
      manager.FullName ??
      manager.fullName ??
      manager.ManagerName ??
      manager.managerName ??
      manager.Name ??
      manager.name ??
      'Manager',

    role:
      manager.RoleName ??
      manager.roleName ??
      manager.Role ??
      manager.role ??
      manager.Designation ??
      'Manager',

    department:
      manager.DepartmentName ??
      manager.departmentName ??
      manager.TeamName ??
      manager.teamName ??
      '',

    image:
      manager.EmployeePhoto ||
      manager.employeePhoto ||
      manager.image ||
      'assets/user1.jpg',

    isAbsent:
      manager.IsAbsent === true ||
      manager.isAbsent === true ||
      manager.Absent === true ||
      manager.absent === true
  };

}


// =========================================================
// LOAD MY APPLIED LEAVES
// =========================================================

loadMyAppliedLeaves(leaves: any[]): void {

  if (!Array.isArray(leaves)) {
    this.myAppliedLeaves = [];
    return;
  }

  this.myAppliedLeaves = leaves.filter(
    (leave: any) => {

      const leaveEmployeeId =
        leave.EmployeeID ??
        leave.employeeId ??
        leave.EmployeeId;

      const applicantName =
        leave.ApplicantName ??
        leave.applicantName ??
        leave.Name ??
        leave.name ??
        '';

      // Match using EmployeeID
      const employeeMatch =
        this.currentUserEmployeeId !== null &&
        this.currentUserEmployeeId !== undefined &&
        String(leaveEmployeeId) ===
        String(this.currentUserEmployeeId);

      // Match using employee name as fallback
      const nameMatch =
        applicantName &&
        this.currentUserName &&
        applicantName.toString().toLowerCase() ===
        this.currentUserName.toString().toLowerCase();

      return employeeMatch || nameMatch;
    }
  );

  console.log(
    'My Applied Leaves:',
    this.myAppliedLeaves
  );

  // Recalculate balance whenever leaves are loaded
  this.calculateLeaveBalances();
}

// =========================================================
// CALCULATE LEAVE BALANCES
// =========================================================

calculateLeaveBalances(): void {

  const leaveTypes = [
    'Casual Leave',
    'Sick Leave',
    'Annual Leave'
  ];

  const defaultBalance = 12;

  this.leaveBalances = leaveTypes.map(
    (type: string) => {

      let usedDays = 0;

      // ---------------------------------------------------
      // CHECK ALL APPLIED LEAVES
      // ---------------------------------------------------

      this.myAppliedLeaves.forEach(
        (leave: any) => {

          const leaveType = (
            leave.LeaveType ??
            leave.leaveType ??
            leave.type ??
            ''
          )
            .toString()
            .trim()
            .toLowerCase();

          const status = (
            leave.Status ??
            leave.status ??
            ''
          )
            .toString()
            .trim()
            .toLowerCase();

          // ------------------------------------------------
          // REJECTED / DECLINED
          // DO NOT DEDUCT
          // ------------------------------------------------

          if (
            status === 'rejected' ||
            status === 'declined'
          ) {
            return;
          }

          // ------------------------------------------------
          // CHECK LEAVE TYPE
          // ------------------------------------------------

          let isMatchingType = false;

          // Sick Leave includes Emergency Leave
          if (type === 'Sick Leave') {

            isMatchingType =
              leaveType === 'sick leave' ||
              leaveType === 'emergency leave' ||
              leaveType === 'emergency';

          } else {

            isMatchingType =
              leaveType ===
              type.toLowerCase();
          }

          if (!isMatchingType) {
            return;
          }

          // ------------------------------------------------
          // GET DATES
          // ------------------------------------------------

          const startValue =
            leave.StartDate ??
            leave.startDate;

          const endValue =
            leave.EndDate ??
            leave.endDate;

          if (!startValue) {
            return;
          }

          const startDate =
            new Date(startValue);

          const endDate =
            endValue
              ? new Date(endValue)
              : new Date(startValue);

          if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
          ) {
            return;
          }

          // Remove time portion
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          // ------------------------------------------------
          // CALCULATE DAYS
          // ------------------------------------------------

          const difference =
            endDate.getTime() -
            startDate.getTime();

          const days =
            Math.floor(
              difference /
              (1000 * 60 * 60 * 24)
            ) + 1;

          if (days > 0) {
            usedDays += days;
          }
        }
      );

      // ---------------------------------------------------
      // REMAINING
      // DO NOT LIMIT TO ZERO
      // ---------------------------------------------------

      const remaining =
        defaultBalance - usedDays;

      return {
        type: type,
        total: defaultBalance,
        used: usedDays,
        remaining: remaining
      };
    }
  );

  console.log(
    'FINAL LEAVE BALANCES:',
    this.leaveBalances
  );
}
// =========================================================
// EMPLOYEES BY ROLE
// =========================================================

buildEmployeesByRole(
  employees: any[]
): void {

  const roleMap:
    Record<string, any[]> = {};

  employees.forEach(
    (employee: any) => {

      const role =
        employee.RoleName ??
        employee.roleName ??
        employee.Role ??
        employee.role ??
        employee.Designation ??
        employee.designation ??
        'Unknown';

      if (!roleMap[role]) {

        roleMap[role] = [];

      }

      roleMap[role].push(
        employee
      );

    }
  );

  this.employeesByRole =
    Object.entries(roleMap)
      .map(
        ([role, users]) => ({

          role,

          count:
            users.length,

          employees:
            users

        })
      )
      .sort(
        (a, b) =>
          b.count - a.count
      );

}


// =========================================================
// TEAM LEADS
// =========================================================

computeTeamLeads(
  employees: any[]
): void {

  if (!Array.isArray(employees)) {
    this.teamLeads = [];
    return;
  }

  this.teamLeads =
    employees.filter(
      (employee: any) => {

        const role =
          (
            employee.RoleName ??
            employee.roleName ??
            employee.Role ??
            employee.role ??
            employee.Designation ??
            employee.designation ??
            ''
          ).toLowerCase().trim();

        return (
          role === 'team lead' ||
          role === 'teamlead' ||
          role.includes('team lead') ||
          role.includes('teamlead') ||
          role.includes('lead')
        );

      }
    );

}

// =========================================================
// DEPARTMENT TEAM MEMBERS
// =========================================================

computeDepartmentTeamMembers(): void {
  if (!Array.isArray(this.employee)) {
    this.departmentTeamMembers = [];
    return;
  }

  const currentEmp = this.currentEmployee;
  const currentDeptId = Number(
    currentEmp?.DepartmentID ??
    currentEmp?.departmentId ??
    currentEmp?.DepartmentId
  );
  const currentDeptName = (
    currentEmp?.DepartmentName ??
    currentEmp?.departmentName ??
    currentEmp?.Department ??
    ''
  ).toLowerCase().trim();

  const userRole = (this.role || '').toLowerCase().trim();

  // If user is Admin/Superadmin/HR Manager without specific department filter, show all employees
  if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'hr manager') {
    this.departmentTeamMembers = this.employee;
    return;
  }

  if (currentDeptId || currentDeptName) {
    const filtered = this.employee.filter((emp: any) => {
      const empDeptId = Number(emp.DepartmentID ?? emp.departmentId ?? emp.DepartmentId);
      const empDeptName = (emp.DepartmentName ?? emp.departmentName ?? emp.Department ?? '').toLowerCase().trim();

      return (currentDeptId && empDeptId && currentDeptId === empDeptId) ||
             (currentDeptName && empDeptName && currentDeptName === empDeptName);
    });

    this.departmentTeamMembers = filtered.length > 0 ? filtered : this.employee;
  } else {
    this.departmentTeamMembers = this.employee;
  }
}

// =========================================================
// EMPLOYEE / LEAVE STATISTICS
// =========================================================

computeStatsFromEmployees(
  employees: any[],
  leaves: any[]
): void {

  const totalEmployees =
    employees.length;

  const pendingLeaves =
    leaves.filter(
      (leave: any) => {

        const status =
          leave.Status ??
          leave.status ??
          '';

        return (
          status.toLowerCase() ===
          'pending'
        );

      }
    ).length;

  this.topCards = [

    {
      title: 'Employees',

      value:
        String(totalEmployees),

      bgColor:
        '#20c997',

      borderColor:
        '#20c997'
    },

    {
      title: 'Leaves',

      value:
        String(pendingLeaves),

      bgColor:
        '#fd7e14',

      borderColor:
        '#fd7e14'
    }

  ];

  // =====================================================
  // DEPARTMENT
  // =====================================================

  const deptMap:
    Record<string, number> = {};

  employees.forEach(
    (employee: any) => {

      const dept =
        employee.DepartmentName ??
        employee.departmentName ??
        employee.department ??
        'Other';

      deptMap[dept] =
        (
          deptMap[dept] ||
          0
        ) + 1;

    }
  );

  const deptColors = [
    '#9795f1',
    '#9ef5b3',
    '#feed8c',
    '#ffc08f',
    '#f37b63',
    '#87ceeb'
  ];

  this.employeeDepartments =
    Object.entries(deptMap)
      .map(
        (
          [name, count],
          index
        ) => ({

          name,

          percentage:
            totalEmployees
              ? Math.round(
                  (count /
                    totalEmployees) *
                  100
                )
              : 0,

          color:
            deptColors[
              index %
              deptColors.length
            ]

        })
      );

  this.departments =
    this.employeeDepartments;

  // =====================================================
  // GENDER
  // =====================================================

  const males =
    employees.filter(
      (employee: any) =>
        (
          employee.Gender ??
          employee.gender ??
          ''
        ).toLowerCase() ===
        'male'
    ).length;

  const females =
    employees.filter(
      (employee: any) =>
        (
          employee.Gender ??
          employee.gender ??
          ''
        ).toLowerCase() ===
        'female'
    ).length;

  const malePercent =
    totalEmployees
      ? Math.round(
          (males /
            totalEmployees) *
          100
        )
      : 0;

  const femalePercent =
    totalEmployees
      ? Math.round(
          (females /
            totalEmployees) *
          100
        )
      : 0;

  this.employeeStructure = [

    {
      title: 'Male',

      percentage:
        malePercent,

      color:
        '#f0b17a'
    },

    {
      title: 'Female',

      percentage:
        femalePercent,

      color:
        '#e68aed'
    }

  ];

  // =====================================================
  // EMPLOYMENT TYPE
  // =====================================================

  const fullTime =
    employees.filter(
      (employee: any) =>
        (
          employee.EmploymentType ??
          employee.employmentType ??
          ''
        ).toLowerCase() ===
        'full-time'
    ).length;

  const partTime =
    employees.filter(
      (employee: any) =>
        (
          employee.EmploymentType ??
          employee.employmentType ??
          ''
        ).toLowerCase() ===
        'part-time'
    ).length;

  const rejected =
    Math.max(
      totalEmployees -
      fullTime -
      partTime,
      0
    );

  this.statsCards = [

    {
      title:
        'Total Applications',

      count:
        String(totalEmployees),

      color:
        '#e83e8c'
    },

    {
      title:
        'Total Shortlisted',

      count:
        String(partTime),

      color:
        '#28a745'
    },

    {
      title:
        'Total Rejected',

      count:
        String(rejected),

      color:
        '#dc3545'
    }

  ];

  const selectedPercent =
    totalEmployees
      ? Math.round(
          (fullTime /
            totalEmployees) *
          100
        )
      : 0;

  const shortlistedPercent =
    totalEmployees
      ? Math.round(
          (partTime /
            totalEmployees) *
          100
        )
      : 0;

  const rejectedPercent =
    totalEmployees
      ? Math.round(
          (rejected /
            totalEmployees) *
          100
        )
      : 0;

  this.applications = [

    {
      name:
        'Total',

      count:
        totalEmployees,

      percent:
        100,

      color:
        '#9795f1'
    },

    {
      name:
        'Selected',

      count:
        fullTime,

      percent:
        selectedPercent,

      color:
        '#87f3a0'
    },

    {
      name:
        'Shortlisted',

      count:
        partTime,

      percent:
        shortlistedPercent,

      color:
        '#f1c40f'
    },

    {
      name:
        'Rejected',

      count:
        rejected,

      percent:
        rejectedPercent,

      color:
        '#f37b63'
    }

  ];

}


// =========================================================
// UPCOMING LEAVES
// =========================================================

computeUpcomingLeaves(
  leaves: any[]
): void {

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const upcoming =
    leaves
      .filter(
        (leave: any) => {

          const startValue =
            leave.StartDate ??
            leave.startDate;

          if (!startValue) {
            return false;
          }

          const start =
            new Date(
              startValue
            );

          const status =
            (
              leave.Status ??
              leave.status ??
              ''
            ).toLowerCase();

          return (
            start >= today &&
            status ===
            'approved'
          );

        }
      )
      .sort(
        (a: any, b: any) => {

          const dateA =
            new Date(
              a.StartDate ??
              a.startDate
            ).getTime();

          const dateB =
            new Date(
              b.StartDate ??
              b.startDate
            ).getTime();

          return dateA - dateB;

        }
      )
      .slice(
        0,
        5
      );

  const colors = [

    {
      bgColor:
        '#c8f0eb',

      textColor:
        '#009688'
    },

    {
      bgColor:
        '#e6dbf3',

      textColor:
        '#4a148c'
    },

    {
      bgColor:
        '#ffe4d1',

      textColor:
        '#ff6f00'
    }

  ];

  this.upcomingLeaves =
    upcoming.map(
      (
        leave: any,
        index: number
      ) => {

        const startDate =
          leave.StartDate ??
          leave.startDate;

        return {

          name:
            leave.ApplicantName ??
            leave.applicantName ??
            leave.FullName ??
            leave.fullName ??
            leave.EmployeeName ??
            leave.employeeName ??
            leave.name ??
            'Unknown Employee',

          date:
            new Date(
              startDate
            ).toLocaleDateString(
              'en-GB',
              {
                day:
                  '2-digit',

                month:
                  'short',

                year:
                  'numeric'
              }
            ),

          type:
            leave.LeaveType ??
            leave.leaveType ??
            leave.type ??
            'Leave',

          image:
            leave.EmployeePhoto ||
            leave.employeePhoto ||
            leave.image ||
            'assets/default-user.png',

          bgColor:
            colors[
              index %
              colors.length
            ].bgColor,

          textColor:
            colors[
              index %
              colors.length
            ].textColor

        };

      }
    );

}


// =========================================================
// LEAVE FORM
// =========================================================

toggleLeaveForm(): void {

  this.leaveFormVisible =
    !this.leaveFormVisible;

}


resetLeaveForm(): void {

  this.leaveForm = {

    type: '',

    startDate: '',

    endDate: '',

    contactNumber: '',

    reason: ''

  };

}


// =========================================================
// SUBMIT LEAVE REQUEST
// =========================================================

submitLeaveRequest(): void {

  const employeeId =
    Number(this.currentUserEmployeeId);


  if (
    !employeeId ||
    isNaN(employeeId) ||
    !this.leaveForm.type ||
    !this.leaveForm.startDate ||
    !this.leaveForm.endDate ||
    !this.leaveForm.contactNumber ||
    !this.leaveForm.reason
  ) {

    this.toastService.showError(
      'Please fill all leave fields.'
    );

    return;
  }


  const newRequest = {

    EmployeeID:
      employeeId,

    ApplicantName:
      this.currentUserName,

    ApplicantRole:
      this.role,

    LeaveType:
      this.leaveForm.type,

    StartDate:
      this.leaveForm.startDate,

    EndDate:
      this.leaveForm.endDate,

    ContactNumber:
      this.leaveForm.contactNumber,

    Reason:
      this.leaveForm.reason,

    Status:
      'Pending',

    AppliedDate:
      new Date().toISOString()

  };


  console.log(
    'Submitting leave:',
    newRequest
  );


  this.leaveService
    .addLeave(newRequest)
    .subscribe({

      next: (response: any) => {

        console.log(
          'Leave created:',
          response
        );


        // Close form
        this.leaveFormVisible =
          false;


        // Reset form
        this.resetLeaveForm();


        this.toastService.showSuccess(
          'Leave request submitted successfully.'
        );


        // -----------------------------------------------
        // IMPORTANT
        // Reload leaves from backend
        // -----------------------------------------------

        this.loadDashboardData();

      },


      error: (err) => {

        console.error(
          'Submit leave error:',
          err
        );

        this.toastService.showError(
          'Failed to submit leave.'
        );

      }

    });

}


// =========================================================
// FILTER MONTHLY LEAVES
// =========================================================

filterMonthlyLeaves(): void {

  this.monthlyLeaves = this.leaveRequests.filter(
    (request: any) => {

      // Super Admin and Administrator can see all employees' leaves
      if (
        this.role === 'Super Admin' ||
        this.role === 'Administrator'
      ) {
        return true;
      }

      // Get employee ID from different possible property names
      const employeeId =
        request.EmployeeID ??
        request.employeeId ??
        request.EmployeeId;

      // Other employees can see only their own leaves
      return (
        String(employeeId) ===
        String(this.currentUserEmployeeId)
      );
    }
  );

  console.log('All Leaves:', this.monthlyLeaves);

  this.leaveStats = {

    pending: this.monthlyLeaves.filter(
      (leave: any) =>
        String(
          leave.Status ??
          leave.status ??
          ''
        )
          .trim()
          .toLowerCase() === 'pending'
    ).length,

    approved: this.monthlyLeaves.filter(
      (leave: any) =>
        String(
          leave.Status ??
          leave.status ??
          ''
        )
          .trim()
          .toLowerCase() === 'approved'
    ).length,

    declined: this.monthlyLeaves.filter(
      (leave: any) =>
        String(
          leave.Status ??
          leave.status ??
          ''
        )
          .trim()
          .toLowerCase() === 'declined'
    ).length
  };

  console.log('All Leave Stats:', this.leaveStats);
}


// =========================================================
// UPDATE LEAVE STATUS
// =========================================================

updateLeaveStatus(
  leave: any,
  status: string
): void {

  // Super Admin and Administrator
  // can approve/decline leaves.

  if (
    !this.isAdminRole()
  ) {

    return;

  }

  const message =
    window.prompt(
      `Write a message for ${status.toLowerCase()} leave`,
      `Your leave request is ${status.toLowerCase()}.`
    );

  leave.Status =
    status;

  leave.status =
    status;

  leave.adminMessage =
    message ||
    `Your leave request is ${status.toLowerCase()}.`;

  this.filterMonthlyLeaves();

  const leaveId =
    leave.leaveId ??
    leave.LeaveID ??
    leave.leaveID ??
    leave.id;

  this.leaveService
    .updateLeaveStatus(
      leaveId,
      status
    )
    .subscribe({

      next: () => {

        this.loadDashboardData();

      },

      error: (err) => {

        console.error(
          'Update leave status error:',
          err
        );

        this.loadDashboardData();

      }

    });

}


// =========================================================
// FORMAT DATE
// =========================================================

formatDate(
  value: string
): string {

  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {

    return value;

  }

  return date.toLocaleDateString(
    'en-GB'
  );

}


// =========================================================
// CALENDAR
// =========================================================

generateCalendar(): void {

  const year =
    this.currentDate.getFullYear();

  const month =
    this.currentDate.getMonth();

  this.currentMonth =
    this.months[month];

  this.currentYear =
    year;

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const lastDate =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  this.calendarDays = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    this.calendarDays.push(
      null
    );

  }

  for (
    let day = 1;
    day <= lastDate;
    day++
  ) {

    this.calendarDays.push(
      day
    );

  }

}

loadCalendarEvents(): void {
  forkJoin({
    meetings: this.calendarService.getMeetings().pipe(catchError(() => of([]))),
    holidays: this.calendarService.getHolidays().pipe(catchError(() => of([])))
  }).subscribe(({ meetings, holidays }: any) => {
    this.calendarEvents = [
      ...(Array.isArray(holidays) ? holidays : []).map((event: any) => ({ ...event, category: 'Holiday' })),
      ...(Array.isArray(meetings) ? meetings : []).map((event: any) => ({ ...event, category: 'Meeting' }))
    ];
  });
}

getCalendarEventsForDay(day: number | null): any[] {
  if (!day) return [];

  const targetDate = this.calendarDateKey(new Date(
    this.currentDate.getFullYear(),
    this.currentDate.getMonth(),
    day
  ));

  return [
    ...this.calendarEvents,
    ...this.events.map((event: any) => ({ ...event, category: event.category || 'Event' }))
  ].filter((event: any) => this.calendarDateKey(event.date || event.Date) === targetDate);
}

private calendarDateKey(value: any): string {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}


// =========================================================
// PREVIOUS MONTH
// =========================================================

previousMonth(): void {

  this.currentDate =
    new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

  this.generateCalendar();
  this.filterMonthlyLeaves();

}


// =========================================================
// NEXT MONTH
// =========================================================

nextMonth(): void {

  this.currentDate =
    new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

  this.generateCalendar();
  this.filterMonthlyLeaves();

}


// =========================================================
// TODAY
// =========================================================

isToday(
  day: number | null
): boolean {

  if (!day) {
    return false;
  }

  const today =
    new Date();

  return (

    day ===
    today.getDate() &&

    this.currentDate.getMonth() ===
    today.getMonth() &&

    this.currentDate.getFullYear() ===
    today.getFullYear()

  );

}


// =========================================================
// EVENTS - LOAD
// =========================================================

loadEvents(): void {

  const savedEvents =
    localStorage.getItem(
      'events'
    );

  if (savedEvents) {

    try {

      this.events =
        JSON.parse(
          savedEvents
        );

    } catch {

      this.events = [];

    }

  } else {

    this.events = [

      {
        title:
          'Parents Teacher Meet',

        date:
          '15-Jul-2026',

        startTime:
          '09:00 AM',

        endTime:
          '10:30 AM'
      },

      {
        title:
          'Vacation Meeting',

        date:
          '07-Jul-2026',

        startTime:
          '09:00 AM',

        endTime:
          '10:30 AM'
      }

    ];

    this.saveEvents();

  }

}


// =========================================================
// SAVE EVENTS
// =========================================================

saveEvents(): void {

  localStorage.setItem(
    'events',
    JSON.stringify(
      this.events
    )
  );

}


// =========================================================
// OPEN EVENT MODAL
// =========================================================

openEventModal(): void {

  this.editIndex =
    null;

  this.showEventModal =
    true;

}


// =========================================================
// CLOSE EVENT MODAL
// =========================================================

closeEventModal(): void {

  this.showEventModal =
    false;

  this.editIndex =
    null;

  this.newEvent = {

    title: '',

    date: '',

    startTime: '',

    endTime: ''

  };

}


// =========================================================
// EDIT EVENT
// =========================================================

editEvent(
  index: number
): void {

  if (
    !this.events[index]
  ) {

    return;

  }

  this.editIndex =
    index;

  this.newEvent = {

    title:
      this.events[index].title,

    date:
      this.events[index].date,

    startTime:
      this.events[index].startTime,

    endTime:
      this.events[index].endTime

  };

  this.showEventModal =
    true;

}


// =========================================================
// ADD / UPDATE EVENT
// =========================================================

addEvent(): void {

  if (
    !this.newEvent.title ||
    !this.newEvent.date ||
    !this.newEvent.startTime ||
    !this.newEvent.endTime
  ) {

    this.toastService.showError(
      'Please fill all fields'
    );

    return;

  }

  const event = {

    title:
      this.newEvent.title,

    date:
      this.newEvent.date,

    startTime:
      this.newEvent.startTime,

    endTime:
      this.newEvent.endTime

  };

  if (
    this.editIndex !== null
  ) {

    this.events[
      this.editIndex
    ] = event;

  } else {

    this.events.push(
      event
    );

  }

  this.saveEvents();
  this.closeEventModal();

}


// =========================================================
// DELETE EVENT
// =========================================================

deleteEvent(
  index: number
): void {

  const confirmDelete =
    window.confirm(
      'Are you sure you want to delete this event?'
    );

  if (!confirmDelete) {
    return;
  }

  this.events.splice(
    index,
    1
  );

  this.saveEvents();

}


// =========================================================
// CLEAR EVENTS
// =========================================================

clearAllEvents(): void {

  const confirmClear =
    window.confirm(
      'Are you sure you want to clear all events?'
    );

  if (!confirmClear) {
    return;
  }

  this.events = [];

  localStorage.removeItem(
    'events'
  );

}


// =========================================================
// ADMIN LOAD
// =========================================================

loadAdmins(): void {

  this.adminService
    .getAdmins()
    .subscribe({

      next: (res: any) => {

        this.admins =
          Array.isArray(res)
            ? res
            : [];

        this.schoolAdminCount =
          this.admins.filter(
            (admin: any) =>
              (
                admin.AdminType ??
                admin.adminType ??
                ''
              ).toLowerCase() ===
              'school'
          ).length;

        this.officeAdminCount =
          this.admins.filter(
            (admin: any) =>
              (
                admin.AdminType ??
                admin.adminType ??
                ''
              ).toLowerCase() ===
              'office'
          ).length;

      },

      error: (err) => {

        console.error(
          'Load admins error:',
          err
        );

      }

    });

}


// =========================================================
// DELETE ADMIN
// =========================================================

deleteAdmin(
  id: number
): void {

  if (!this.isSuperAdmin()) {

    this.toastService.showError(
      'Only Super Admin can delete administrators.'
    );

    return;

  }

  this.admins =
    this.admins.filter(
      (admin: any) =>
        admin.id !== id &&
        admin.AdminID !== id
    );

  localStorage.setItem(
    'admins',
    JSON.stringify(
      this.admins
    )
  );

  this.loadAdmins();

}


// =========================================================
// TOGGLE ADMIN
// =========================================================

toggleAdmin(
  id: number
): void {

  this.expandedAdminId =
    this.expandedAdminId === id
      ? null
      : id;

}


// =========================================================
// STUDENT DATA
// =========================================================

private ensureStudentData(
  student: any
): void {

  student.timetable =
    student.timetable ?? [

      {
        period: '1',
        subject: 'Mathematics',
        time: '8:00 AM - 8:45 AM'
      },

      {
        period: '2',
        subject: 'English',
        time: '8:50 AM - 9:35 AM'
      },

      {
        period: '3',
        subject: 'Science',
        time: '9:45 AM - 10:30 AM'
      },

      {
        period: '4',
        subject: 'History',
        time: '10:45 AM - 11:30 AM'
      },

      {
        period: '5',
        subject: 'Computer Science',
        time: '11:40 AM - 12:25 PM'
      }

    ];

  student.homeworks =
    student.homeworks ?? [

      {
        subject:
          'Mathematics',

        task:
          'Complete exercise 5 from chapter 4'
      },

      {
        subject:
          'English',

        task:
          'Write a short story on environmental conservation'
      },

      {
        subject:
          'Science',

        task:
          'Prepare the volcano model for Friday'
      }

    ];

  student.performance =
    student.performance ?? {

      attendance:
        95,

      rank:
        'B+',

      grade:
        'A-'

    };

  student.marks =
    student.marks ?? {

      'Unit Test 1': [

        {
          subject:
            'Mathematics',

          score:
            88
        },

        {
          subject:
            'English',

          score:
            91
        },

        {
          subject:
            'Science',

          score:
            86
        }

      ],

      Quarterly: [

        {
          subject:
            'Mathematics',

          score:
            78
        },

        {
          subject:
            'English',

          score:
            84
        },

        {
          subject:
            'Science',

          score:
            80
        }

      ],

      'Half Yearly': [

        {
          subject:
            'Mathematics',

          score:
            85
        },

        {
          subject:
            'English',

          score:
            89
        },

        {
          subject:
            'Science',

          score:
            87
        }

      ],

      Annual: [

        {
          subject:
            'Mathematics',

          score:
            90
        },

        {
          subject:
            'English',

          score:
            92
        },

        {
          subject:
            'Science',

          score:
            91
        }

      ]

    };

}


// =========================================================
// VIEW STUDENT
// =========================================================

viewStudent(
  student: any
): void {

  this.selectedStudent =
    student;

}


// =========================================================
// GET MARKS
// =========================================================

getMarks(): any[] {

  return (
    this.selectedStudent
      ?.marks
      ?.[this.selectedExam]
  ) ?? [];

}


// =========================================================
// PROJECTS
// =========================================================

loadUserProjects(): void {
  const employeeId = Number(this.currentUserEmployeeId);
  if (!Number.isInteger(employeeId) || employeeId < 1) {
    this.userProjects = [];
    this.myProjects = [];
    this.userTasks = [];
    this.myTasks = [];
    this.calculateTaskProgress();
    this.calculateDashboardProgress();
    return;
  }

  forkJoin({
    projects: this.projectsService.getProjects(),
    tasks: this.taskService.getTasksByEmployeeId(employeeId)
  }).subscribe({
    next: ({ projects, tasks }: any) => {
      const projectList = Array.isArray(projects) ? projects : [];
      const taskList = Array.isArray(tasks) ? tasks : [];
      const projectsById = new Map<number, any>(
        projectList.map((project: any) => [
          Number(project.projectId ?? project.ProjectID),
          project
        ])
      );

      this.userTasks = taskList.map((task: any) => {
        const projectId = Number(task.projectId ?? task.ProjectID);
        const project = projectsById.get(projectId);
        return {
          id: task.taskId ?? task.TaskID,
          title: task.taskName ?? task.TaskName ?? '',
          project: project?.projectName ?? project?.ProjectName ?? '',
          status: task.status ?? task.Status ?? 'Pending',
          progress: Number(task.progress ?? task.Progress ?? 0)
        };
      });
      this.myTasks = this.userTasks;

      const assignedProjectIds = new Set(
        taskList.map((task: any) => Number(task.projectId ?? task.ProjectID))
      );
      const tasksByProject = new Map<number, any[]>();
      taskList.forEach((task: any) => {
        const projectId = Number(task.projectId ?? task.ProjectID);
        const projectTasks = tasksByProject.get(projectId) || [];
        projectTasks.push(task);
        tasksByProject.set(projectId, projectTasks);
      });

      this.userProjects = projectList
        .filter((project: any) => assignedProjectIds.has(Number(project.projectId ?? project.ProjectID)))
        .map((project: any) => {
          const projectId = Number(project.projectId ?? project.ProjectID);
          const projectTasks = tasksByProject.get(projectId) || [];
          const progress = projectTasks.length
            ? Math.round(projectTasks.reduce((total: number, task: any) => total + Number(task.progress ?? task.Progress ?? 0), 0) / projectTasks.length)
            : 0;

          return {
            id: projectId,
            name: project.projectName ?? project.ProjectName ?? '',
            description: project.description ?? project.Description ?? '',
            status: project.status ?? project.Status ?? 'Pending',
            progress,
            dueDate: project.endDate ?? project.EndDate ?? '',
            assignedTo: this.currentUserName
          };
        });
      this.myProjects = this.userProjects;
      this.calculateTaskProgress();
      this.calculateDashboardProgress();
    },
    error: (error) => {
      console.error('Unable to load employee projects and tasks:', error);
      this.userProjects = [];
      this.myProjects = [];
      this.userTasks = [];
      this.myTasks = [];
      this.calculateTaskProgress();
      this.calculateDashboardProgress();
    }
  });
}


// =========================================================
// TASKS
// =========================================================


// =========================================================
// TASK PROGRESS
// =========================================================

calculateTaskProgress(): void {

  this.completedTasks =
    this.userTasks.filter(
      (task: any) =>
        Number(
          task.progress ?? 0
        ) >= 100
    ).length;

  this.pendingTasks =
    this.userTasks.filter(
      (task: any) =>
        Number(
          task.progress ?? 0
        ) < 100
    ).length;

  if (
    !this.userTasks.length
  ) {

    this.taskCompletionPercentage =
      0;

    return;

  }

  const totalProgress =
    this.userTasks.reduce(
      (
        total: number,
        task: any
      ) => {

        return (
          total +
          Number(
            task.progress ?? 0
          )
        );

      },
      0
    );

  this.taskCompletionPercentage =
    Math.round(
      totalProgress /
      this.userTasks.length
    );

}


// =========================================================
// TASK STATUS
// =========================================================

getTaskStatus(
  task: any
): string {

  const progress =
    Number(
      task.progress ?? 0
    );

  if (
    progress >= 100
  ) {

    return 'Completed';

  }

  if (
    progress > 0
  ) {

    return `${progress}% Completed`;

  }

  return 'Not Started';

}


// =========================================================
// PROJECT STATUS
// =========================================================

getProjectStatus(
  project: any
): string {

  const progress =
    Number(
      project.progress ?? 0
    );

  if (
    progress >= 100
  ) {

    return 'Completed';

  }

  if (
    progress > 0
  ) {

    return 'In Progress';

  }

  return 'Not Started';

}


// =========================================================
// PIE CHART - DEPARTMENTS
// =========================================================

getDepartmentPieStyle(): any {

  if (
    !this.employeeDepartments ||
    !this.employeeDepartments.length
  ) {

    return {

      background:
        '#e9ecef',

      borderRadius:
        '50%',

      width:
        '220px',

      height:
        '220px',

      margin:
        '0 auto'

    };

  }

  let currentDeg =
    0;

  const stops:
    string[] = [];

  this.employeeDepartments.forEach(
    (item: any) => {

      const percent =
        Number(
          item.percentage ?? 0
        );

      const deg =
        (
          percent /
          100
        ) * 360;

      const nextDeg =
        currentDeg +
        deg;

      stops.push(
        `${item.color} ${currentDeg}deg ${nextDeg}deg`
      );

      currentDeg =
        nextDeg;

    }
  );

  if (
    currentDeg < 360 &&
    stops.length > 0
  ) {

    stops.push(
      `#e9ecef ${currentDeg}deg 360deg`
    );

  }

  return {

    background:
      `conic-gradient(${stops.join(', ')})`,

    borderRadius:
      '50%',

    width:
      '220px',

    height:
      '220px',

    margin:
      '0 auto'

  };

}


// =========================================================
// DONUT CHART
// =========================================================

getDonutStyle(): any {

  const slices =
    (
      this.applications ?? []
    )
    .filter(
      (application: any) =>
        application.name !==
        'Total'
    );

  if (
    !slices.length
  ) {

    return {

      background:
        '#e9ecef'

    };

  }

  let currentDeg =
    0;

  const stops:
    string[] = [];

  slices.forEach(
    (item: any) => {

      const percent =
        Number(
          item.percent ?? 0
        );

      const deg =
        (
          percent /
          100
        ) * 360;

      const nextDeg =
        currentDeg +
        deg;

      stops.push(
        `${item.color} ${currentDeg}deg ${nextDeg}deg`
      );

      currentDeg =
        nextDeg;

    }
  );

  if (
    currentDeg < 360 &&
    stops.length
  ) {

    stops.push(
      `#e9ecef ${currentDeg}deg 360deg`
    );

  }

  return {

    background:
      `conic-gradient(${stops.join(', ')})`

  };

}


// =========================================================
// CIRCLE STYLE
// =========================================================

getCircleStyle(
  percent: number,
  color: string
): any {

  const safePercent =
    Math.min(
      Math.max(
        Number(
          percent ?? 0
        ),
        0
      ),
      100
    );

  return {

    background:
      `conic-gradient(${color} 0% ${safePercent}%, #f1f1f1 ${safePercent}% 100%)`

  };

}


// =========================================================
// GET EMPLOYEE NAME
// =========================================================

getEmployeeName(
  employee: any
): string {

  return (

    employee?.FullName ??

    employee?.fullName ??

    employee?.Name ??

    employee?.name ??

    'Unknown Employee'

  );

}

getRecentActivityImage(activity: any): string {
  const activityEmployeeId = activity?.EmployeeID ?? activity?.employeeId ?? activity?.employeeID;
  const activityName = String(activity?.name ?? activity?.FullName ?? activity?.fullName ?? '').trim().toLowerCase();
  const employee = this.employee.find((item: any) => {
    const employeeId = item.EmployeeID ?? item.employeeId ?? item.EmployeeId ?? item.id;
    const employeeName = String(item.FullName ?? item.fullName ?? item.Name ?? item.name ?? '').trim().toLowerCase();

    return activityEmployeeId
      ? String(employeeId) === String(activityEmployeeId)
      : !!activityName && employeeName === activityName;
  });

  return employee?.EmployeePhoto || employee?.employeePhoto || employee?.image || 'assets/user1.jpg';
}


// =========================================================
// GET EMPLOYEE ROLE
// =========================================================

getEmployeeRole(
  employee: any
): string {

  return (

    employee?.RoleName ??

    employee?.roleName ??

    employee?.Role ??

    employee?.role ??

    employee?.Designation ??

    employee?.designation ??

    'Employee'

  );

}


// =========================================================
// GET EMPLOYEE ID
// =========================================================

getEmployeeId(
  employee: any
): any {

  return (

    employee?.EmployeeID ??

    employee?.employeeId ??

    employee?.EmployeeId ??

    employee?.id ??

    null

  );

}


// =========================================================
// GET LEAVE TYPE
// =========================================================

getLeaveType(
  leave: any
): string {

  return (

    leave?.LeaveType ??

    leave?.leaveType ??

    leave?.type ??

    'Leave'

  );

}


// =========================================================
// GET LEAVE STATUS
// =========================================================

getLeaveStatus(
  leave: any
): string {

  return (

    leave?.Status ??

    leave?.status ??

    'Pending'

  );

}


// =========================================================
// GET LEAVE START DATE
// =========================================================

getLeaveStartDate(
  leave: any
): any {

  return (

    leave?.StartDate ??

    leave?.startDate ??

    null

  );

}


// =========================================================
// GET LEAVE END DATE
// =========================================================

getLeaveEndDate(
  leave: any
): any {

  return (

    leave?.EndDate ??

    leave?.endDate ??

    null

  );

}


// =========================================================
// ROLE-SPECIFIC DASHBOARD DESCRIPTION
// =========================================================

getRoleDescription(): string {

  switch (this.role) {

    case 'Super Admin':

      return 'Manage the complete organization, administrators, employees, roles, departments, salaries, leaves, projects and system settings.';

    case 'Administrator':

      return 'Manage employees, roles, salaries, leaves, projects and company operations.';

    case 'HR Manager':

      return 'Manage employees, leave requests, HR operations and employee records.';

    case 'Project Manager':

      return 'Manage projects, teams, tasks and project progress.';

    case 'Team Lead':

      return 'Manage your team members, projects and assigned tasks.';

    case 'Software Developer':

      return 'Track your projects, development tasks and leaves.';

    case 'UI/UX Designer':

      return 'Track your design projects, tasks, manager and leaves.';

    case 'QA Engineer':

      return 'Track testing projects, QA tasks and work progress.';

    case 'DevOps Engineer':

      return 'Track infrastructure projects, DevOps tasks and work progress.';

    case 'Accountant':

      return 'Manage employee and accounting-related information.';

    case 'Receptionist':

      return 'Manage employees, events, leaves and daily reception tasks.';

    case 'Support Executive':

      return 'Track support tasks, manager and leave information.';

    case 'IT Manager':

      return 'Manage IT employees, projects, technical tasks and teams.';

    case 'Finance Manager':

      return 'Manage salaries, employees and finance-related operations.';

    case 'Administration Manager':

      return 'Manage administration employees, roles, leaves and tasks.';

    case 'Sales Manager':

      return 'Manage sales team, projects, employees and sales tasks.';

    case 'Marketing Manager':

      return 'Manage marketing team, campaigns, projects and tasks.';

    case 'Operations Manager':

      return 'Manage operations team, projects and operational tasks.';

    case 'Customer Support Manager':

      return 'Manage customer support team, projects and support tasks.';

    case 'R&D Manager':

      return 'Manage research and development teams, projects and tasks.';

    case 'Training Manager':

      return 'Manage employee training, teams and training projects.';

    case 'Product Owner':

      return 'Manage product projects, requirements, teams and priorities.';

    case 'Scrum Master':

      return 'Manage sprint activities, teams, tasks and project progress.';

    case 'Business Analyst':

      return 'Manage business requirements, projects and assigned tasks.';

    case 'Project Coordinator':

      return 'Coordinate projects, teams, schedules and assigned tasks.';

    case 'Technical Lead':

      return 'Manage technical teams, development projects and technical tasks.';

    default:

      return 'Manage your work, projects, tasks and employee information.';

  }

}


// =========================================================
// DASHBOARD PROGRESS
// =========================================================

calculateDashboardProgress(): void {

  // =======================================================
  // PROJECTS
  // =======================================================

  this.totalProjects =
    this.userProjects?.length ?? 0;

  this.completedProjects =
    this.userProjects.filter(
      (project: any) => {

        const status =
          (
            project.status ??
            project.Status ??
            project.projectStatus ??
            ''
          )
          .toString()
          .toLowerCase();

        return (

          status ===
          'completed' ||

          status ===
          'complete' ||

          status ===
          'done'

        );

      }
    ).length;

  this.pendingProjects =
    Math.max(
      this.totalProjects -
      this.completedProjects,
      0
    );

  // =======================================================
  // TASKS
  // =======================================================

  this.totalTasks =
    this.myTasks?.length ?? 0;

  this.completedTasks =
    this.myTasks.filter(
      (task: any) => {

        const status =
          (
            task.status ??
            task.Status ??
            task.taskStatus ??
            ''
          )
          .toString()
          .toLowerCase();

        return (

          status ===
          'completed' ||

          status ===
          'complete' ||

          status ===
          'done'

        );

      }
    ).length;

  this.pendingTasks =
    Math.max(
      this.totalTasks -
      this.completedTasks,
      0
    );

  // =======================================================
  // PROJECT / TASK PROGRESS
  // =======================================================

  if (
    this.totalProjects > 0
  ) {

    this.teamProgress =
      Math.round(
        (
          this.completedProjects /
          this.totalProjects
        ) * 100
      );

  } else if (
    this.totalTasks > 0
  ) {

    this.teamProgress =
      Math.round(
        (
          this.completedTasks /
          this.totalTasks
        ) * 100
      );

  } else {

    this.teamProgress =
      0;

  }

  // =======================================================
  // TRAINING
  // =======================================================

  const trainingTasks =
    this.myTasks.filter(
      (task: any) => {

        const type =
          (
            task.type ??
            task.taskType ??
            task.category ??
            ''
          )
          .toString()
          .toLowerCase();

        return type.includes(
          'training'
        );

      }
    );

  if (
    trainingTasks.length > 0
  ) {

    const completed =
      trainingTasks.filter(
        (task: any) => {

          const status =
            (
              task.status ??
              task.Status ??
              ''
            )
            .toString()
            .toLowerCase();

          return (

            status ===
            'completed' ||

            status ===
            'complete' ||

            status ===
            'done'

          );

        }
      ).length;

    this.completedTraining =
      Math.round(
        (
          completed /
          trainingTasks.length
        ) * 100
      );

  } else {

    this.completedTraining =
      0;

  }

}

// =========================================================
// DEPARTMENT OVERVIEW
// Computes per-department: manager name, team leads, upcoming leaves
// =========================================================

computeDepartmentOverview(
  employees: any[],
  leaves: any[]
): void {
  if (!Array.isArray(employees)) {
    this.departmentOverview = [];
    return;
  }

  // Group employees by DepartmentName
  const deptMap: Record<string, any[]> = {};
  employees.forEach((emp: any) => {
    const deptName = emp.DepartmentName ?? emp.departmentName ?? emp.department ?? 'Other';
    if (!deptMap[deptName]) deptMap[deptName] = [];
    deptMap[deptName].push(emp);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.departmentOverview = Object.entries(deptMap).map(([deptName, emps]) => {
    // Manager: role with IsManager flag or 'manager' in role name
    const manager = emps.find((e: any) => {
      const role = (e.RoleName ?? e.roleName ?? e.Role ?? e.role ?? '').toLowerCase();
      return role === 'manager' || role.includes('manager');
    });

    // Team leads in department
    const teamLeads = emps.filter((e: any) => {
      const role = (e.RoleName ?? e.roleName ?? e.Role ?? e.role ?? '').toLowerCase();
      return role === 'team lead';
    });

    // Upcoming approved/pending leaves for department members
    const empIds = new Set(emps.map((e: any) => String(e.EmployeeID ?? e.employeeId ?? e.EmployeeId ?? e.id)));
    const upcomingDeptLeaves = (Array.isArray(leaves) ? leaves : [])
      .filter((leave: any) => {
        const startValue = leave.StartDate ?? leave.startDate;
        if (!startValue) return false;
        const start = new Date(startValue);
        const status = (leave.Status ?? leave.status ?? '').toLowerCase();
        const empId = String(leave.EmployeeID ?? leave.employeeId ?? '');
        return start >= today && status === 'approved' && empIds.has(empId);
      })
      .map((leave: any) => ({
        name: leave.ApplicantName ?? leave.applicantName ?? 'Unknown',
        date: new Date(leave.StartDate ?? leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: leave.LeaveType ?? leave.leaveType ?? 'Leave',
        status: leave.Status ?? leave.status ?? 'Pending'
      }))
      .slice(0, 5);

    return {
      departmentName: deptName,
      managerName: manager ? (manager.FullName ?? manager.fullName ?? manager.Name ?? 'Not Assigned') : 'Not Assigned',
      teamLeads: teamLeads.map((tl: any) => tl.FullName ?? tl.fullName ?? tl.Name ?? 'Unknown'),
      upcomingLeaves: upcomingDeptLeaves
    };
  });
}
}