import { Component, OnInit } from '@angular/core';
import { EEntityStatus } from 'src/app/interface/entity-status';
import { IRideResponseDto } from 'src/app/interface/ride-reponse-dto';
import { AdminService } from '../admin.service';
import { IRequestUpdateStatusDto } from '../../../interface/request-update-status-dto';
@Component({
  templateUrl: 'ride.component.html',
  styleUrls: ['ride.component.scss'],
})
export class RideComponent implements OnInit {
  rideResponseDto: IRideResponseDto[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.getAllRides();
  }

  getAllRides(): void {
    this.adminService.getAllRides().subscribe({
      next: (res) => {
        this.rideResponseDto = res;
      },
      error: (err) => console.error(err),
      complete: () => console.log('load rides done'),
    });
  }

  status(status: string): string {
    let result: string;
    switch (status) {
      case 'ACTIVE': {
        result = 'Hoạt động';
        break;
      }
      case 'EXPIRED': {
        result = 'Đã kết thúc';
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

  isActive(status: EEntityStatus): boolean {
    return status.toString() === 'ACTIVE';
  }

  updateStatus(id: string, event: any) {
    this.adminService
      .updateRideStatus({
        id: id,
        status: event.target.checked
          ? EEntityStatus.ACTIVE
          : EEntityStatus.INACTIVE,
      } as IRequestUpdateStatusDto)
      .subscribe({
        next: (res) => {
          this.getAllRides();
        },
        error: (err) => console.error(err),
      });
  }

  public vehicle(type: string): string {
    return type === 'motobike' ? 'Xe máy' : 'Ô tô';
  }
}
