import { Component } from '@angular/core';
import { AuthService } from '../../../services/firebase/auth/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  public errorModalVisible: boolean = false;
  toggleErrorModal(): void {
    this.errorModalVisible = !this.errorModalVisible;
  }

  public signIn(): void {
    this.authService.signInApp();
  }
}
