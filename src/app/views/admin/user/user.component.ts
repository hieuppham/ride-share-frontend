import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { IConfirm } from 'src/app/interface/util';
import {
  FindUsersResponse,
  FindUsersAdminResponse,
} from 'src/app/interface/user';

@Component({
  templateUrl: 'user.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class UserComponent implements OnInit {
  constructor(private adminService: AdminService) {}

  users: FindUsersAdminResponse[] = [];

  userInfoModalVisible: boolean = false;
  toggleUserInfoModal(): void {
    this.userInfoModalVisible = !this.userInfoModalVisible;
  }

  chosenUser: FindUsersResponse | undefined;
  showUserInfo(user: FindUsersResponse) {
    this.chosenUser = user;
    this.toggleUserInfoModal();
  }

  ngOnInit(): void {
    this.findAllUsers();
  }

  private findAllUsers(): void {
    this.adminService.findAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => console.error(err),
      complete: () => console.log('done'),
    });
  }

  private updateStatus(id: string, event: any): void {
    // this.adminService
    //   .updateUserStatus({
    //     id: id,
    //     status: event.target.checked
    //       ? EntityStatus.ACTIVE
    //       : EntityStatus.INACTIVE,
    //   } as IRequestUpdateStatusDto)
    //   .subscribe({
    //     next: (res) => {
    //       this.getAllUsers();
    //     },
    //     error: (err) => console.error(err),
    //   });
  }

  confirm: IConfirm = {
    title: '',
    dismiss: '',
    accept: '',
    action: '',
  };
  confirmModalVisible: boolean = false;
  toggleConfirmModal(
    action: string,
    target?: string | number | any,
    data?: string | number | boolean | any
  ): void {
    switch (action) {
      case 'updateUserStatus': {
        this.confirm = {
          title: 'Cập nhật trạng thái người dùng',
          dismiss: 'Hủy',
          accept: 'Cập nhật',
          action: action,
          target: target!,
          data: data!,
        };
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
  }

  onAcceptConfirm(): void {
    switch (this.confirm.action) {
      case 'updateUserStatus': {
        this.updateStatus(this.confirm.target!, this.confirm.data!);
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
    this.findAllUsers();
  }
}
