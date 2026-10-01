import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { TeachersComponent } from './teachers/teachers.component';
import { StudentsComponent } from './students/students.component';
import { AddTeacherComponent } from './add-teacher/add-teacher.component';
import { BillingComponent } from './billing/billing.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { ClassComponent } from './class/class.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { StaffComponent } from './staff/staff.component';
import { TimetableComponent } from './timetable/timetable.component';
import { ExamsComponent } from './exams/exams.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { HomeworkComponent } from './homework/homework.component';
import { HostelDayscholarComponent } from './hostel-dayscholar/hostel-dayscholar.component';
import { TransportComponent } from './transport/transport.component';
import { SettingsandprofileComponent } from './settingsandprofile/settingsandprofile.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AdminComponent } from './admin/admin.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { EmployeeComponent } from './employee/employee.component';
import { LeaveComponent } from './leave/leave.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CalenderComponent } from './calender/calender.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { ManagersComponent } from './managers/managers.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


const routes: Routes = [
  { path: "", component: LoginComponent },
  // School account registration is temporarily disabled.
  // { path: "SignIn", component: SignInComponent },
  { path: "employee-signup", component: AddEmployeeComponent },
  { path: "Admin-login", component: AdminLoginComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent },
  {
    path: "home", component: HomeComponent,
    children: [
      { path: "", component: DashboardComponent },
      { path: "teachers", component: TeachersComponent },
      { path: 'teachers/add', component: AddTeacherComponent },
      { path: 'admin/addadmin', component: AddAdminComponent },
      { path: "admin", component: AdminComponent },
      { path: "students", component: StudentsComponent },
      { path: "timetable", component: TimetableComponent },
      { path: "homework", component: HomeworkComponent },
      { path: "leaves", component: LeaveComponent },
      { path: "projects", component: ProjectsComponent },
      { path: "exams", component: ExamsComponent },
      { path: "Reviews", component: ReviewsComponent },
      { path: "holidays", component: HolidaysComponent },
      { path: "employee", component: EmployeeComponent },
      { path: 'add-employee/:id', component: AddEmployeeComponent },
      { path: "add-employee", component: AddEmployeeComponent },
      { path: "managers", component: ManagersComponent },
      { path: "students/addstudent", component: AddStudentComponent },
      { path: "students/class", component: ClassComponent },
      { path: "transport", component: TransportComponent },
      { path: "addstaff", component: AddStaffComponent },
      { path: "staff", component: StaffComponent },
      { path: "calender", component: CalenderComponent },
      { path: "timesheet", component: TimeSheetComponent },
      { path: "billing", component: BillingComponent },
      { path: "notification", component: NotificationsComponent },
      { path: "hostel-dayscholar", component: HostelDayscholarComponent },
      { path: "transport", component: TransportComponent },
      { path: "settings", component: SettingsandprofileComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
