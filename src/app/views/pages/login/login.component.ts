import { Component } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  Auth,
  signInWithPopup,
  OAuthCredential,
  User,
} from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { IUser } from 'src/app/interface/user';
import { UserService } from '../../../user.service';
import { EEntityStatus } from 'src/app/interface/entity-status';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private app: FirebaseApp = initializeApp(environment.firebaseConfig);
  private auth: Auth = getAuth(this.app);
  private provider: GoogleAuthProvider = new GoogleAuthProvider();

  constructor(private router: Router, private userService: UserService) {}

  public authGoogle(): void {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        this.userService.saveUser(this.toIUser(result.user)).subscribe({
          next: (res) => {
            this.router.navigate(['/map'], {
              queryParams: { uid: res.uid },
            });
          },
          error: (err) => console.error(err),
        });
      })
      .catch((error) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromError(error);
      });
  }

  private toIUser(googleUser: User): IUser {
    const user: IUser = {
      id: null,
      uid: googleUser.uid,
      gender: null,
      dob: null,
      photoUrl: googleUser.photoURL,
      fullName: null,
      email: googleUser.email,
      phone: googleUser.phoneNumber,
      vehicles: null,
      status: EEntityStatus.INACTIVE,
    };
    return user;
  }
}
