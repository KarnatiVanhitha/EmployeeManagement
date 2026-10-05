import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  role = '';
  readonly schoolFeaturesEnabled = false;

  ngOnInit(): void {
    this.role = localStorage.getItem('role')?.trim() ?? '';
  }

  get isOfficeRole(): boolean {
    const normalizedRole = this.role.toLowerCase().replace(/[\s_-]/g, '');
    const schoolRoles = new Set([
      'school',
      'schooladmin',
      'schooladministrator',
      'teacher',
      'student',
      'staff'
    ]);

    return !!normalizedRole &&
      !schoolRoles.has(normalizedRole) &&
      !normalizedRole.startsWith('school');
  }
}
