import { Component, EventEmitter } from '@angular/core';
// import { AuthService } from '../../../firebase/auth.service';

import { FirebaseApp, initializeApp } from 'firebase/app';
import * as firebaseui from 'firebaseui';
import {
  GoogleAuthProvider,
  getAuth,
  Auth,
  signInWithPopup,
  OAuthCredential,
  User,
  UserCredential,
} from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { Output } from '@angular/core';
import { Route, Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private app: FirebaseApp = initializeApp(environment.firebaseConfig);
  private auth: Auth = getAuth(this.app);
  private provider: GoogleAuthProvider = new GoogleAuthProvider();

  constructor(private router: Router) {}

  public authGoogle(): void {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromResult(result);
        this.router.navigate(['/map'], {
          queryParams: { photoURL: result.user.photoURL },
        });
      })
      .catch((error) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromError(error);
      });
  }
}
