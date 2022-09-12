import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Confirm } from 'src/app/interface/util';
import {
  FindUsersAdminResponse,
  UserDto,
  UpdateStatusRequest,
} from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';
import { UpdateStatusPipe } from 'src/app/pipes/update-status.pipe';

@Component({
  templateUrl: 'user.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class UserComponent implements OnInit {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private updateStatusPipe: UpdateStatusPipe
  ) {}

  users: FindUsersAdminResponse[] = [];

  userDetailInfo: UserDto | undefined;
  userInfoModalVisible: boolean = false;
  toggleUserInfoModal(id?: string): void {
    if (id) {
      this.userService.findUserById(id).subscribe({
        next: (res) => {
          this.userDetailInfo = res;
        },
      });
    }
    this.userInfoModalVisible = !this.userInfoModalVisible;
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
    });
  }

  private updateUserStatus(): void {
    const body: UpdateStatusRequest = {
      id: this.confirm.target,
      status: this.updateStatusPipe.transform(
        this.userDetailInfo!.status,
        'statusValue'
      ),
      sendEmail: this.sendEmail,
    };
    this.userService.updateUserStatus(body).subscribe({
      next: (res) => {
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  confirm: Confirm = {
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

  sendEmail: boolean = true;
  toggleSendEmail(): void {
    this.sendEmail = !this.sendEmail;
  }

  onAcceptConfirm(): void {
    switch (this.confirm.action) {
      case 'updateUserStatus': {
        this.updateUserStatus();
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
