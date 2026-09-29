import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LeaveService } from '../services/leave.service';
import { ProjectsService } from '../services/projects.service';
import { ReviewService } from '../services/review.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  role = '';
  currentEmail = '';
  currentName = '';
  currentUser: any = null;
  employees: any[] = [];

  constructor(
    private leaveService: LeaveService,
    private projectService: ProjectsService,
    private reviewService: ReviewService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role') || '';
    this.currentEmail = localStorage.getItem('email') || '';
    this.currentName = localStorage.getItem('fullName') || '';
    this.currentUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );

    // Load employees first to resolve names, then load notifications
    this.employeeService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loadNotifications();
      },
      error: () => {
        this.loadNotifications();
      }
    });
  }

  getReviewerName(reviewerId: number): string {
    const employee = this.employees.find(
      (emp: any) => Number(emp.EmployeeID || emp.employeeID || emp.id) === Number(reviewerId)
    );
    return employee ? (employee.FullName || employee.fullName || 'Unknown') : 'Unknown Reviewer';
  }

  getRevieweeName(revieweeId: number): string {
    const employee = this.employees.find(
      (emp: any) => Number(emp.EmployeeID || emp.employeeID || emp.id) === Number(revieweeId)
    );
    return employee ? (employee.FullName || employee.fullName || 'Unknown') : 'Unknown Employee';
  }

  loadNotifications(): void {
    const currentEmployeeId = Number(
      this.currentUser?.EmployeeID || this.currentUser?.employeeID || this.currentUser?.id || 0
    );

    forkJoin({
      leaves: this.leaveService.getLeaves(),
      projects: this.projectService.getProjects(),
      reviews: this.reviewService.getReviews()
    }).subscribe({
      next: (result: any) => {
        const notificationsList: any[] = [];

        // -------------------------
        // Leave Notifications
        // -------------------------
        if (
          this.role.toLowerCase() === 'school' ||
          this.role.toLowerCase() === 'office' ||
          this.role.toLowerCase() === 'project manager' ||
          this.role.toLowerCase() === 'team lead' ||
          this.role.toLowerCase() === 'hr' ||
          this.role.toLowerCase() === 'manager'
        ) {
          result.leaves.forEach((leave: any) => {
            const leaveEmployeeId = Number(
              leave.EmployeeID || leave.employeeID || leave.employeeId || 0
            );
            const isOwnLeave = leaveEmployeeId === currentEmployeeId && currentEmployeeId > 0;

            if (!isOwnLeave) {
              notificationsList.push({
                title: 'Leave Request',
                message: `${leave.applicantName || 'An employee'} applied for leave.`,
                date: leave.appliedDate || leave.appliedOn || new Date(),
                icon: 'bi-calendar-check',
                type: 'Leave'
              });
            }
          });
        }

        // Employees should see the status of their own leave requests.
        result.leaves.forEach((leave: any) => {
          const leaveEmployeeId = Number(
            leave.EmployeeID || leave.employeeID || leave.employeeId || 0
          );

          if (leaveEmployeeId === currentEmployeeId && currentEmployeeId > 0) {
            const status = leave.status || leave.Status || 'Pending';
            notificationsList.push({
              title: 'Leave Request Update',
              message: `Your ${leave.leaveType || leave.LeaveType || ''} leave request is ${status.toLowerCase()}.`,
              date: leave.actionDate || leave.appliedDate || leave.appliedOn || new Date(),
              icon: 'bi-calendar-check',
              type: 'Leave'
            });
          }
        });

        // -------------------------
        // Project Notifications
        // -------------------------
        result.projects.forEach((project: any) => {
          if (
            this.role.toLowerCase() === 'office' ||
            this.role.toLowerCase() === 'project manager' ||
            Number(project.managerId) === currentEmployeeId
          ) {
            notificationsList.push({
              title: 'New Project Created',
              message: `Project "${project.projectName}" has been created/assigned.`,
              date: project.createdDate || new Date(),
              icon: 'bi-kanban',
              type: 'Project'
            });
          }
        });

        // -------------------------
        // Review Notifications
        // -------------------------
        result.reviews.forEach((review: any) => {
          if (
            this.role.toLowerCase() === 'superadmin' ||
            this.role.toLowerCase() === 'office' ||
            this.role.toLowerCase() === 'project manager' ||
            this.role.toLowerCase() === 'team lead' ||
            this.role.toLowerCase() === 'manager' ||
            this.role.toLowerCase() === 'hr' ||
            Number(review.revieweeId) === currentEmployeeId
          ) {
            const reviewerName = this.getReviewerName(review.reviewerId);
            const revieweeName = Number(review.revieweeId) === currentEmployeeId ? 'you' : this.getRevieweeName(review.revieweeId);
            
            notificationsList.push({
              title: 'Performance Review',
              message: `A review was submitted for ${revieweeName} by ${reviewerName}.`,
              date: review.createdDate || new Date(),
              icon: 'bi-star-fill',
              type: 'Review'
            });
          }
        });

        // Sort: latest first
        this.notifications = notificationsList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
      error: (err) => {
        console.error('Error loading notifications data:', err);
      }
    });
  }
}
