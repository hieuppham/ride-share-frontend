// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mapbox: {
    accessToken:
      'pk.eyJ1IjoicGhhbXRydW5naGlldTZkIiwiYSI6ImNrdGJuZHduNzF4aTYyd3Bsa3RyMGxhY3IifQ.jzhAQ1H3SkdOoJi-BYKI8A',
  },
  firebaseConfig: {
    apiKey: 'AIzaSyBdTDrQPMuJ1tZdGO-aLtw0YD4B1Ee5kgM',
    authDomain: 'rideshare-f6984.firebaseapp.com',
    projectId: 'rideshare-f6984',
    storageBucket: 'rideshare-f6984.appspot.com',
    messagingSenderId: '694722960403',
    appId: '1:694722960403:web:1117f30ec4a73a6097b3e6',
  },
  adminUid: '630babae63fbfa32e3dfcc1e',
  apiUrl: 'http://localhost:8080/v1',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
