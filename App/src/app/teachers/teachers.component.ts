import { Component } from '@angular/core';
import { TeacherService } from '../../app/services/teacher.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent {
  expandedTeacherId: number | null = null;
    teachers: any[] = [];
    selectedTeacher: any = null;
    selectedTeacherId: number | null = null;

  constructor(
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTeachers();
      
  }

  loadTeachers() {
    this.teachers = this.teacherService.getTeachers();
  }

 viewTeacher(id: number, event?: Event) {
  if (event) event.stopPropagation();

  if (this.selectedTeacherId === id) {
    this.selectedTeacherId = null;
    this.selectedTeacher = null;
    return;
  }

  this.selectedTeacherId = id;
  this.selectedTeacher = this.teachers.find(t => t.id === id);
}
   removeTeacher(id: any): void {
  this.teachers = this.teachers.filter(
    (teacher: any) => teacher.id !== id
  );
  localStorage.setItem('teachers', JSON.stringify(this.teachers));

  console.log("Teacher removed");
  console.log(this.teachers);
}
toggleDropdown(id: number): void {
  if (this.expandedTeacherId === id) {
    this.expandedTeacherId = null; // close
  } else {
    this.expandedTeacherId = id; // open
  }
}
showAllSyllabus = false;

syllabusList = [
  {
    class: 'Class V, B',
    title: 'Introduction Note to Physics on Tech',
    progress: 80,
    color: 'success'
  },
  {
    class: 'Class V, A',
    title: 'Biometric & their Working Functionality',
    progress: 80,
    color: 'warning'
  },
  {
    class: 'Class IV, C',
    title: 'Analyze and interpret literary texts skills',
    progress: 80,
    color: 'primary'
  },
  {
    class: 'Class V, A',
    title: 'Enhance vocabulary and grammar skills',
    progress: 30,
    color: 'danger'
  },
  {
    class: 'Class VI, A',
    title: 'Science Fundamentals',
    progress: 60,
    color: 'info'
  },
  {
    class: 'Class VII, B',
    title: 'Mathematics Algebra',
    progress: 90,
    color: 'secondary'
  }
];
  sameClassTeachers: any[] = [];
  todayDate = new Date();
  changeDate(days: number): void {

  // Clone current date
  const newDate = new Date(this.todayDate);

  // Add / subtract days
  newDate.setDate(newDate.getDate() + days);

  // Update current date
  this.todayDate = newDate;

  console.log(this.todayDate);
}
editTeacher: any = {};

selectedTeacherIndex = -1;

openEditModal(teacher: any): void {

  this.selectedTeacherIndex =
    this.teachers.findIndex(t => t.id === teacher.id);

  this.editTeacher = { ...teacher };
}

saveTeacher(): void {

  if (this.selectedTeacherIndex !== -1) {

    this.teachers[this.selectedTeacherIndex] = {
      ...this.editTeacher
    };

    if (this.expandedTeacherId === this.editTeacher.id) {

      const index = this.teachers.findIndex(
        t => t.id === this.editTeacher.id
      );

      this.selectedTeacher = this.teachers[index];
    }
  }
}
}


