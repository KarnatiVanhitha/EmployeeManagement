import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  role:any='';
  readonly schoolFeaturesEnabled = false;
 ngOnInit(): void {
  this.role=localStorage.getItem('role');
 }
 get isOfficeRole(): boolean {
  const officeRoles = [
    'office', 'Administrator', 'HR Manager', 'Project Manager', 'Team Lead',
    'Software Developer', 'UI/UX Designer', 'QA Engineer', 'DevOps Engineer',
    'Accountant', 'Receptionist', 'Support Executive', 'IT Manager', 
    'Finance Manager', 'Administration Manager', 'Sales Manager', 
    'Marketing Manager', 'Operations Manager', 'Customer Support Manager', 
    'R&D Manager', 'Training Manager', 'Product Owner', 'Scrum Master', 
    'Business Analyst', 'Project Coordinator', 'Technical Lead'
  ];
  return officeRoles.includes(this.role);
}
}
