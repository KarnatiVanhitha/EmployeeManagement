import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TeachersComponent } from './teachers/teachers.component';
import { StudentsComponent } from './students/students.component';
import { AddTeacherComponent } from './add-teacher/add-teacher.component';
import { BillingComponent } from './billing/billing.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { ClassComponent } from './class/class.component';
import { StaffComponent } from './staff/staff.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { TimetableComponent } from './timetable/timetable.component';
import { HomeworkComponent } from './homework/homework.component';
import { ExamsComponent } from './exams/exams.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { HostelDayscholarComponent } from './hostel-dayscholar/hostel-dayscholar.component';
import { TransportComponent } from './transport/transport.component';
import { SettingsandprofileComponent } from './settingsandprofile/settingsandprofile.component';
import { SalariesComponent } from './salaries/salaries.component';
import { AdminComponent } from './admin/admin.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { EmployeeComponent } from './employee/employee.component';
import { LeaveComponent } from './leave/leave.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ManagersComponent } from './managers/managers.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CalenderComponent } from './calender/calender.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ToastComponent } from './shared/toast/toast.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignInComponent,
    DashboardComponent,
    HomeComponent,
    SidebarComponent,
    TeachersComponent,
    StudentsComponent,
    AddTeacherComponent,
    BillingComponent,
     AddStudentComponent,
     ClassComponent,
     StaffComponent,
     AddStaffComponent,
     TimetableComponent,
     HomeworkComponent,
    
     ExamsComponent,
     HolidaysComponent,
     AdminLoginComponent,
     HostelDayscholarComponent,
     TransportComponent,
     SettingsandprofileComponent,
     SalariesComponent,
     AdminComponent,
     AddAdminComponent,
     AddEmployeeComponent,
     EmployeeComponent,
     LeaveComponent,
     ProjectsComponent,
     ReviewsComponent,
     ManagersComponent,
     NotificationsComponent,
     CalenderComponent,
     TimeSheetComponent,
     ForgotPasswordComponent,
     ResetPasswordComponent,
     ToastComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
