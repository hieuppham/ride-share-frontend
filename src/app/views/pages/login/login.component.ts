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
        this.userService.upsertUser(this.toIUser(result.user)).subscribe({
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
    return {
      uid: googleUser.uid,
      photoUrl: googleUser.photoURL,
      phone: googleUser.phoneNumber,
      email: googleUser.email,
    } as IUser;
  }
}
