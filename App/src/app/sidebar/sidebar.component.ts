import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  role = '';
  readonly schoolFeaturesEnabled = false;

  toggleCollapsed(): void {
    this.collapsedChange.emit(!this.collapsed);
  }

  expandForSubmenu(): void {
    if (this.collapsed) {
      this.collapsedChange.emit(false);
    }
  }

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

  get canManageEmployees(): boolean {
    const normalizedRole = this.role.toLowerCase().replace(/[\s_-]/g, '');
    return ['office', 'admin', 'superadmin'].includes(normalizedRole);
  }

}
