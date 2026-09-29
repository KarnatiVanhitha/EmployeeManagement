import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  employees: any[] = [];
  selectedEmployee: any = null;

  constructor(private employeeService: EmployeeService, private route: Router, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }
//================================================================LOABEMPLOYEES============================================================//
  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        console.error(err);
      }
    });

  }
//=================================================================VIEWEMPLOYEES============================================================//
  viewEmployee(emp: any): void {
    this.selectedEmployee = emp;
  }
  //=================================================================EDITEMPLOYEE===========================================================//
  editEmployee(id:any){

    this.route.navigate(
      ['/home/add-employee',id.EmployeeID]
    );

}
//=====================================================================DELETEEMPLOYEE========================================================//
 deleteEmployee(id: number): void {

  if (!confirm("Are you sure?")) {
    return;
  }

  this.employeeService.deleteEmployee(id).subscribe({

    next: () => {

      this.toastService.showSuccess('Deleted Successfully');

      this.loadEmployees();

    },

    error: (err) => {

      console.error(err);

    }

  });

}
}