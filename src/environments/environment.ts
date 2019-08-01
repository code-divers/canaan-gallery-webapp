// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
 production: false,
 serverApi: 'https://s77a6xrvk7.execute-api.us-east-1.amazonaws.com/v3',
 firebase: {
    apiKey: "AIzaSyBpmji7Iyy3WXfeqU8-o3KjJj3sgDd3edQ",
    authDomain: "canaan-gallery.firebaseapp.com",
    databaseURL: "https://canaan-gallery.firebaseio.com",
    projectId: "canaan-gallery",
    storageBucket: "canaan-gallery.appspot.com",
    messagingSenderId: "117308682586",
    appId: "1:117308682586:web:2f7175ce872ce082"
  },
  giphy:{
    apiKey: "ML2k61iPA53QwrXyjsLdnDMj98CrAQVa"
  },
  vat: 0.17,
  studioGroup: "טלית"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
