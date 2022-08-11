import { Component, OnInit } from '@angular/core';
import { EEntityStatus } from 'src/app/interface/entity-status';
import { IRideResponseDto } from 'src/app/interface/ride-reponse-dto';
import { IRideRequestDto } from 'src/app/interface/ride-request-dto';
import { AdminService } from '../admin.service';

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
    this.adminService.getAllRides({} as IRideRequestDto).subscribe({
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

  public vehicle(type: string): string {
    return type === 'motobike' ? 'Xe máy' : 'Ô tô';
  }
}
