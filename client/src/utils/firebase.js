import firebase from 'firebase';
const config = {
    apiKey: process.env.REACT_APP_GOOGLEAPI_KEY,
    projectId: process.env.REACT_APP_GOOGLEAPI_PROJECTID,
    authDomain: process.env.REACT_APP_GOOGLEAPI_AUTHDOMAIN,
    // databaseURL: "https://PROJECT_ID.firebaseio.com",
    // storageBucket: "PROJECT_ID.appspot.com",
    // messagingSenderId: "SENDER_ID",
    // appId: "APP_ID",
    // measurementId: "G-MEASUREMENT_ID",
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();