import { FirebaseApp, initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

const app: FirebaseApp = initializeApp(environment.firebaseConfig);
export { app };
