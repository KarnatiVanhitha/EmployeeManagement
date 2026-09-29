import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  // =========================================================
  // API URLS
  // =========================================================

  private apiUrl = '/api/employees';

  private superAdminApiUrl =
    '/api/SuperAdmins';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // GET ALL EMPLOYEES
  // =========================================================

  getEmployees(): Observable<any[]> {

    return this.http.get<any[]>(
      this.apiUrl
    );

  }


  // =========================================================
  // GET EMPLOYEE BY ID
  // =========================================================

  getEmployeeById(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================================
  // ADD EMPLOYEE
  // =========================================================

  addEmployee(
    employee: any
  ): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      employee
    );

  }


  // =========================================================
  // UPDATE EMPLOYEE
  // =========================================================

  updateEmployee(
    id: number,
    employee: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      employee
    );

  }


  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  deleteEmployee(
    id: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================================
  // GET ROLES
  // =========================================================

  getRoles(): Observable<any[]> {

    return this.http.get<any[]>(
      '/api/roles'
    );

  }


  // =========================================================
  // GET ROLES BY DEPARTMENT
  // =========================================================

  getRolesByDepartment(
    departmentId: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `/api/roles/department/${departmentId}`
    );

  }


  // =========================================================
  // GET DEPARTMENTS
  // =========================================================

  getDepartment(): Observable<any> {

    return this.http.get<any>(
      '/api/departments'
    );

  }


  // =========================================================
  // NORMAL EMPLOYEE LOGIN
  // =========================================================
  //
  // POST:
  // /api/employees/login
  //
  // data should contain whatever your backend expects,
  // for example:
  //
  // {
  //   Email: 'employee@gmail.com',
  //   Password: '123456'
  // }
  //
  // =========================================================

  login(
    data: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      data
    );

  }


  // =========================================================
  // SUPER ADMIN LOGIN
  // =========================================================
  //
  // POST:
  // /api/SuperAdmins/login
  //
  // =========================================================

  superAdminLogin(
    data: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.superAdminApiUrl}/login`,
      data
    );

  }


  // =========================================================
  // VERIFY EMAIL
  // =========================================================

  verifyEmail(
    email: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/verify-email`,
      {
        Email: email
      }
    );

  }


  // =========================================================
  // RESET PASSWORD
  // =========================================================

  resetPassword(
    data: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/reset-password`,
      data
    );

  }


  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================
  //
  // Dashboard can call:
  //
  // const user = this.employeeService.getLoggedInUser();
  //
  // =========================================================

  getLoggedInUser(): any {

    try {

      const loggedInUser =
        localStorage.getItem('loggedInUser');

      if (loggedInUser) {

        return JSON.parse(
          loggedInUser
        );

      }


      // -----------------------------------------------------
      // Fallback for currentUser
      // -----------------------------------------------------

      const currentUser =
        localStorage.getItem('currentUser');

      if (currentUser) {

        return JSON.parse(
          currentUser
        );

      }

    } catch (error) {

      console.error(
        'Unable to read logged-in user:',
        error
      );

    }

    return null;

  }


  // =========================================================
  // SAVE LOGGED-IN USER
  // =========================================================

  setLoggedInUser(
    user: any
  ): void {

    localStorage.setItem(
      'loggedInUser',
      JSON.stringify(user)
    );

    localStorage.setItem(
      'currentUser',
      JSON.stringify(user)
    );

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {

    localStorage.removeItem(
      'loggedInUser'
    );

    localStorage.removeItem(
      'currentUser'
    );

    localStorage.removeItem(
      'role'
    );

    localStorage.removeItem(
      'isLoggedIn'
    );

    localStorage.removeItem(
      'userType'
    );

  }


  // =========================================================
  // CHECK LOGIN STATUS
  // =========================================================

  isLoggedIn(): boolean {

    return (
      localStorage.getItem(
        'isLoggedIn'
      ) === 'true'
    );

  }


  // =========================================================
  // GET CURRENT ROLE
  // =========================================================

  getCurrentRole(): string {

    const user =
      this.getLoggedInUser();

    if (!user) {

      return (
        localStorage.getItem(
          'role'
        ) || ''
      );

    }


    return (
      user.RoleName ??
      user.roleName ??
      user.Role ??
      user.role ??
      user.Designation ??
      user.designation ??
      localStorage.getItem('role') ??
      ''
    );

  }


  // =========================================================
  // GET CURRENT EMPLOYEE ID
  // =========================================================

  getCurrentEmployeeId(): number | null {

    const user =
      this.getLoggedInUser();

    if (!user) {

      return null;

    }


    const employeeId =
      user.EmployeeID ??
      user.employeeId ??
      user.EmployeeId ??
      user.id;


    if (
      employeeId === null ||
      employeeId === undefined ||
      employeeId === ''
    ) {

      return null;

    }


    const id =
      Number(employeeId);


    return isNaN(id)
      ? null
      : id;

  }

}