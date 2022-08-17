import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../interface/user';
import { AdminService } from '../admin.service';
import { EEntityStatus } from 'src/app/interface/entity-status';
import { IRequestUpdateStatusDto } from 'src/app/interface/request-update-status-dto';
@Component({
  templateUrl: 'user.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class UserComponent implements OnInit {
  constructor(private adminService: AdminService) {}

  users: IUser[] = [];

  gender(gender: string): string {
    return gender == 'male' ? 'Nam' : 'female' ? 'Nữ' : 'Cả nam và nữ';
  }

  status(status: string): string {
    let result: string;
    switch (status) {
      case 'ACTIVE': {
        result = 'Hoạt động';
        break;
      }
      case 'INACTIVE': {
        result = 'Không hoạt động';
        break;
      }
      case 'UNKNOWN': {
        result = 'Chưa phê duyệt';
        break;
      }
      default: {
        result = 'Chưa phê duyệt';
        break;
      }
    }
    return result;
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => console.error(err),
      complete: () => console.log('done'),
    });
  }

  isActive(status: EEntityStatus): boolean {
    return status.toString() == 'ACTIVE';
  }

  updateStatus(id: string, event: any): void {
    this.adminService
      .updateUserStatus({
        id: id,
        status: event.target.checked
          ? EEntityStatus.ACTIVE
          : EEntityStatus.INACTIVE,
      } as IRequestUpdateStatusDto)
      .subscribe({
        next: (res) => {
          this.getAllUsers();
        },
        error: (err) => console.error(err),
      });
  }
}
