import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent {
  constructor(private toastService: ToastService) {}
  staffList: any[] = [];
  selectedStaff: any = null;
  expandedStaffIndex: number | null = null;
  isEditMode: boolean = false;
  ngOnInit(): void {
    this.getStaffData();
  }

  getStaffData() {
    const data = localStorage.getItem('staffList');
    const list = data ? JSON.parse(data) : [];
    this.staffList = list.filter((item: any) => {
      return item && item.firstName && item.lastName && !item.studentid && !item.name;
    });

    if (list.length !== this.staffList.length) {
      localStorage.setItem('staffList', JSON.stringify(this.staffList));
    }
  }

  // DELETE STAFF
  deleteStaff(index: number) {
    const confirmDelete = confirm('Are you sure you want to delete?');

    if (confirmDelete) {
      this.staffList.splice(index, 1);
      localStorage.setItem('staffList', JSON.stringify(this.staffList));

      if (this.expandedStaffIndex === index) {
        this.closeDetails();
      }
    }
  }

  // VIEW DETAILS
  toggleDetails(index: number): void {
    if (this.expandedStaffIndex === index) {
      this.closeDetails();
      return;
    }

    this.expandedStaffIndex = index;
    this.selectedStaff = this.staffList[index];
  }
editStaff(): void {

    this.isEditMode = true;
  }

  updateStaff(): void {

    const index = this.staffList.findIndex(
      staff =>
        staff.teacherId === this.selectedStaff.teacherId
    );

    if (index !== -1) {

      this.staffList[index] = {
        ...this.selectedStaff
      };

      localStorage.setItem(
        'staff',
        JSON.stringify(this.staffList)
      );

      this.isEditMode = false;

      this.toastService.showSuccess('Staff Updated Successfully');
    }
  }

  cancelEdit(): void {

    this.isEditMode = false;

    if (this.expandedStaffIndex !== null) {

      this.selectedStaff = {
        ...this.staffList[this.expandedStaffIndex]
      };
    }
  }

  closeDetails(): void {

    this.expandedStaffIndex = null;
    this.isEditMode = false;
  }
}
