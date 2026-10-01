import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { EmployeeService } from '../services/employee.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  showReviewForm = false;
  employees: any[] = [];
  currentUser: any;
  reviews: any[] = [];
  myReviews: any[] = [];
  selectedReview: any = null;

  reviewForm = {
    id: 0,
    ReviewType: '',
    ReviewBeginOn: '',
    ReviewCompletionOn: '',
    RevieweeID: '',
    ReviewerID: 0,
    Achievements: '',
    Skills: '',
    Goals: '',
    Comments: '',
    Rating: 0,
    Status: 'Pending'
  };

  reviewTypeError = '';
  reviewBeginOnError = '';
  reviewCompletionOnError = '';
  revieweeIDError = '';

  clearErrors(): void {
    this.reviewTypeError = '';
    this.reviewBeginOnError = '';
    this.reviewCompletionOnError = '';
    this.revieweeIDError = '';
  }

  constructor(
    private reviewService: ReviewService,
    private employeeService: EmployeeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );

    this.reviewForm.ReviewerID = Number(
      this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0
    );

    this.loadEmployees();
    this.loadReviews();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.employees = [];
      }
    });
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (data: any) => {
        this.reviews = data;
        const currentEmployeeId = Number(
          this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0
        );
        this.myReviews = this.reviews.filter(
          (review: any) => Number(review.revieweeId) === currentEmployeeId
        );
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviews = [];
        this.myReviews = [];
      }
    });
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) {
      this.resetForm();
    }
  }

  canAddReview(): boolean {
    return true;
  }

  canManageReviews(): boolean {
    const role = (localStorage.getItem('role') || '').trim().toLowerCase();
    return ['office', 'project manager', 'team lead', 'hr', 'manager'].includes(role);
  }

  submitReview(): void {
    this.clearErrors();
    let hasError = false;

    if (!this.reviewForm.ReviewType) {
      this.reviewTypeError = 'Please select a review type';
      hasError = true;
    }

    if (!this.reviewForm.ReviewBeginOn) {
      this.reviewBeginOnError = 'Please enter review begin date';
      hasError = true;
    }

    if (!this.reviewForm.ReviewCompletionOn) {
      this.reviewCompletionOnError = 'Please enter review completion date';
      hasError = true;
    }

    if (!this.reviewForm.RevieweeID) {
      this.revieweeIDError = 'Please select an employee to review';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please fix the errors below');
      return;
    }

    const payload = {
      ReviewType: this.reviewForm.ReviewType,
      ReviewBeginOn: this.reviewForm.ReviewBeginOn,
      ReviewCompletionOn: this.reviewForm.ReviewCompletionOn,
      RevieweeID: Number(this.reviewForm.RevieweeID),
      ReviewerID: this.reviewForm.ReviewerID,
      Achievements: this.reviewForm.Achievements,
      Skills: this.reviewForm.Skills,
      Goals: this.reviewForm.Goals,
      Comments: this.reviewForm.Comments,
      Rating: this.reviewForm.Rating,
      Status: this.reviewForm.Status
    };

    if (this.reviewForm.id && this.reviewForm.id > 0) {
      this.reviewService.updateReview(this.reviewForm.id, payload).subscribe({
        next: (response: any) => {
          this.toastService.showSuccess(response.message || 'Review Updated Successfully');
          this.loadReviews();
          this.resetForm();
          this.showReviewForm = false;
        },
        error: (err) => {
          console.error('Error updating review:', err);
          this.toastService.showError(err.error?.message || 'Failed to update review');
        }
      });
    } else {
      this.reviewService.addReview(payload).subscribe({
        next: (response: any) => {
          this.toastService.showSuccess(response.message || 'Review Added Successfully');
          this.loadReviews();
          this.resetForm();
          this.showReviewForm = false;
        },
        error: (err) => {
          console.error('Error adding review:', err);
          this.toastService.showError(err.error?.message || 'Failed to add review');
        }
      });
    }
  }

  resetForm(): void {
    this.reviewForm = {
      id: 0,
      ReviewType: '',
      ReviewBeginOn: '',
      ReviewCompletionOn: '',
      RevieweeID: '',
      ReviewerID: Number(
        this.currentUser.EmployeeID || this.currentUser.employeeID || this.currentUser.id || 0
      ),
      Achievements: '',
      Skills: '',
      Goals: '',
      Comments: '',
      Rating: 0,
      Status: 'Pending'
    };
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          this.toastService.showSuccess('Review Deleted Successfully');
          this.loadReviews();
        },
        error: (err) => {
          console.error('Error deleting review:', err);
          this.toastService.showError(err.error?.message || 'Failed to delete review');
        }
      });
    }
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

  viewReview(review: any): void {
    this.selectedReview = review;
  }

  editReview(review: any): void {
    const formatReviewDate = (dateStr: any) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };

    this.reviewForm = {
      id: review.reviewId,
      ReviewType: review.reviewType,
      ReviewBeginOn: formatReviewDate(review.reviewBeginOn),
      ReviewCompletionOn: formatReviewDate(review.reviewCompletionOn),
      RevieweeID: String(review.revieweeId),
      ReviewerID: review.reviewerId,
      Achievements: review.achievements,
      Skills: review.skills,
      Goals: review.goals,
      Comments: review.comments,
      Rating: review.rating,
      Status: review.status || 'Pending'
    };
    this.showReviewForm = true;
  }
}
