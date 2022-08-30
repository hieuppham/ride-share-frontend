import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDto } from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin',
  styleUrls: ['admin.component.scss'],
  templateUrl: 'admin.component.html',
})
export class AdminComponent implements OnInit {
  constructor(private userService: UserService) {}
  user: UserDto | undefined;
  ngOnInit(): void {
    this.loadUserInfo();
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
