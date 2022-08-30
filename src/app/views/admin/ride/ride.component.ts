import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { IConfirm } from 'src/app/interface/util';
import {
  FindRideDetailReponse,
  FindRidesAdminResponse,
} from 'src/app/interface/ride';
import { RideService } from 'src/app/services/ride.service';
@Component({
  templateUrl: './ride.component.html',
  styleUrls: ['../admin.component.scss'],
})
export class RideComponent implements OnInit {
  constructor(
    private adminService: AdminService,
    private rideService: RideService
  ) {}

  rides: FindRidesAdminResponse[] = [];
  ngOnInit(): void {
    this.adminService.findAllRides().subscribe({
      next: (res) => {
        this.rides = res;
      },
    });
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
      case 'updateRideStatus': {
        this.confirm = {
          title: 'Cập nhật trạng thái chuyến đi',
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

  rideDetailInfo: FindRideDetailReponse | undefined;
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

  onAcceptConfirm(): void {
    switch (this.confirm.action) {
      case 'updateRideStatus': {
        // this.rideService.updateRideStatus()
        break;
      }
      default: {
        break;
      }
    }
    this.confirmModalVisible = !this.confirmModalVisible;
  }
}
