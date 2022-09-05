import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  getAuth,
  Auth,
  signInWithPopup,
  OAuthCredential,
  signOut,
} from 'firebase/auth';
import { UserService } from 'src/app/services/user.service';
import { app } from '../index';
import { Router } from '@angular/router';

import * as user from '../../../interface/user';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = getAuth(app);
  private provider: GoogleAuthProvider = new GoogleAuthProvider();
  constructor(private userService: UserService, private router: Router) {}

  public signInApp(): void {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        this.userService
          .saveUser(result.user.uid, result.user.email!, result.user.photoURL!)
          .subscribe({
            next: (res: user.UserDto) => {
              localStorage.setItem('id', res.id);
              this.router.navigate(['/map']);
            },
            error: (err) => {
              throw err;
            },
          });
      })
      .catch((error) => {
        // const credential: OAuthCredential | null =
        //   GoogleAuthProvider.credentialFromError(error);
      });
  }

  public signOutApp(): void {
    signOut(this.auth)
      .then((res) => {
        localStorage.clear();
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
