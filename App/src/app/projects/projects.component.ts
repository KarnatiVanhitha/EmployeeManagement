import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectsService } from '../services/projects.service';
import { ToastService } from '../services/toast.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  // =======================================================
  // USER / PROJECT DATA
  // =======================================================

  currentUser: any = null;

  selectedProject: any = null;

  selectedProjectId: number = 0;

  openedProjectId: number | null = null;

  // =======================================================
  // DATA ARRAYS
  // =======================================================

  employees: any[] = [];

  managers: any[] = [];

  projects: any[] = [];

  jiraIssueTypes: string[] = [];

  tasks: any[] = [];

  useCases: any[] = [];

  sprints: any[] = [];

  reqemployees: any[] = [];

  departmentTeamLeads: any[] = [];

  departmentEmployees: any[] = [];

  // =======================================================
  // DEPARTMENT DATA
  // =======================================================

  selectedManagerDepartmentId: number | null = null;

  // =======================================================
  // LOGIN DETAILS
  // =======================================================

  managerId: number | null = null;

  userRole: string = '';

  // =======================================================
  // UI STATES
  // =======================================================

  showProjectForm = false;

  showTaskForm = false;

  showUseCaseForm = false;

  showSprintForm = false;

  scrumStages: string[] = [
    'PENDING',
    'DEVELOPMENT',
    'QA',
    'SPRINT REVIEW',
    'COMPLETED'
  ];

  // =======================================================
  // PROJECT STATUS
  // =======================================================

  projectStatuses: string[] = [
    'Active',
    'On Hold',
    'Completed',
    'Cancelled'
  ];

  // =======================================================
  // PROJECT FORM
  // =======================================================

  projectForm = {

    title: '',

    description: '',

    startDate: '',

    endDate: '',

    // OPTIONAL
    // Project Manager can create project
    // without assigning manager.
    assignedTo: '',

    priority: 'Medium',

    budget: 0,

    status: 'Active'
  };

  // =======================================================
  // USE CASE FORM
  // =======================================================

  useCaseForm: any = {

    Title: '',

    UseCaseType: 'Epic',

    Description: '',

    Priority: 'Medium',

    Status: 'Created'
  };

  // =======================================================
  // SPRINT FORM
  // =======================================================

  sprintForm: any = {

    SprintName: '',

    SprintGoal: '',

    StartDate: '',

    EndDate: '',

    Status: 'Planned',

    // Selected Use Case
    UseCaseID: ''
  };

  // =======================================================
  // TASK FORM
  // =======================================================

  taskForm = {

    TicketTitle: '',

    Description: '',

    SprintID: '',

    // Scrum Master assigns Team Lead
    TeamLeadID: '',

    // Team Lead assigns employee later
    AssignedTo: '',

    TaskType: 'Story',

    StartDate: '',

    DueDate: '',

    Status: 'Pending',

    Priority: 'Medium',

    Progress: 0
  };

  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(
    private http: HttpClient,
    private projectservice: ProjectsService,
    private toastService: ToastService
  ) {}

  // =======================================================
  // INITIALIZE
  // =======================================================

  ngOnInit(): void {

    this.loadLoggedInUser();

    if (!this.currentUser) {
      return;
    }

    this.loadEmployees();

    this.loadProjects();

    this.loadJiraIssueTypes();

    this.loadManagers();
  }

  scrollStageTasks(stageIndex: number, direction: 'left' | 'right'): void {
    const container = document.getElementById(`scrumStageTasks-${stageIndex}`);

    if (!container) {
      return;
    }

    const scrollAmount = 280;
    const nextScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: nextScroll,
      behavior: 'smooth'
    });
  }

  loadJiraIssueTypes(): void {
    this.projectservice.getJiraIssueTypes().subscribe({
      next: (types: any[]) => {
        const names = Array.isArray(types)
          ? types.map((type: any) => type?.name).filter(Boolean)
          : [];

        this.jiraIssueTypes = names;
      },
      error: (error: any) => {
        console.error('ERROR LOADING JIRA ISSUE TYPES:', error);
        this.jiraIssueTypes = [];
        this.toastService.showError(
          error?.error?.message || 'Failed to load Jira issue types.'
        );
      }
    });
  }

  getUseCaseIssueTypes(): string[] {
    return this.jiraIssueTypes.filter((type) => type.toLowerCase() === 'epic');
  }

  getTaskIssueTypes(): string[] {
    return this.jiraIssueTypes.filter((type) =>
      ['story', 'task', 'bug'].includes(type.toLowerCase())
    );
  }

  // =======================================================
  // LOAD LOGGED-IN USER
  // =======================================================

  loadLoggedInUser(): void {

    const storedUser =
      localStorage.getItem('loggedInUser');

    console.log(
      'CURRENT USER RAW:',
      storedUser
    );

    if (!storedUser) {

      console.error(
        'loggedInUser not found in localStorage'
      );

      this.toastService.showError(
        'User information not found. Please login again.'
      );

      return;
    }

    try {

      this.currentUser =
        JSON.parse(storedUser);

      console.log(
        'CURRENT USER:',
        this.currentUser
      );

    } catch (error) {

      console.error(
        'Invalid loggedInUser JSON:',
        error
      );

      this.toastService.showError(
        'Invalid user information. Please login again.'
      );

      this.currentUser = null;

      return;
    }

    // =====================================================
    // ROLE
    // =====================================================

    this.userRole = (
      localStorage.getItem('role') ||
      this.currentUser?.RoleName ||
      this.currentUser?.Role ||
      this.currentUser?.role ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase();

    console.log(
      'LOGGED-IN ROLE:',
      this.userRole
    );

    // =====================================================
    // EMPLOYEE ID
    // =====================================================

    const employeeId =
      this.currentUser?.EmployeeID ??
      this.currentUser?.employeeID ??
      this.currentUser?.EmployeeId ??
      this.currentUser?.EMPLOYEEID ??
      this.currentUser?.id ??
      this.currentUser?.Id ??
      this.currentUser?.user?.EmployeeID ??
      this.currentUser?.user?.employeeId ??
      this.currentUser?.user?.id;

    const numericEmployeeId =
      Number(employeeId);

    console.log(
      'EMPLOYEE ID FOUND:',
      employeeId
    );

    console.log(
      'NUMERIC EMPLOYEE ID:',
      numericEmployeeId
    );

    if (
      employeeId !== undefined &&
      employeeId !== null &&
      employeeId !== '' &&
      Number.isInteger(numericEmployeeId) &&
      numericEmployeeId > 0
    ) {
      this.managerId = numericEmployeeId;
    } else {
      this.managerId = null;
    }

    console.log(
      'LOGGED-IN EMPLOYEE ID:',
      this.managerId
    );
  }

  // =======================================================
  // LOAD EMPLOYEES
  // =======================================================

  loadEmployees(): void {

    this.http
      .get<any[]>(
        'http://localhost:3000/api/employees'
      )
      .subscribe({

        next: (data) => {

          console.log(
            'EMPLOYEES FROM DATABASE:',
            data
          );

          this.employees =
            Array.isArray(data)
              ? data.map((employee: any) => ({

                  ...employee,

                  EmployeeID:
                    employee.EmployeeID ??
                    employee.employeeID ??
                    employee.EmployeeId ??
                    employee.employeeId,

                  DepartmentID:
                    employee.DepartmentID ??
                    employee.departmentID ??
                    employee.departmentId,

                  RoleName:
                    employee.RoleName ??
                    employee.roleName ??
                    employee.Role ??
                    employee.role ??
                    '',

                  FullName:
                    employee.FullName ??
                    employee.fullName ??
                    employee.Name ??
                    employee.name ??
                    ''

                }))
              : [];

          console.log(
            'NORMALIZED EMPLOYEES:',
            this.employees
          );

          localStorage.setItem(
            'employees',
            JSON.stringify(this.employees)
          );

        },

        error: (error) => {

          console.error(
            'ERROR FETCHING EMPLOYEES:',
            error
          );

          console.error(
            'BACKEND ERROR:',
            error.error
          );

          this.employees = [];

          this.toastService.showError(
            'Failed to load employees.'
          );
        }
      });
  }

  // =======================================================
  // LOAD PROJECTS
  // =======================================================

  loadProjects(): void {

    forkJoin({
      projects: this.projectservice.getJiraProjects(),
      spaces: this.projectservice.getJiraSpaces().pipe(
        catchError((error) => {
          console.error('ERROR LOADING JIRA SPACES:', error);
          return of({ values: [] });
        })
      )
    })
      .subscribe({

        next: ({ projects: projectData, spaces: spaceData }) => {

          console.log(
            'PROJECTS FROM JIRA:',
            projectData
          );

          const jiraProjects = Array.isArray(projectData)
            ? projectData
            : Array.isArray(projectData?.values)
              ? projectData.values
              : [];

          const jiraSpaces = Array.isArray(spaceData)
            ? spaceData
            : Array.isArray(spaceData?.values)
              ? spaceData.values
              : [];

          const spacesByKey = new Map<string, any>(
            jiraSpaces
              .filter((space: any) => space?.key)
              .map((space: any) => [space.key.toUpperCase(), space])
          );

          this.projects =
            jiraProjects.map((jiraProject: any) => {
              const description = this.getJiraDescription(jiraProject.description);
              const matchingSpace = spacesByKey.get(
                String(jiraProject.key || '').toUpperCase()
              );

              return {

                  ...jiraProject,

                  ProjectID: jiraProject.id,

                  projectId: jiraProject.id,

                  projectKey: jiraProject.key,

                  spaceName:
                    matchingSpace?.name ||
                    jiraProject.name ||
                    jiraProject.key,

                  projectName:
                    jiraProject.name ||
                    jiraProject.key,

                  ProjectName:
                    jiraProject.name ||
                    jiraProject.key,

                  description,

                  Description: description,

                  Status:
                    'Active',

                  status:
                    'Active',

                  Priority:
                    'Medium',

                  priority:
                    'Medium',

                  StartDate: undefined,

                  startDate: undefined,

                  EndDate: undefined,

                  endDate: undefined,

                  ManagerName: '',

                  managerName: ''
              };
            });

          console.log(
            'NORMALIZED JIRA PROJECTS:',
            this.projects
          );

          if (this.projects.length > 0) {
            this.toastService.showSuccess(
              `${this.projects.length} Jira project${this.projects.length === 1 ? '' : 's'} loaded successfully.`
            );
          } else {
            this.toastService.showError(
              'No Jira projects were returned. Check the Jira account, API token, and project permissions.'
            );
          }
        },

        error: (error) => {

          console.error(
            'ERROR LOADING JIRA PROJECTS:',
            error
          );

          this.projects = [];

          this.toastService.showError(
            error?.error?.message ||
            'Failed to load Jira projects.'
          );
        }
      });
  }

  private getJiraDescription(description: any): string {
    if (typeof description === 'string') {
      return description;
    }

    const text: string[] = [];

    const visit = (node: any): void => {
      if (Array.isArray(node)) {
        node.forEach(visit);
      } else if (node?.type === 'text' && node.text) {
        text.push(node.text);
      } else if (node?.content) {
        visit(node.content);
      }
    };

    visit(description);

    return text.join(' ').trim();
  }

  // =======================================================
  // LOAD MANAGERS
  // =======================================================

  loadManagers(): void {

    this.projectservice
      .getManagers()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'MANAGERS:',
            data
          );

          this.managers =
            Array.isArray(data)
              ? data.map((manager: any) => ({

                  ...manager,

                  EmployeeID:
                    manager.EmployeeID ??
                    manager.employeeID ??
                    manager.EmployeeId,

                  DepartmentID:
                    manager.DepartmentID ??
                    manager.departmentID ??
                    manager.departmentId,

                  FullName:
                    manager.FullName ??
                    manager.fullName ??
                    manager.employeeName ??
                    manager.Name ??
                    manager.name ??
                    '',

                  employeeName:
                    manager.employeeName ??
                    manager.FullName ??
                    manager.fullName ??
                    manager.name ??
                    '',

                  DepartmentName:
                    manager.DepartmentName ??
                    manager.departmentName ??
                    '',

                  departmentName:
                    manager.departmentName ??
                    manager.DepartmentName ??
                    ''

                }))
              : [];

        },

        error: (error: any) => {

          console.error(
            'FAILED TO LOAD MANAGERS:',
            error
          );

          this.managers = [];

          this.toastService.showError(
            error?.error?.message ||
            'Failed to load project managers.'
          );
        }
      });
  }

  // =======================================================
  // GET DEPARTMENT ID
  // =======================================================

  getDepartmentId(person: any): number | null {

    const departmentId =
      person?.DepartmentID ??
      person?.departmentID ??
      person?.departmentId ??
      person?.DepartmentId;

    const id =
      Number(departmentId);

    return (
      Number.isInteger(id) &&
      id > 0
    )
      ? id
      : null;
  }

  // =======================================================
  // GET EMPLOYEE ID
  // =======================================================

  getEmployeeId(person: any): number | null {

    const employeeId =
      person?.EmployeeID ??
      person?.employeeID ??
      person?.EmployeeId ??
      person?.employeeId;

    const id =
      Number(employeeId);

    return (
      Number.isInteger(id) &&
      id > 0
    )
      ? id
      : null;
  }

  // =======================================================
  // GET ROLE
  // =======================================================

  getRole(person: any): string {

    return (
      person?.RoleName ??
      person?.roleName ??
      person?.Role ??
      person?.role ??
      person?.Designation ??
      person?.designation ??
      ''
    )
      .toString()
      .trim()
      .toLowerCase();
  }

  // =======================================================
  // CHECK PROJECT MANAGER (CAN ADD PROJECT)
  // =======================================================

  canAddProject(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    if (this.isTeamLead() || role.includes('lead') || role.includes('scrum')) {
      return false;
    }
    return (
      role === 'project manager' ||
      role.includes('project manager') ||
      role === 'admin'
    );
  }

  // =======================================================
  // CHECK CAN ASSIGN MANAGER
  // =======================================================

  canAssignManager(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    if (this.isTeamLead() || role.includes('lead') || role.includes('scrum') || role === 'manager') {
      return false;
    }
    return (
      role === 'project manager' ||
      role.includes('project manager') ||
      role === 'admin'
    );
  }

  // =======================================================
  // CHECK MANAGER ASSIGNED
  // =======================================================

  isProjectManagerAssigned(
    project: any
  ): boolean {

    const managerId =
      project?.ManagerID ??
      project?.managerID ??
      project?.managerId;

    return (
      managerId !== null &&
      managerId !== undefined &&
      Number(managerId) > 0
    );
  }

  // =======================================================
  // GET MANAGER FOR PROJECT
  // =======================================================

  getManagerForProject(
    project: any
  ): any | null {

    const managerId =
      Number(
        project?.ManagerID ??
        project?.managerID ??
        project?.managerId
      );

    if (!managerId) {
      return null;
    }

    let found = this.managers.find(
      (manager: any) =>
        this.getEmployeeId(manager) ===
        managerId
    );

    if (!found) {
      found = this.employees.find(
        (emp: any) =>
          this.getEmployeeId(emp) ===
          managerId
      );
    }

    return found || null;
  }

  // =======================================================
  // CHECK MANAGER OWNS PROJECT
  // =======================================================

  isCurrentManagerForProject(
    project: any
  ): boolean {

    const projectManagerId =
      Number(
        project?.ManagerID ??
        project?.managerID ??
        project?.managerId
      );

    const currentEmployeeId =
      this.managerId ||
      Number(
        this.currentUser?.EmployeeID ??
        this.currentUser?.employeeID ??
        this.currentUser?.EmployeeId ??
        this.currentUser?.EMPLOYEEID ??
        this.currentUser?.id ??
        this.currentUser?.Id
      );

    if (
      !projectManagerId ||
      !currentEmployeeId
    ) {
      return false;
    }

    return (
      projectManagerId ===
      currentEmployeeId
    );
  }

  // =======================================================
  // MANAGER CAN CREATE USE CASE
  // =======================================================

  canCreateUseCaseForProject(
    project: any
  ): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    const isManagerRole =
      role === 'manager' ||
      role.includes('manager') ||
      role === 'admin' ||
      role === 'product owner' ||
      role.includes('product owner');

    if (!isManagerRole) {
      return false;
    }

    /*
     * Project must already have
     * a manager.
     */
    if (
      !this.isProjectManagerAssigned(project)
    ) {
      return false;
    }

    /*
     * Admins and Project Managers can create for any project.
     * Managers can create for their assigned projects.
     */
    if (
      role === 'admin' ||
      role === 'project manager' ||
      role.includes('project manager')
    ) {
      return true;
    }

    /*
     * Logged-in manager must be
     * the manager assigned to project.
     */
    return this.isCurrentManagerForProject(
      project
    );
  }

  // =======================================================
  // OLD GENERIC USE CASE CHECK
  // =======================================================

  canCreateUseCase(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    return (
      role === 'manager' ||
      role.includes('manager') ||
      role === 'admin' ||
      role === 'product owner' ||
      role.includes('product owner')
    );
  }

  // =======================================================
  // CHECK PROJECT HAS USE CASE
  // =======================================================

  projectHasUseCase(
    project: any
  ): boolean {

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (!projectId) {
      return false;
    }

    return (
      Array.isArray(this.useCases) &&
      this.useCases.some(
        (useCase: any) =>
          Number(
            useCase.ProjectID ??
            useCase.projectID
          ) === projectId
      )
    );
  }

  // =======================================================
  // SCRUM MASTER CAN CREATE SPRINT
  // =======================================================

  canCreateSprintForProject(
    project: any
  ): boolean {
    const role = (this.userRole || '').trim().toLowerCase();

    /*
     * Only Scrum Master.
     */
    if (
      role !== 'scrum master' &&
      role !== 'scrummaster' &&
      !role.includes('scrum')
    ) {
      return false;
    }

    /*
     * Manager must be assigned.
     */
    if (
      !this.isProjectManagerAssigned(project)
    ) {
      return false;
    }

    /*
     * At least one Use Case must exist.
     */
    if (
      !this.projectHasUseCase(project)
    ) {
      return false;
    }

    return true;
  }

  // =======================================================
  // GENERIC SPRINT CHECK
  // =======================================================

  canCreateSprint(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();

    return (
      role === 'scrum master' ||
      role === 'scrummaster' ||
      role.includes('scrum')
    );
  }

  // =======================================================
  // TEAM LEAD CREATES TASKS
  // =======================================================

  canCreateTaskForProject(
    project: any
  ): boolean {
    const role = (this.userRole || '').trim().toLowerCase();

    const isAuthorized =
      role === 'team lead' ||
      role === 'teamlead' ||
      role.includes('lead') ||
      role === 'admin';

    if (!isAuthorized) {
      return false;
    }

    /*
     * Manager must be assigned.
     */
    if (
      !this.isProjectManagerAssigned(project)
    ) {
      return false;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (!projectId) {
      return false;
    }

    /*
     * Sprint must exist.
     */
    return (
      Array.isArray(this.sprints) &&
      this.sprints.some(
        (sprint: any) =>
          Number(
            sprint.ProjectID ??
            sprint.projectID
          ) === projectId
      )
    );
  }

  // =======================================================
  // GENERIC TASK CHECK
  // =======================================================

  canCreateTask(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();

    /* Tasks are created by Team Leads; Scrum Masters manage them on the board. */
    return (
      role === 'team lead' ||
      role === 'teamlead' ||
      role.includes('lead') ||
      role === 'admin'
    );
  }

  isScrumMaster(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    return role === 'scrum master' || role === 'scrummaster' || role.includes('scrum');
  }

  isTaskOverdue(task: any): boolean {
    const status = (task?.Status || task?.status || '').trim().toUpperCase();
    const dueDate = task?.DueDate || task?.dueDate;
    return !!dueDate && !['COMPLETED', 'DONE'].includes(status) && new Date(dueDate) < new Date();
  }

  helpCompleteTask(task: any): void {
    if (!this.isScrumMaster() || !this.managerId) {
      this.toastService.showError('Only the Scrum Master can take over an overdue task.');
      return;
    }

    const taskId = Number(task?.TaskID || task?.taskId);
    if (!taskId) {
      this.toastService.showError('Invalid task.');
      return;
    }

    this.projectservice.assignTask(taskId, this.managerId, 'Development').subscribe({
      next: () => {
        this.projectservice.updateTaskStatus(taskId, 'Development', 30).subscribe({
          next: () => {
            this.toastService.showSuccess('You are now helping complete this task.');
            this.loadTasks(Number(task?.ProjectID || task?.projectId || this.selectedProjectId));
          },
          error: (error: any) => this.toastService.showError(error?.error?.message || 'Failed to start task help.')
        });
      },
      error: (error: any) => this.toastService.showError(error?.error?.message || 'Failed to take ownership of task.')
    });
  }

  assignFromBoard(task: any, employeeId: any): void {
    if (!this.isScrumMaster()) {
      this.toastService.showError('Only the Scrum Master can assign tasks from the board.');
      return;
    }

    const taskId = Number(task?.TaskID || task?.taskId);
    const assigneeId = Number(employeeId);
    if (!taskId || !assigneeId) {
      this.toastService.showError('Select an employee before assigning the task.');
      return;
    }

    this.projectservice.assignTask(taskId, assigneeId, 'Assigned').subscribe({
      next: () => {
        this.toastService.showSuccess('Task assigned from the Scrum Master board.');
        this.loadTasks(Number(task?.ProjectID || task?.projectId || this.selectedProjectId));
      },
      error: (error: any) => this.toastService.showError(error?.error?.message || 'Failed to assign task.')
    });
  }

  // =======================================================
  // TOGGLE PROJECT FORM
  // =======================================================

  toggleProjectForm(): void {

    if (!this.canAddProject()) {

      this.toastService.showError(
        'Access Denied: Only Project Managers can create projects.'
      );

      return;
    }

    this.showProjectForm =
      !this.showProjectForm;

    if (this.showProjectForm) {

      this.closeOtherForms();

      this.resetProjectForm();
    }
  }

  // =======================================================
  // CLOSE OTHER FORMS
  // =======================================================

  closeOtherForms(): void {

    this.showTaskForm = false;

    this.showUseCaseForm = false;

    this.showSprintForm = false;
  }

  // =======================================================
  // ADD PROJECT
  // =======================================================

  addProject(): void {

    // -------------------------------------------------------
    // ROLE
    // -------------------------------------------------------

    if (!this.canAddProject()) {

      this.toastService.showError(
        'Access Denied: Only Project Managers can create projects.'
      );

      return;
    }

    // -------------------------------------------------------
    // PROJECT NAME
    // -------------------------------------------------------

    const projectName =
      this.projectForm.title?.trim();

    if (!projectName) {

      this.toastService.showError(
        'Please enter Project Name.'
      );

      return;
    }

    // -------------------------------------------------------
    // STATUS
    // -------------------------------------------------------

    const status =
      this.projectForm.status?.trim();

    if (
      !this.projectStatuses.includes(
        status
      )
    ) {

      this.toastService.showError(
        'Invalid Project Status.'
      );

      return;
    }

    // -------------------------------------------------------
    // MANAGER IS OPTIONAL
    // -------------------------------------------------------

    let managerId:
      number | null = null;

    if (
      this.projectForm.assignedTo !== '' &&
      this.projectForm.assignedTo !== null &&
      this.projectForm.assignedTo !== undefined
    ) {

      const selectedManagerId =
        Number(
          this.projectForm.assignedTo
        );

      if (
        !Number.isInteger(
          selectedManagerId
        ) ||
        selectedManagerId <= 0
      ) {

        this.toastService.showError(
          'Invalid Project Manager.'
        );

        return;
      }

      /*
       * Verify selected manager
       * actually exists.
       */
      const manager =
        this.managers.find(
          (item: any) =>
            this.getEmployeeId(item) ===
            selectedManagerId
        );

      if (!manager) {

        this.toastService.showError(
          'Selected manager was not found.'
        );

        return;
      }

      managerId =
        selectedManagerId;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const computedStatus = managerId ? 'Active' : 'Pending';

    const payload = {

      ProjectName:
        projectName,

      Description:
        this.projectForm.description?.trim() ||
        '',

      /*
       * NULL is allowed.
       */
      ManagerID:
        managerId,

      StartDate:
        this.projectForm.startDate ||
        null,

      EndDate:
        this.projectForm.endDate ||
        null,

      Priority:
        this.projectForm.priority ||
        'Medium',

      Budget:
        Number(
          this.projectForm.budget
        ) || 0,

      Status:
        computedStatus,

      userRole:
        this.userRole
    };

    console.log(
      'CREATE PROJECT PAYLOAD:',
      payload
    );

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.projectservice
      .addProject(payload)
      .subscribe({

        next: (response: any) => {

          console.log(
            'PROJECT CREATED:',
            response
          );

          if (managerId) {

            this.toastService.showSuccess(
              'Project created and manager assigned successfully!'
            );

          } else {

            this.toastService.showSuccess(
              'Project created successfully. Manager can be assigned later.'
            );
          }

          this.showProjectForm =
            false;

          this.resetProjectForm();

          this.loadProjects();
        },

        error: (error: any) => {

          console.error(
            'PROJECT CREATION ERROR:',
            error
          );

          const message =
            error?.error?.message ||
            error?.message ||
            'Failed to create project.';

          this.toastService.showError(
            message
          );
        }
      });
  }

  // =======================================================
  // RESET PROJECT FORM
  // =======================================================

  resetProjectForm(): void {

    this.projectForm = {

      title: '',

      description: '',

      startDate: '',

      endDate: '',

      assignedTo: '',

      priority: 'Medium',

      budget: 0,

      status: 'Active'
    };
  }

  // =======================================================
  // ASSIGN MANAGER
  // =======================================================

  assignManager(
    project: any,
    managerId: any
  ): void {

    // -------------------------------------------------------
    // ONLY PROJECT MANAGER
    // -------------------------------------------------------

    if (!this.canAddProject()) {

      this.toastService.showError(
        'Access Denied: Only Project Managers can assign managers.'
      );

      return;
    }

    // -------------------------------------------------------
    // PROJECT ID
    // -------------------------------------------------------

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      !Number.isInteger(projectId)
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    // -------------------------------------------------------
    // MANAGER ID
    // -------------------------------------------------------

    const selectedManagerId =
      Number(managerId);

    if (
      !selectedManagerId ||
      !Number.isInteger(
        selectedManagerId
      )
    ) {

      this.toastService.showError(
        'Please select a valid manager.'
      );

      return;
    }

    // -------------------------------------------------------
    // FIND MANAGER
    // -------------------------------------------------------

    const manager =
      this.managers.find(
        (item: any) =>
          this.getEmployeeId(item) ===
          selectedManagerId
      );

    if (!manager) {

      this.toastService.showError(
        'Selected manager was not found.'
      );

      return;
    }

    // -------------------------------------------------------
    // MANAGER DEPARTMENT
    // -------------------------------------------------------

    const departmentId =
      this.getDepartmentId(
        manager
      );

    if (!departmentId) {

      this.toastService.showError(
        'Selected manager department was not found.'
      );

      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      ManagerID:
        selectedManagerId
    };

    console.log(
      'ASSIGN MANAGER PAYLOAD:',
      {
        ProjectID: projectId,
        ManagerID: selectedManagerId,
        DepartmentID: departmentId
      }
    );

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.http
      .put(
        `http://localhost:3000/api/projects/${projectId}/manager`,
        payload
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'MANAGER ASSIGNED:',
            response
          );

          project.managerId = selectedManagerId;
          project.ManagerID = selectedManagerId;
          project.managerName = manager.FullName || manager.employeeName || manager.FullName;
          project.ManagerName = manager.FullName || manager.employeeName || manager.FullName;
          project.status = 'Active';
          project.Status = 'Active';

          this.toastService.showSuccess(
            'Manager assigned successfully! Project is now Active.'
          );

          this.loadProjects();
        },

        error: (error: any) => {

          console.error(
            'ASSIGN MANAGER ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to assign manager.'
          );
        }
      });
  }

  // =======================================================
  // TOGGLE PROJECT
  // =======================================================

  toggleTask(
    projectId: number
  ): void {

    if (
      this.openedProjectId ===
      projectId
    ) {

      this.openedProjectId =
        null;

      this.selectedProject =
        null;

      this.selectedProjectId =
        0;

      this.tasks = [];

      this.useCases = [];

      this.sprints = [];

      this.closeAllForms();

      return;
    }

    this.openedProjectId =
      projectId;

    const project =
      this.projects.find(
        (item: any) =>
          Number(
            item.ProjectID
          ) ===
          Number(projectId)
      );

    this.selectedProject =
      project || null;

    this.selectedProjectId =
      projectId;

    this.loadProjectData(
      projectId
    );
  }

  // =======================================================
  // LOAD ALL PROJECT DATA
  // =======================================================

  loadProjectData(
    projectId: number
  ): void {

    this.loadTasks(
      projectId
    );

    this.loadUseCases(
      projectId
    );

    this.loadSprints(
      projectId
    );
  }

  // =======================================================
  // LOAD TASKS
  // =======================================================

  loadTasks(
    projectId: number
  ): void {

    if (!projectId) {
      return;
    }

    this.projectservice
      .getJiraTasks(projectId.toString())
      .subscribe({

        next: (data: any) => {

          console.log(
            'JIRA TASKS, STORIES, BUGS, AND SUB-TASKS:',
            data
          );

          this.tasks =
            Array.isArray(data?.issues)
              ? data.issues.map((issue: any) => ({
                  TaskID: issue.id,
                  JiraKey: issue.key,
                  ProjectID: projectId,
                  taskName: issue.fields?.summary || issue.key,
                  TicketTitle: issue.fields?.summary || issue.key,
                  description: this.getJiraDescription(issue.fields?.description),
                  Description: this.getJiraDescription(issue.fields?.description),
                  TaskType: issue.fields?.issuetype?.name || 'Task',
                  Status: this.normalizeJiraTaskStatus(issue.fields?.status?.name),
                  Priority: issue.fields?.priority?.name || 'Medium',
                  DueDate: issue.fields?.duedate || null,
                  assignedToName: issue.fields?.assignee?.displayName || 'Unassigned',
                  AssignedToName: issue.fields?.assignee?.displayName || 'Unassigned',
                  ParentKey: issue.fields?.parent?.key || null,
                  Source: 'Jira'
                }))
              : [];

          console.log('MAPPED JIRA TASK DATA:', this.tasks);
        },

        error: (error: any) => {

          console.error(
            'ERROR LOADING TASKS:',
            error
          );

          this.tasks = [];
        }
      });
  }

  // =======================================================
  // OPEN USE CASE FORM
  // =======================================================

  openUseCaseForm(
    project: any
  ): void {

    if (
      !this.canCreateUseCaseForProject(
        project
      )
    ) {

      this.toastService.showError(
        'Access Denied: Only the manager assigned to this project can create Use Cases.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    this.selectedProject =
      project;

    this.selectedProjectId =
      projectId;

    this.showUseCaseForm =
      true;

    this.showSprintForm =
      false;

    this.showTaskForm =
      false;

    this.showProjectForm =
      false;

    this.resetUseCaseForm();
  }

  // =======================================================
  // CLOSE USE CASE FORM
  // =======================================================

  closeUseCaseForm(): void {

    this.showUseCaseForm =
      false;

    this.resetUseCaseForm();
  }

  // =======================================================
  // RESET USE CASE FORM
  // =======================================================

  resetUseCaseForm(): void {

    this.useCaseForm = {

      Title: '',

      UseCaseType: 'Epic',

      Description: '',

      Priority: 'Medium',

      Status: 'Created'
    };
  }

  // =======================================================
  // LOAD USE CASES
  // =======================================================

  loadUseCases(
    projectId: number
  ): void {

    if (!projectId) {
      return;
    }

    this.projectservice
      .getJiraEpics(projectId.toString())
      .subscribe({

        next: (data: any) => {

          console.log(
            'USE CASES (EPICS):',
            data
          );

          if (data && data.issues && Array.isArray(data.issues)) {
            this.useCases = data.issues.map((issue: any) => ({
              Title: issue.fields.summary,
              UseCaseType: issue.fields.issuetype?.name || 'Epic',
              Description: issue.fields.description?.content?.[0]?.content?.[0]?.text || issue.fields.description || 'No description',
              Priority: issue.fields.priority?.name || 'Medium',
              Status: issue.fields.status?.name || 'Open'
            }));

            console.log('JIRA EPIC DATA:', data.issues);
            console.log('MAPPED USE CASE DATA:', this.useCases);
          } else {
            this.useCases = [];
            console.log('JIRA EPIC DATA: No epics found for project', projectId);
          }
        },

        error: (error: any) => {

          console.error(
            'ERROR LOADING USE CASES:',
            error
          );

          this.useCases = [];
        }
      });
  }

  // =======================================================
  // ADD USE CASE
  // =======================================================

  addUseCase(
    project: any
  ): void {

    if (
      !this.canCreateUseCaseForProject(
        project
      )
    ) {

      this.toastService.showError(
        'Access Denied: You can create Use Cases only for projects assigned to you.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    const title =
      this.useCaseForm.Title?.trim();

    if (!title) {

      this.toastService.showError(
        'Please enter Use Case Title.'
      );

      return;
    }

    const currentUserId =
      this.managerId ||
      Number(
        this.currentUser?.EmployeeID ??
        this.currentUser?.employeeID ??
        this.currentUser?.EmployeeId ??
        this.currentUser?.EMPLOYEEID ??
        this.currentUser?.id ??
        this.currentUser?.Id ??
        this.currentUser?.user?.EmployeeID ??
        this.currentUser?.user?.employeeId ??
        this.currentUser?.user?.id
      ) ||
      Number(
        project?.ManagerID ??
        project?.managerID ??
        project?.managerId
      );

    if (!currentUserId) {
      this.toastService.showError(
        'Logged-in User ID not found. Please log in again.'
      );

      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      ProjectID:
        projectId,

      Title:
        title,

      Description:
        this.useCaseForm.Description?.trim() ||
        '',

      Priority:
        this.useCaseForm.Priority ||
        'Medium',

      Status:
        'Created',

      UseCaseType:
        this.useCaseForm.UseCaseType || 'Epic',

      CreatedBy:
        currentUserId
    };

    console.log(
      'USE CASE PAYLOAD:',
      payload
    );

    this.projectservice
      .createUseCase(
        payload
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'USE CASE CREATED:',
            response
          );

          this.toastService.showSuccess(
            'Use Case created successfully!'
          );

          this.closeUseCaseForm();

          this.loadUseCases(
            projectId
          );
        },

        error: (error: any) => {

          console.error(
            'USE CASE ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to create Use Case.'
          );
        }
      });
  }

  // =======================================================
  // GET USE CASES FOR PROJECT
  // =======================================================

  getUseCasesForProject(
    project: any
  ): any[] {

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (!projectId) {
      return [];
    }

    return (
      this.useCases || []
    ).filter(
      (useCase: any) =>
        Number(
          useCase.ProjectID ??
          useCase.projectID
        ) === projectId
    );
  }

  // =======================================================
  // OPEN SPRINT FORM
  // =======================================================

  openSprintForm(
    project: any
  ): void {

    if (
      !this.canCreateSprintForProject(
        project
      )
    ) {

      if (
        !this.isProjectManagerAssigned(
          project
        )
      ) {

        this.toastService.showError(
          'Manager must be assigned to this project before creating a Sprint.'
        );

        return;
      }

      if (
        !this.projectHasUseCase(
          project
        )
      ) {

        this.toastService.showError(
          'Create at least one Use Case before creating a Sprint.'
        );

        return;
      }

      this.toastService.showError(
        'Access Denied: Only Scrum Masters can create Sprints.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    this.selectedProject =
      project;

    this.selectedProjectId =
      projectId;

    this.showSprintForm =
      true;

    this.showUseCaseForm =
      false;

    this.showTaskForm =
      false;

    this.showProjectForm =
      false;

    this.resetSprintForm();

    /*
     * Load project use cases.
     */
    this.loadUseCases(
      projectId
    );
  }

  // =======================================================
  // CLOSE SPRINT FORM
  // =======================================================

  closeSprintForm(): void {

    this.showSprintForm =
      false;

    this.resetSprintForm();
  }

  // =======================================================
  // RESET SPRINT FORM
  // =======================================================

  resetSprintForm(): void {

    this.sprintForm = {

      SprintName: '',

      SprintGoal: '',

      StartDate: '',

      EndDate: '',

      Status: 'Planned',

      UseCaseID: ''
    };
  }

  // =======================================================
  // LOAD SPRINTS
  // =======================================================

  loadSprints(
    projectId: number
  ): void {

    if (!projectId) {
      return;
    }

    this.projectservice
      .getJiraBoards(projectId.toString())
      .subscribe({

        next: (boardData: any) => {
          const boards = Array.isArray(boardData?.values)
            ? boardData.values
            : Array.isArray(boardData)
              ? boardData
              : [];
          const boardIds: string[] = [...new Set<string>(
            boards
              .map((board: any) => board?.id)
              .filter((boardId: any) => boardId !== null && boardId !== undefined)
              .map((boardId: any) => String(boardId))
          )];

          if (boardIds.length === 0) {
            this.sprints = [];
            console.warn('No Jira boards found for project', projectId);
            return;
          }

          forkJoin(
            boardIds.map((boardId) =>
              this.projectservice.getJiraSprints(boardId).pipe(
                catchError((error) => {
                  console.error(`ERROR LOADING SPRINTS FOR BOARD ${boardId}:`, error);
                  return of({ values: [] });
                })
              )
            )
          ).subscribe({
            next: (responses: any[]) => {
              const jiraSprints = responses.reduce((allSprints: any[], response: any) => {
                const boardSprints = Array.isArray(response?.values)
                  ? response.values
                  : Array.isArray(response)
                    ? response
                    : [];
                return allSprints.concat(boardSprints);
              }, []);
              const uniqueSprints = [...new Map(
                jiraSprints
                  .filter((sprint: any) => sprint?.id !== undefined && sprint?.id !== null)
                  .map((sprint: any) => [String(sprint.id), sprint])
              ).values()];

              this.sprints = uniqueSprints.map((sprint: any) => ({
                ...sprint,
                SprintID: sprint.id ?? sprint.SprintID ?? sprint.sprintId,
                SprintName: sprint.name ?? sprint.SprintName ?? 'Unnamed Sprint',
                SprintGoal: sprint.goal ?? sprint.description ?? sprint.SprintGoal ?? 'No description',
                SprintDescription: sprint.goal ?? sprint.description ?? sprint.SprintGoal ?? 'No description',
                StartDate: sprint.startDate ?? sprint.StartDate ?? '',
                EndDate: sprint.endDate ?? sprint.EndDate ?? '',
                Status: sprint.state ?? sprint.Status ?? 'Planned'
              }));

              console.log('Mapped Jira sprint data:', {
                projectId,
                boardIds,
                count: this.sprints.length,
                sprints: this.sprints
              });
            },
            error: (error: any) => {
              console.error('ERROR LOADING JIRA SPRINTS:', error);
              this.sprints = [];
            }
          });
        },

        error: (error: any) => {

          console.error(
            'ERROR LOADING JIRA SPRINTS:',
            error
          );

          this.sprints = [];
        }
      });
  }

  // =======================================================
  // ADD SPRINT
  // =======================================================

  addSprint(
    project: any
  ): void {

    if (
      !this.canCreateSprintForProject(
        project
      )
    ) {

      this.toastService.showError(
        'Sprint can be created only by a Scrum Master after manager and Use Case are assigned.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    const sprintName =
      this.sprintForm.SprintName?.trim();

    if (!sprintName) {

      this.toastService.showError(
        'Please enter Sprint Name.'
      );

      return;
    }

    if (
      !this.sprintForm.StartDate ||
      !this.sprintForm.EndDate
    ) {

      this.toastService.showError(
        'Please select Sprint Start Date and End Date.'
      );

      return;
    }

    if (new Date(this.sprintForm.EndDate) < new Date(this.sprintForm.StartDate)) {
      this.toastService.showError(
        'Sprint End Date cannot be earlier than Start Date.'
      );

      return;
    }

    const useCaseId =
      Number(
        this.sprintForm.UseCaseID
      );

    if (
      !useCaseId ||
      !Number.isInteger(useCaseId)
    ) {

      this.toastService.showError(
        'Please select a Use Case.'
      );

      return;
    }

    /*
     * Verify Use Case belongs
     * to selected project.
     */
    const useCase =
      this.getUseCasesForProject(
        project
      ).find(
        (item: any) =>
          Number(
            item.UseCaseID ??
            item.useCaseID ??
            item.UsecaseID
          ) === useCaseId
      );

    if (!useCase) {

      this.toastService.showError(
        'Selected Use Case does not belong to this project.'
      );

      return;
    }

    const currentUserId =
      this.managerId ||
      Number(
        this.currentUser?.EmployeeID ??
        this.currentUser?.employeeID ??
        this.currentUser?.EmployeeId ??
        this.currentUser?.EMPLOYEEID ??
        this.currentUser?.id ??
        this.currentUser?.Id ??
        this.currentUser?.user?.EmployeeID ??
        this.currentUser?.user?.employeeId ??
        this.currentUser?.user?.id
      ) ||
      Number(
        project?.ManagerID ??
        project?.managerID ??
        project?.managerId
      );

    if (!currentUserId) {
      this.toastService.showError(
        'Scrum Master EmployeeID not found. Please log in again.'
      );

      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      ProjectID:
        projectId,

      UseCaseID:
        useCaseId,

      SprintName:
        sprintName,

      SprintGoal:
        this.sprintForm.SprintGoal?.trim() ||
        '',

      StartDate:
        this.sprintForm.StartDate,

      EndDate:
        this.sprintForm.EndDate,

      Status:
        'Planned',

      CreatedBy:
        currentUserId
    };

    console.log(
      'SPRINT PAYLOAD:',
      payload
    );

    this.projectservice
      .createSprint(
        payload
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'SPRINT CREATED:',
            response
          );

          this.toastService.showSuccess(
            'Sprint created successfully!'
          );

          this.closeSprintForm();

          this.loadSprints(
            projectId
          );
        },

        error: (error: any) => {

          console.error(
            'SPRINT ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to create Sprint.'
          );
        }
      });
  }

  // =======================================================
  // GET SPRINTS FOR PROJECT
  // =======================================================

  getSprintsForProject(
    project: any
  ): any[] {

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID
      );

    if (!projectId) {
      return [];
    }

    return (
      this.sprints || []
    ).filter(
      (sprint: any) =>
        Number(
          sprint.ProjectID ??
          sprint.projectID
        ) === projectId
    );
  }

  // =======================================================
  // OPEN TASK FORM
  // =======================================================

  openTaskForm(
    project: any
  ): void {

    if (
      !this.canCreateTaskForProject(
        project
      )
    ) {

      this.toastService.showError(
        'Access Denied: Scrum Master can create tasks only after a Sprint exists.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {

      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    this.selectedProject =
      project;

    this.selectedProjectId =
      projectId;

    this.showTaskForm =
      true;

    this.showUseCaseForm =
      false;

    this.showSprintForm =
      false;

    this.showProjectForm =
      false;

    this.resetTaskForm();

    this.loadSprints(
      projectId
    );

    if (this.employees.length === 0) {
      this.loadEmployees();
    }

    if (this.managers.length === 0) {
      this.loadManagers();
    }
  }

  // =======================================================
  // CLOSE TASK FORM
  // =======================================================

  closeTaskForm(): void {

    this.showTaskForm =
      false;

    this.resetTaskForm();
  }

  // =======================================================
  // ADD TASK
  // =======================================================

  addTask(
    project: any
  ): void {

    // -------------------------------------------------------
    // PROJECT VALIDATION
    // -------------------------------------------------------

    if (
      !this.canCreateTaskForProject(
        project
      )
    ) {
      this.toastService.showError(
        'Task can be created only by Team Lead / Dev Team / Scrum Master after a Sprint exists.'
      );

      return;
    }

    const projectId =
      Number(
        project?.ProjectID ??
        project?.projectID ??
        project?.ProjectId ??
        project?.projectId
      );

    if (
      !projectId ||
      projectId <= 0
    ) {
      this.toastService.showError(
        'Invalid Project.'
      );

      return;
    }

    // -------------------------------------------------------
    // TASK TITLE
    // -------------------------------------------------------

    const ticketTitle =
      this.taskForm.TicketTitle?.trim();

    if (!ticketTitle) {
      this.toastService.showError(
        'Please enter Ticket Title.'
      );

      return;
    }

    // -------------------------------------------------------
    // SPRINT
    // -------------------------------------------------------

    const sprintId =
      Number(
        this.taskForm.SprintID
      );

    if (
      !sprintId ||
      !Number.isInteger(sprintId)
    ) {
      this.toastService.showError(
        'Please select a Sprint.'
      );

      return;
    }

    /*
     * Verify Sprint belongs
     * to selected project.
     */
    const sprint =
      this.getSprintsForProject(
        project
      ).find(
        (item: any) =>
          Number(
            item.SprintID ??
            item.sprintID ??
            item.SprintId
          ) === sprintId
      );

    if (!sprint) {
      this.toastService.showError(
        'Selected Sprint does not belong to this project.'
      );

      return;
    }

    // -------------------------------------------------------
    // TEAM LEAD & ASSIGNED TO (EMPLOYEE)
    // -------------------------------------------------------

    let teamLeadId = Number(this.taskForm.TeamLeadID) || null;
    let assignedToId = Number(this.taskForm.AssignedTo) || null;

    // If logged in as Team Lead and no TeamLeadID selected, default to self
    if (!teamLeadId && this.isTeamLead() && this.managerId) {
      teamLeadId = this.managerId;
    }

    // If logged in as Dev and neither assigned, dev can self-assign or assign to self
    if (!assignedToId && !this.isTeamLead() && this.managerId) {
      assignedToId = this.managerId;
    }

    // -------------------------------------------------------
    // TASK TYPE
    // -------------------------------------------------------

    const taskType = this.taskForm.TaskType || 'Story';

    const initialStatus = assignedToId ? 'Assigned' : 'Pending';

    const payload = {
      ProjectID: projectId,
      ProjectName: project?.projectName || project?.ProjectName || '',
      SprintID: sprintId,
      TaskName: ticketTitle,
      Description: this.taskForm.Description?.trim() || '',
      TeamLeadID: teamLeadId,
      AssignedTo: assignedToId,
      TaskType: taskType,
      StartDate: this.taskForm.StartDate || null,
      DueDate: this.taskForm.DueDate || null,
      Status: this.taskForm.Status || initialStatus,
      Priority: this.taskForm.Priority || 'Medium',
      Progress: this.taskForm.Progress || (assignedToId ? 10 : 0),
      CreatedBy: this.managerId
    };

    console.log(
      'CREATE TASK PAYLOAD:',
      payload
    );

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.projectservice
      .createTask(
        payload
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'TASK CREATED:',
            response
          );

          this.toastService.showSuccess(
            'Task created successfully!'
          );

          this.closeTaskForm();

          this.loadTasks(
            projectId
          );
        },

        error: (error: any) => {
          console.error(
            'CREATE TASK ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to create Task.'
          );
        }
      });
  }

  // =======================================================
  // RESET TASK FORM
  // =======================================================

  resetTaskForm(): void {

    this.taskForm = {

      TicketTitle: '',

      Description: '',

      SprintID: '',

      TeamLeadID: '',

      AssignedTo: '',

      TaskType: 'Story',

      StartDate: '',

      DueDate: '',

      Status: 'Pending',

      Priority: 'Medium',

      Progress: 0
    };
  }

  // =======================================================
  // EDIT TASK
  // =======================================================

  editTask(
    projectId: number,
    task: any
  ): void {

    this.selectedProjectId =
      projectId;

    this.taskForm = {

      TicketTitle:
        task.TicketTitle ??
        task.TaskName ??
        task.taskName ??
        '',

      Description:
        task.Description ??
        task.description ??
        '',

      SprintID:
        task.SprintID ??
        task.sprintID ??
        '',

      TeamLeadID:
        task.TeamLeadID ??
        task.teamLeadID ??
        '',

      AssignedTo:
        task.AssignedTo ??
        task.assignedTo ??
        '',

      TaskType:
        task.TaskType ??
        task.taskType ??
        '',

      StartDate:
        task.StartDate ??
        task.startDate ??
        '',

      DueDate:
        task.DueDate ??
        task.dueDate ??
        '',

      Status:
        task.Status ??
        task.status ??
        'Pending',

      Priority:
        task.Priority ??
        task.priority ??
        'Medium',

      Progress:
        task.Progress ??
        task.progress ??
        0
    };

    this.showTaskForm =
      true;

    this.showUseCaseForm =
      false;

    this.showSprintForm =
      false;
  }

  // =======================================================
  // DELETE TASK
  // =======================================================

  deleteTask(
    projectId: number,
    taskId: number
  ): void {

    if (
      !confirm(
        'Do you want to delete this task?'
      )
    ) {

      return;
    }

    this.http
      .delete(
        `http://localhost:3000/api/tasks/${taskId}`
      )
      .subscribe({

        next: () => {

          this.toastService.showSuccess(
            'Task deleted successfully.'
          );

          this.loadTasks(
            projectId
          );
        },

        error: (error: any) => {

          console.error(
            'DELETE TASK ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to delete task.'
          );
        }
      });
  }

  // =======================================================
  // TEAM LEAD CHECK
  // =======================================================

  isTeamLead(): boolean {
    const role = (this.userRole || '').trim().toLowerCase();
    return (
      role === 'team lead' ||
      role === 'teamlead' ||
      role.includes('team lead') ||
      role.includes('lead')
    );
  }

  // =======================================================
  // GET TEAM LEADS BY DEPARTMENT
  // =======================================================

  getTeamLeadsByDepartment(
    departmentId: number
  ): any[] {

    if (!departmentId) {
      return [];
    }

    return this.employees.filter(
      (employee: any) => {
        const empDeptId = this.getDepartmentId(employee);
        const role = this.getRole(employee);
        const isTL =
          role === 'team lead' ||
          role === 'teamlead' ||
          role.includes('team lead') ||
          role.includes('teamlead') ||
          role.includes('lead');

        return empDeptId === departmentId && isTL;
      }
    );
  }

  // =======================================================
  // GET EMPLOYEES BY DEPARTMENT
  // =======================================================

  getEmployeesByDepartment(
    departmentId: number
  ): any[] {

    if (!departmentId) {
      return [];
    }

    return this.employees.filter(
      (employee: any) => {

        const role =
          this.getRole(
            employee
          );

        return (
          this.getDepartmentId(
            employee
          ) === departmentId &&
          role !== 'team lead' &&
          role !== 'teamlead' &&
          !role.includes('team lead') &&
          !role.includes('lead') &&
          role !== 'manager' &&
          !role.includes('manager')
        );
      }
    );
  }

  // =======================================================
  // GET MANAGERS BY DEPARTMENT
  // =======================================================

  getManagersByDepartment(
    departmentId: number
  ): any[] {

    if (!departmentId) {
      return [];
    }

    return this.managers.filter(
      (manager: any) =>
        this.getDepartmentId(
          manager
        ) === departmentId
    );
  }

  // =======================================================
  // GET TEAM LEADS FOR PROJECT
  // =======================================================

  getTeamLeadsForProject(
    project: any
  ): any[] {

    const manager =
      this.getManagerForProject(
        project
      );

    const departmentId =
      this.getDepartmentId(manager) ||
      this.getDepartmentId(project) ||
      Number(project?.DepartmentID ?? project?.departmentId);

    if (!departmentId) {
      return [];
    }

    return this.getTeamLeadsByDepartment(
      departmentId
    );
  }

  // =======================================================
  // GET EMPLOYEES FOR TASK
  // =======================================================

  getEmployeesForTask(
    task: any
  ): any[] {

    const teamLeadId =
      Number(
        task?.TeamLeadID ??
        task?.teamLeadID
      );

    if (!teamLeadId) {
      return [];
    }

    const teamLead =
      this.employees.find(
        (employee: any) =>
          this.getEmployeeId(
            employee
          ) === teamLeadId
      );

    if (!teamLead) {
      return [];
    }

    const departmentId =
      this.getDepartmentId(
        teamLead
      );

    if (!departmentId) {
      return [];
    }

    return this.getEmployeesByDepartment(
      departmentId
    );
  }

  // =======================================================
  // GET EMPLOYEES FOR CURRENT TEAM LEAD
  // =======================================================

  getEmployeesForCurrentTeamLead(): any[] {

    const departmentId =
      this.getDepartmentId(
        this.currentUser
      );

    if (!departmentId) {
      return [];
    }

    return this.getEmployeesByDepartment(
      departmentId
    );
  }

  // =======================================================
  // REQUIRED EMPLOYEES
  // =======================================================

  getRequiredEmployees(): any[] {
    const role = (this.userRole || '').trim().toLowerCase();

    // -------------------------------------------------------
    // SCRUM MASTER
    //
    // Scrum Master sees Team Leads belonging to
    // the Manager's Department for this project.
    // -------------------------------------------------------

    if (
      role === 'scrum master' ||
      role === 'scrummaster' ||
      role.includes('scrum')
    ) {

      if (
        !this.selectedProject
      ) {

        return [];
      }

      return this.getTeamLeadsForProject(
        this.selectedProject
      );
    }

    // -------------------------------------------------------
    // TEAM LEAD
    //
    // Team Lead sees employees
    // from their department.
    // -------------------------------------------------------

    if (
      role === 'team lead' ||
      role === 'teamlead' ||
      role.includes('team lead') ||
      role.includes('lead')
    ) {

      return this.getEmployeesForCurrentTeamLead();
    }

    return [];
  }

  // =======================================================
  // MANAGER SELECTED
  // =======================================================

  onManagerSelected(
    managerId: any
  ): void {

    const manager =
      this.managers.find(
        (item: any) =>
          this.getEmployeeId(
            item
          ) ===
          Number(managerId)
      );

    if (!manager) {

      this.selectedManagerDepartmentId =
        null;

      this.departmentTeamLeads =
        [];

      this.departmentEmployees =
        [];

      return;
    }

    const departmentId =
      this.getDepartmentId(
        manager
      );

    if (!departmentId) {

      this.toastService.showError(
        'Manager department not found.'
      );

      return;
    }

    this.selectedManagerDepartmentId =
      departmentId;

    this.departmentTeamLeads =
      this.getTeamLeadsByDepartment(
        departmentId
      );

    this.departmentEmployees =
      this.getEmployeesByDepartment(
        departmentId
      );

    console.log(
      'SELECTED MANAGER:',
      manager
    );

    console.log(
      'MANAGER DEPARTMENT:',
      departmentId
    );

    console.log(
      'TEAM LEADS:',
      this.departmentTeamLeads
    );

    console.log(
      'DEPARTMENT EMPLOYEES:',
      this.departmentEmployees
    );
  }

  // =======================================================
  // TEAM LEAD SELECTED
  // =======================================================

  onTeamLeadSelected(
    teamLeadId: any
  ): void {

    const teamLead =
      this.employees.find(
        (employee: any) =>
          this.getEmployeeId(
            employee
          ) ===
          Number(teamLeadId)
      );

    if (!teamLead) {

      this.departmentEmployees =
        [];

      return;
    }

    const departmentId =
      this.getDepartmentId(
        teamLead
      );

    if (!departmentId) {

      this.departmentEmployees =
        [];

      return;
    }

    this.departmentEmployees =
      this.getEmployeesByDepartment(
        departmentId
      );

    console.log(
      'SELECTED TEAM LEAD:',
      teamLead
    );

    console.log(
      'TEAM LEAD DEPARTMENT:',
      departmentId
    );

    console.log(
      'DEPARTMENT EMPLOYEES:',
      this.departmentEmployees
    );
  }

  // =======================================================
  // TEAM LEAD ASSIGNS EMPLOYEE
  // =======================================================

  reassignTask(
    task: any,
    newEmployeeId: any
  ): void {

    // -------------------------------------------------------
    // ONLY TEAM LEAD
    // -------------------------------------------------------

    if (!this.isTeamLead()) {

      this.toastService.showError(
        'Access Denied: Only Team Leads can assign employees.'
      );

      return;
    }

    // -------------------------------------------------------
    // TASK ID
    // -------------------------------------------------------

    const taskId =
      Number(
        task?.TaskID ??
        task?.taskId
      );

    if (
      !taskId ||
      !Number.isInteger(taskId)
    ) {

      this.toastService.showError(
        'Invalid Task.'
      );

      return;
    }

    // -------------------------------------------------------
    // EMPLOYEE ID
    // -------------------------------------------------------

    const employeeId =
      Number(
        newEmployeeId
      );

    if (
      !employeeId ||
      !Number.isInteger(employeeId)
    ) {

      this.toastService.showError(
        'Please select a valid employee.'
      );

      return;
    }

    // -------------------------------------------------------
    // CURRENT TEAM LEAD
    // -------------------------------------------------------

    const currentTeamLeadId =
      this.getEmployeeId(
        this.currentUser
      );

    if (!currentTeamLeadId) {

      this.toastService.showError(
        'Team Lead EmployeeID not found.'
      );

      return;
    }

    // -------------------------------------------------------
    // CHECK TASK BELONGS TO TEAM LEAD
    // -------------------------------------------------------

    const taskTeamLeadId =
      Number(
        task?.TeamLeadID ??
        task?.teamLeadID
      );

    if (
      taskTeamLeadId &&
      taskTeamLeadId !==
      currentTeamLeadId
    ) {

      this.toastService.showError(
        'This task is not assigned to you.'
      );

      return;
    }

    // -------------------------------------------------------
    // FIND EMPLOYEE
    // -------------------------------------------------------

    const employee =
      this.employees.find(
        (item: any) =>
          this.getEmployeeId(
            item
          ) === employeeId
      );

    if (!employee) {

      this.toastService.showError(
        'Employee not found.'
      );

      return;
    }

    // -------------------------------------------------------
    // TEAM LEAD DEPARTMENT
    // -------------------------------------------------------

    const teamLeadDepartmentId =
      this.getDepartmentId(
        this.currentUser
      );

    // -------------------------------------------------------
    // EMPLOYEE DEPARTMENT
    // -------------------------------------------------------

    const employeeDepartmentId =
      this.getDepartmentId(
        employee
      );

    if (
      !teamLeadDepartmentId ||
      !employeeDepartmentId
    ) {

      this.toastService.showError(
        'Team Lead or employee department not found.'
      );

      return;
    }

    // -------------------------------------------------------
    // DEPARTMENT VALIDATION
    // -------------------------------------------------------

    if (
      teamLeadDepartmentId !==
      employeeDepartmentId
    ) {

      this.toastService.showError(
        'You can assign tasks only to employees in your department.'
      );

      return;
    }

    // -------------------------------------------------------
    // ROLE VALIDATION
    // -------------------------------------------------------

    const employeeRole =
      this.getRole(
        employee
      );

    if (
      employeeRole === 'team lead' ||
      employeeRole === 'manager'
    ) {

      this.toastService.showError(
        'You cannot assign this task to a Manager or Team Lead.'
      );

      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      AssignedTo:
        employeeId,

      Status:
        'Assigned'
    };

    console.log(
      'ASSIGN EMPLOYEE PAYLOAD:',
      {
        TaskID: taskId,
        EmployeeID: employeeId,
        payload
      }
    );

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.http
      .put(
        `http://localhost:3000/api/tasks/${taskId}/assign`,
        payload
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'TASK ASSIGNED:',
            response
          );

          this.toastService.showSuccess(
            'Task assigned to employee successfully!'
          );

          this.loadTasks(
            Number(
              task?.ProjectID ??
              task?.projectID
            )
          );
        },

        error: (error: any) => {

          console.error(
            'TASK ASSIGNMENT ERROR:',
            error
          );

          this.toastService.showError(
            error?.error?.message ||
            'Failed to assign task.'
          );
        }
      });
  }

  // =======================================================
  // STATUS CLASS
  // =======================================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status
        ?.trim()
        .toUpperCase()
    ) {

      // ---------------------------------------------------
      // PROJECT
      // ---------------------------------------------------

      case 'ACTIVE':
        return 'bg-primary text-white';

      case 'ON HOLD':
        return 'bg-warning text-dark';

      case 'COMPLETED':
        return 'bg-success text-white';

      case 'CANCELLED':
        return 'bg-danger text-white';

      // ---------------------------------------------------
      // TASK
      // ---------------------------------------------------

      case 'PENDING':
        return 'bg-secondary text-white';

      case 'ASSIGNED':
        return 'bg-primary text-white';

      case 'DEVELOPMENT':
      case 'IN PROGRESS':
        return 'bg-info text-dark';

      case 'QA':
      case 'TESTING':
      case 'READY FOR TESTING':
        return 'bg-warning text-dark';

      case 'QA FAILED':
      case 'FAILED':
        return 'bg-danger text-white';

      case 'TEST PASSED':
      case 'PASSED':
        return 'bg-primary text-white';

      case 'SPRINT REVIEW':
      case 'REVIEW':
        return 'bg-dark text-white';

      case 'COMPLETED':
      case 'DONE':
        return 'bg-success text-white';

      default:
        return 'bg-light text-dark border';
    }
  }

  // =======================================================
  // TASK METRICS / COUNTERS FOR PIPELINE
  // =======================================================

  getTasksByStage(stage: string): any[] {
    if (!Array.isArray(this.tasks)) return [];
    const normalizedStage = stage.toUpperCase();
    return this.tasks.filter((task: any) => {
      const s = (task.Status || task.status || '').toUpperCase();
      if (normalizedStage === 'DEVELOPMENT') {
        return s === 'DEVELOPMENT' || s === 'IN PROGRESS' || s === 'QA FAILED';
      }
      if (normalizedStage === 'QA') {
        return s === 'QA' || s === 'TESTING' || s === 'READY FOR TESTING';
      }
      if (normalizedStage === 'SPRINT REVIEW') {
        return s === 'SPRINT REVIEW' || s === 'REVIEW' || s === 'TEST PASSED';
      }
      if (normalizedStage === 'COMPLETED') {
        return s === 'COMPLETED' || s === 'DONE';
      }
      if (normalizedStage === 'PENDING') {
        return s === 'PENDING' || s === 'ASSIGNED';
      }
      return false;
    });
  }

  private normalizeJiraTaskStatus(status: string): string {
    const normalizedStatus = (status || '').trim().toUpperCase();

    if (['TO DO', 'OPEN', 'PENDING', 'BACKLOG', 'SELECTED FOR DEVELOPMENT'].includes(normalizedStatus)) {
      return 'PENDING';
    }

    if (['IN PROGRESS', 'DEVELOPMENT'].includes(normalizedStatus)) {
      return 'DEVELOPMENT';
    }

    if (['QA', 'TESTING', 'READY FOR TESTING'].includes(normalizedStatus)) {
      return 'QA';
    }

    if (['SPRINT REVIEW', 'REVIEW', 'TEST PASSED'].includes(normalizedStatus)) {
      return 'SPRINT REVIEW';
    }

    if (['DONE', 'COMPLETED', 'CLOSED', 'RESOLVED'].includes(normalizedStatus)) {
      return 'COMPLETED';
    }

    return status || 'PENDING';
  }

  getTasksCountByStage(stage: string): number {
    return this.getTasksByStage(stage).length;
  }

  // =======================================================
  // CLOSE ALL FORMS
  // =======================================================

  closeAllForms(): void {
    this.showTaskForm = false;
    this.showUseCaseForm = false;
    this.showSprintForm = false;
    this.showProjectForm = false;
  }
}