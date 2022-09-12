import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../../services/firebase/auth/auth.service';
import {Router} from "@angular/router";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit{
  ngOnInit() {
    this.router.navigate(["/map"]);
  }

  constructor(private authService: AuthService, private router: Router) {}

  public errorModalVisible: boolean = false;
  toggleErrorModal(): void {
    this.errorModalVisible = !this.errorModalVisible;
  }

  public signIn(): void {
    this.authService.signInApp();
  }
}
