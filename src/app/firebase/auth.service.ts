import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
// import * as firebaseui from 'firebaseui';
import {
  GoogleAuthProvider,
  getAuth,
  Auth,
  signInWithPopup,
  OAuthCredential,
  User,
} from 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private app: FirebaseApp = initializeApp(environment.firebaseConfig);
  private auth: Auth = getAuth(this.app);
  // private ui: firebaseui.auth.AuthUI = new firebaseui.auth.AuthUI(this.auth);
  private provider: GoogleAuthProvider = new GoogleAuthProvider();

  constructor() {
    // this.ui.start('#firebase-auth-container', {
    //   signInOptions: [
    //     {
    //       provider: GoogleAuthProvider.PROVIDER_ID,
    //     },
    //   ],
    // });
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromResult(result);
        const token: string | undefined = credential?.accessToken;
        const user: User = result.user;
        console.log(result);
      })
      .catch((error) => {
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromError(error);
        console.log(error);
      });
  }
}
