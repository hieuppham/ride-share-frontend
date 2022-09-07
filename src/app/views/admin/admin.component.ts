import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDto } from 'src/app/interface/user';
import { socketClient } from 'src/app/services/socket-client/socket.client';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin',
  styleUrls: ['admin.component.scss'],
  templateUrl: 'admin.component.html',
})
export class AdminComponent implements AfterContentInit, OnDestroy {
  constructor(private userService: UserService) {}
  user: UserDto | undefined;
  loadAllDone: boolean = false;

  ngAfterContentInit(): void {
    this.loadUserInfo();
    this.loadAllDone = true;
    if (socketClient.disconnected) {
      socketClient.connect();
    }
  }

  ngOnDestroy(): void {
    if (socketClient.connected) {
      socketClient.disconnect();
    }
  }

  private loadUserInfo(): void {
    const id: string = localStorage.getItem('id')!;
    this.userService.findUserById(id).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
