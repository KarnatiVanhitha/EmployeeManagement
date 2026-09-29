import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

interface Student {
  id: number;
  name: string;
  class: string;
  totalFee: number;
  paidFee: number;
  unpaidFee: number;
}
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent {
 // Selected values
  selectedClass: string = '';
  selectedStudent: Student | null = null;

  // Payment mode
  paymentMode: string = 'cash';

  // All students
  students: Student[] = [
    {
      id: 1,
      name: 'Rahul Sharma',
      class: 'JSS 1',
      totalFee: 50000,
      paidFee: 30000,
      unpaidFee: 20000
    },
    {
      id: 2,
      name: 'Anjali Verma',
      class: 'JSS 1',
      totalFee: 45000,
      paidFee: 45000,
      unpaidFee: 0
    },
    {
      id: 3,
      name: 'Vikram Singh',
      class: 'JSS 2',
      totalFee: 60000,
      paidFee: 25000,
      unpaidFee: 35000
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      class: 'SS 1',
      totalFee: 70000,
      paidFee: 50000,
      unpaidFee: 20000
    },
    {
      id: 5,
      name: 'Arjun Kumar',
      class: 'SS 2',
      totalFee: 80000,
      paidFee: 80000,
      unpaidFee: 0
    }
  ];

  // Filtered students
  filteredStudents: Student[] = [];
  studentError = '';

  constructor(private toastService: ToastService) {}

  // Filter students by class
  onClassChange(): void {
    this.studentError = '';
    this.filteredStudents = this.students.filter(
      student => student.class === this.selectedClass
    );

    // Reset selected student
    this.selectedStudent = null;
  }

  // Student selection
  onStudentSelect(): void {
    this.studentError = '';
    console.log('Selected Student:', this.selectedStudent);
  }

  // Confirm payment
  confirmPayment(): void {
    this.studentError = '';
    if (!this.selectedStudent) {
      this.studentError = 'Please select a student';
      this.toastService.showError('Please select a student');
      return;
    }

    this.toastService.showSuccess(
      `Payment successful for ${this.selectedStudent.name} using ${this.paymentMode.toUpperCase()}`
    );

    console.log({
      student: this.selectedStudent,
      paymentMode: this.paymentMode
    });

  }

}
