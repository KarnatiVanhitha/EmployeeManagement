import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admins.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    admins: any[] = [];
  searchText: string = '';
  expandedAdminId: number | null = null;

  constructor(private adminService: AdminService, private toastService: ToastService) { }
  ngOnInit(): void {
    this.loadAdmins();
  }

loadAdmins(): void {

  this.adminService.getAdmins().subscribe({

    next: (res: any) => {

      this.admins = res;

      console.log(this.admins);

    },

    error: (err: any) => {

      console.log(err);

      this.toastService.showError('Failed to load admins');

    }

  });

}
  deleteAdmin(id: number): void {
    this.admins = this.admins.filter(admin => admin.id !== id);
    localStorage.setItem('admins', JSON.stringify(this.admins));
  }

  toggleAdmin(id: number): void {
    this.expandedAdminId =
      this.expandedAdminId === id ? null : id;
  }
}
