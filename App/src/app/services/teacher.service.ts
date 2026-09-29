import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
 private storageKey = 'teachers';

  getTeachers() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  /* GET ALL */

 getTeacherById(id: number) {
    return this.getTeachers().find((t: any) => t.id == id);
  }


  /* ADD */

  addTeacher(teacher: any) {

  const data = this.getTeachers();

  const newTeacher = {
    ...teacher,
    id: data.length + 1,
      role: 'Teacher' 
  };

  data.push(newTeacher);

  localStorage.setItem('teachers', JSON.stringify(data));
   // Store salary separately
  const salaries = JSON.parse(
    localStorage.getItem('salaries') || '[]'
  );

  salaries.push({
    id: newTeacher.id,
    employeeName: newTeacher.fullName || newTeacher.firstName,
    email: newTeacher.email,
    role: newTeacher.role,
    salary: newTeacher.salary,
    department: newTeacher.department,
    subject: newTeacher.subject
  });

  localStorage.setItem(
    'salaries',
    JSON.stringify(salaries)
  );
}
}
