import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 constructor(public router: Router, private employeeService: EmployeeService) {}
 isSidebarOpen = false;
 isAskMeOpen = false;
 profileImage = '';
 profileName = '';

 ngOnInit(): void {
   this.refreshProfile();
 }

 @HostListener('window:employeeProfileUpdated', ['$event'])
 onProfileUpdated(event: CustomEvent): void {
   const user = event.detail;
   this.profileImage = user?.EmployeePhoto ?? user?.employeePhoto ?? user?.image ?? '';
   this.profileName = user?.FullName ?? user?.fullName ?? user?.name ?? '';
 }

 private refreshProfile(): void {
   const user = this.employeeService.getLoggedInUser();
   this.profileImage = user?.EmployeePhoto ?? user?.employeePhoto ?? user?.image ?? '';
   this.profileName = user?.FullName ?? user?.fullName ?? user?.name ?? '';

   const employeeId = this.employeeService.getCurrentEmployeeId();
   if (employeeId === null) {
     return;
   }

   this.employeeService.getEmployeeById(employeeId).subscribe({
     next: (data: any) => {
       const profile = data?.employee ?? data?.data ?? data;
       this.profileImage = profile?.EmployeePhoto ?? profile?.employeePhoto ?? this.profileImage;
       this.profileName = profile?.FullName ?? profile?.fullName ?? this.profileName;
     },
     error: (error) => console.error('Unable to load header profile:', error)
   });
 }
}
