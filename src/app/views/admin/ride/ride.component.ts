import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Confirm } from '../../../interface/util';
import {
  FindRideDetailResponse,
  FindRidesAdminResponse,
} from 'src/app/interface/ride';
import { RideService } from '../../../services/ride.service';
import { UpdateStatusRequest } from 'src/app/interface/user';
import { UpdateStatusPipe } from 'src/app/pipes/update-status.pipe';
import { socketClient } from 'src/app/services/socket-client/socket.client';
@Component({
  templateUrl: './ride.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class RideComponent implements OnInit {
  constructor(
    private adminService: AdminService,
    private rideService: RideService,
    private updateStatusPipe: UpdateStatusPipe
  ) {}

  rides: FindRidesAdminResponse[] = [];
  ngOnInit(): void {
    this.adminService.findAllRides().subscribe({
      next: (res) => {
        this.rides = res;
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
      case 'updateRideStatus': {
        this.confirm = {
          title: 'Cập nhật trạng thái hành trình',
          dismiss: 'Hủy',
          accept: 'Cập nhật',
          action: action,
          target: target!,
          data: this.updateStatusPipe.transform(data!, 'statusValue'),
        };
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
  }

  rideDetailInfo: FindRideDetailResponse | undefined;
  rideInfoModalVisible: boolean = false;
  toggleRideInfoModal(id?: string): void {
    if (id) {
      this.rideService.findRideDetailById(id).subscribe({
        next: (res) => {
          this.rideDetailInfo = res;
        },
      });
    }
    this.rideInfoModalVisible = !this.rideInfoModalVisible;
  }

  private updateRideStatus(): void {
    const body: UpdateStatusRequest = {
      id: this.confirm.target,
      status: this.confirm.data,
      sendEmail: this.sendEmail,
    };
    this.rideService.updateRideStatus(body).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  sendEmail: boolean = true;
  toggleSendEmail(): void {
    this.sendEmail = !this.sendEmail;
  }

  onAcceptConfirm(): void {
    switch (this.confirm.action) {
      case 'updateRideStatus': {
        this.updateRideStatus();
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
  }
}
