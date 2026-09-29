import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../services/projects.service';
import { TaskService } from '../services/task.service';
import { TimesheetService } from '../services/timesheet.service';
import { EmployeeService } from '../services/employee.service';
import { ToastService } from '../services/toast.service';
import { JiraserviceService } from '../services/jiraservice.service';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.css']
})
export class TimeSheetComponent implements OnInit {
  projects: any[] = [];
  employees: any[] = [];
  selectedProject: any = null;
  selectedTasks: any[] = [];
  timesheetLogs: any[] = [];
  currentUser: any = null;

  // Filter & Search
  activeFilter: string = 'ALL';
  searchTerm: string = '';
  showLogsModal: boolean = false;
  selectedTaskForLogs: any = null;

  // Summary Metrics
  totalTasks = 0;
  completed = 0;
  progress = 0;
  ToDo = 0;
  totalHoursLogged = 0;
  completionPercentage = 0;

  // Timer
  timer: any = null;
  currentTask: any = null;

  constructor(
    private projectService: ProjectsService,
    private taskService: TaskService,
    private timesheetService: TimesheetService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private jiraService: JiraserviceService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );
    this.loadEmployees();
    this.loadProjects();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps || [];
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  getEmployeeName(empId: any): string {
    if (!empId) return 'Unassigned';

    if (typeof empId === 'string' && isNaN(Number(empId))) {
      return empId;
    }

    const employee = this.employees.find(
      (emp: any) => Number(emp.EmployeeID || emp.employeeID || emp.id) === Number(empId)
    );
    return employee ? (employee.FullName || employee.fullName || 'Unknown') : 'Unassigned';
  }

  getEmployeeInitials(empId: any): string {
    const name = this.getEmployeeName(empId);
    if (!name || name === 'Unassigned') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  loadProjects(): void {
    this.jiraService.getProjects({ maxResults: 100, orderBy: 'name' }).subscribe({
      next: (response: any) => {
        const jiraProjects = response?.values || response || [];
        this.projects = jiraProjects.map((project: any) => ({
          projectId: Number(project.id) || project.id,
          jiraId: project.id,
          jiraKey: project.key,
          projectName: project.name,
          description: project.description,
          status: 'Active'
        }));
      },
      error: (err) => {
        console.error('Error loading Jira projects:', err);
        this.projectService.getProjects().subscribe({
          next: (data: any) => this.projects = data || [],
          error: (fallbackErr) => console.error('Error loading projects:', fallbackErr)
        });
      }
    });
  }

  selectProject(project: any): void {
    this.selectedProject = project;
    this.searchTerm = '';
    this.activeFilter = 'ALL';
    this.loadProjectData(project.projectId);
  }

  loadProjectData(projectId: number): void {
    if (this.selectedProject?.jiraKey) {
      this.loadJiraProjectData(this.selectedProject.jiraKey);
      return;
    }

    this.taskService.getTasksByProjectId(projectId).subscribe({
      next: (tasks: any) => {
        this.selectedTasks = tasks || [];
        this.loadLoggedTimesheetsForProject(projectId);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.selectedTasks = [];
        this.calculateSummary();
      }
    });
  }

  private loadJiraProjectData(projectKey: string): void {
    this.jiraService.getIssuesByProject(projectKey, 100).subscribe({
      next: (response: any) => {
        const issues = response?.issues || [];
        this.selectedTasks = issues.map((issue: any) => {
          const fields = issue.fields || {};
          const worklogs = fields.worklog?.worklogs || [];
          const loggedSeconds = Number(fields.timespent || 0);

          return {
            taskId: issue.id,
            jiraKey: issue.key,
            taskName: fields.summary || issue.key,
            description: fields.description,
            status: fields.status?.name || 'To Do',
            jiraStatus: fields.status?.name || 'To Do',
            jiraStatusCategory: fields.status?.statusCategory?.key || fields.status?.statusCategory?.name,
            assignedTo: fields.assignee?.displayName,
            dueDate: fields.duedate,
            hours: loggedSeconds / 3600,
            taskLogs: worklogs.map((worklog: any) => ({
              timesheetId: `${issue.key}-${worklog.id}`,
              taskId: issue.id,
              loggedHours: Number(worklog.timeSpentSeconds || 0) / 3600,
              LoggedDate: worklog.started,
              Description: worklog.comment
            }))
          };
        });
        this.timesheetLogs = this.selectedTasks.reduce(
          (logs: any[], task: any) => logs.concat(task.taskLogs || []), []
        );
        this.calculateSummary();
      },
      error: (err) => {
        console.error('Error loading Jira issues:', err);
        this.selectedTasks = [];
        this.timesheetLogs = [];
        this.calculateSummary();
      }
    });
  }

  loadLoggedTimesheetsForProject(projectId: number): void {
    this.timesheetService.getTimesheetsByProject(projectId).subscribe({
      next: (logs) => {
        this.timesheetLogs = logs || [];
        this.mapTimesheetsToTasks();
        this.calculateSummary();
      },
      error: (err) => {
        console.error('Error loading project timesheets:', err);
        // Fallback to employee logs if project logs endpoint had issue
        const empId = Number(this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0);
        if (empId) {
          this.timesheetService.getTimesheetsByEmployee(empId).subscribe({
            next: (empLogs) => {
              this.timesheetLogs = empLogs || [];
              this.mapTimesheetsToTasks();
              this.calculateSummary();
            },
            error: () => this.calculateSummary()
          });
        } else {
          this.calculateSummary();
        }
      }
    });
  }

  mapTimesheetsToTasks(): void {
    this.selectedTasks.forEach(task => {
      const taskLogs = this.timesheetLogs.filter(
        log => Number(log.taskId || log.TaskID) === Number(task.taskId || task.TaskID)
      );
      task.hours = taskLogs.reduce((sum, log) => sum + Number(log.loggedHours || log.LoggedHours || 0), 0);
      task.taskLogs = taskLogs;
    });
  }

  closeTasks(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.selectedProject = null;
    this.selectedTasks = [];
    this.timesheetLogs = [];
    this.totalTasks = 0;
    this.completed = 0;
    this.progress = 0;
    this.ToDo = 0;
    this.totalHoursLogged = 0;
    this.completionPercentage = 0;
    this.currentTask = null;
    this.searchTerm = '';
    this.activeFilter = 'ALL';
  }

  /**
   * Normalizes backend task statuses into 3 standardized UI categories:
   * - "To Do": not started in development (e.g., Pending, To Do, Assigned, Backlog, Idea, Progress = 0)
   * - "In Progress": started in development / ongoing (e.g., Development, In Progress, QA, Testing, Sprint Review, Progress 1-99)
   * - "Completed": finished (e.g., Completed, Done, Closed, Progress = 100)
   */
  getNormalizedStatus(task: any): 'To Do' | 'In Progress' | 'Completed' {
    if (!task) return 'To Do';
    
    // If timer is running or paused on this task, it is actively in progress
    if (task.running || task.paused) {
      return 'In Progress';
    }

    const rawStatus = (task.jiraStatus || task.status || task.Status || '').toString().trim().toLowerCase();
    const jiraCategory = (task.jiraStatusCategory || '').toString().trim().toLowerCase();
    const progressNum = Number(task.progress ?? task.Progress);

    if (task.jiraKey) {
      if (jiraCategory === 'done' || jiraCategory === 'complete') {
        return 'Completed';
      }
      if (jiraCategory === 'indeterminate' || jiraCategory === 'in progress') {
        return 'In Progress';
      }
      return 'To Do';
    }

    // Completed checks
    if (['completed', 'done', 'closed', 'approved'].includes(rawStatus) || progressNum === 100) {
      return 'Completed';
    }

    // In Progress checks (started in development)
    if (
      ['in progress', 'development', 'in development', 'qa', 'testing', 'qa failed', 'sprint review', 'in review', 'review'].includes(rawStatus) ||
      (progressNum > 0 && progressNum < 100)
    ) {
      return 'In Progress';
    }

    // Otherwise it is not started in development -> To Do
    return 'To Do';
  }

  isJiraTask(task: any): boolean {
    return Boolean(task?.jiraKey);
  }

  getTaskStatusLabel(task: any): string {
    return this.isJiraTask(task)
      ? task.jiraStatus
      : this.getNormalizedStatus(task);
  }

  calculateSummary(): void {
    this.totalTasks = this.selectedTasks.length;
    this.completed = this.selectedTasks.filter(t => this.getNormalizedStatus(t) === 'Completed').length;
    this.progress = this.selectedTasks.filter(t => this.getNormalizedStatus(t) === 'In Progress').length;
    this.ToDo = this.selectedTasks.filter(t => this.getNormalizedStatus(t) === 'To Do').length;
    
    this.totalHoursLogged = +(this.selectedTasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0)).toFixed(2);
    this.completionPercentage = this.totalTasks > 0 ? Math.round((this.completed / this.totalTasks) * 100) : 0;
  }

  get filteredTasks(): any[] {
    return this.selectedTasks.filter(task => {
      const normalizedStatus = this.getNormalizedStatus(task);
      const matchesFilter =
        this.activeFilter === 'ALL' ||
        (this.activeFilter === 'TODO' && normalizedStatus === 'To Do') ||
        (this.activeFilter === 'IN_PROGRESS' && normalizedStatus === 'In Progress') ||
        (this.activeFilter === 'COMPLETED' && normalizedStatus === 'Completed');

      const matchesSearch =
        !this.searchTerm ||
        (task.taskName || task.TaskName || task.Title || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getEmployeeName(task.assignedTo || task.AssignedTo).toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  // Timer Controls
  startTimer(task: any): void {
    if (this.currentTask && this.currentTask !== task) {
      this.toastService.showError('Please stop the currently running task first.');
      return;
    }

    this.currentTask = task;
    task.running = true;
    task.paused = false;

    if (!task.elapsedTime) {
      task.elapsedTime = 0;
    }

    task.startTime = Date.now();

    this.timer = setInterval(() => {
      const now = Date.now();
      task.elapsedTime += (now - task.startTime);
      task.startTime = now;
    }, 1000);
  }

  pauseTimer(task: any): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    task.running = false;
    task.paused = true;
  }

  resumeTimer(task: any): void {
    this.startTimer(task);
  }

  stopTimer(task: any): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    task.running = false;
    task.paused = false;
    this.currentTask = null;

    const loggedHours = +(task.elapsedTime / 3600000).toFixed(2);
    if (loggedHours < 0.01) {
      this.toastService.showError('Logged time is too short to save (less than 1 minute).');
      task.elapsedTime = 0;
      return;
    }

    const empId = Number(this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0);
    const logPayload = {
      TaskID: task.taskId || task.TaskID,
      EmployeeID: empId,
      LoggedHours: loggedHours,
      LoggedDate: new Date().toISOString().split('T')[0],
      Description: `Tracked time for: ${task.taskName || task.TaskName || task.Title}`
    };

    this.timesheetService.addTimesheet(logPayload).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || `Successfully logged ${loggedHours} hrs.`);
        task.elapsedTime = 0;
        this.loadProjectData(this.selectedProject.projectId);
      },
      error: (err) => {
        console.error('Error logging hours:', err);
        this.toastService.showError('Failed to log hours.');
      }
    });
  }

  logManualTime(task: any, hoursVal: string, note?: string): void {
    const loggedHours = parseFloat(hoursVal);
    if (isNaN(loggedHours) || loggedHours <= 0) {
      this.toastService.showError('Please enter a valid number of hours.');
      return;
    }

    const empId = Number(this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0);
    const logPayload = {
      TaskID: task.taskId || task.TaskID,
      EmployeeID: empId,
      LoggedHours: loggedHours,
      LoggedDate: new Date().toISOString().split('T')[0],
      Description: note || `Manual time log: ${task.taskName || task.TaskName || task.Title}`
    };

    this.timesheetService.addTimesheet(logPayload).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message || `Successfully logged ${loggedHours} hrs.`);
        
        this.loadProjectData(this.selectedProject.projectId);
      },
      error: (err) => {
        console.error('Error logging manual hours:', err);
        this.toastService.showError('Failed to log manual hours.');
      }
    });
  }

  deleteTimesheetLog(logId: number): void {
    if (!confirm('Are you sure you want to delete this timesheet entry?')) {
      return;
    }

    this.timesheetService.deleteTimesheet(logId).subscribe({
      next: () => {
        this.toastService.showSuccess('Timesheet entry deleted successfully.');
        this.loadProjectData(this.selectedProject.projectId);
      },
      error: (err) => {
        console.error('Error deleting timesheet:', err);
        this.toastService.showError('Failed to delete timesheet entry.');
      }
    });
  }

  viewTaskLogs(task: any): void {
    this.selectedTaskForLogs = task;
    this.showLogsModal = true;
  }

  closeLogsModal(): void {
    this.selectedTaskForLogs = null;
    this.showLogsModal = false;
  }

  formatTime(milliseconds: number): string {
    if (!milliseconds) return '00:00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  getStatusBadgeClass(task: any): string {
    const norm = this.getNormalizedStatus(task);
    switch (norm) {
      case 'Completed':
        return 'badge-completed';
      case 'In Progress':
        return 'badge-inprogress';
      case 'To Do':
      default:
        return 'badge-todo';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch ((priority || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
      default:
        return 'priority-low';
    }
  }
}

