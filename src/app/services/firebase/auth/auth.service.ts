import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  getAuth,
  Auth,
  signInWithPopup,
  OAuthCredential,
  User,
  signOut,
} from 'firebase/auth';
import { UserService } from 'src/app/services/user.service';
import { app } from '../index';
import { Router } from '@angular/router';

import { IUser } from '../../../interface/user';
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
        this.userService.upsertUser(this.toIUser(result.user)).subscribe({
          next: (res) => {
            localStorage.setItem('uid', res.uid);
            this.router.navigate(['/map']);
          },
          error: (err) => console.error(err),
        });
      })
      .catch((error) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromError(error);
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

  private toIUser(googleUser: User): IUser {
    return {
      uid: googleUser.uid,
      photoUrl: googleUser.photoURL,
      phone: googleUser.phoneNumber,
      email: googleUser.email,
    } as IUser;
  }
}
