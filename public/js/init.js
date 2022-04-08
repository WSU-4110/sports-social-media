/* eslint-disable no-undef */

const firebaseConfig = {
    apiKey: 'AIzaSyDhYbSc9y3bw0j7EmLtL2k4huvoK99Uhxs',
    authDomain: 'sportsocialmediaprofile.firebaseapp.com',
    databaseURL: 'https://sportsocialmediaprofile-default-rtdb.firebaseio.com',
    projectId: 'sportsocialmediaprofile',
    storageBucket: 'sportsocialmediaprofile.appspot.com',
    messagingSenderId: '701173843774',
    appId: '1:701173843774:web:41588c9dcc218e8cc6ce6f',
};

let firebaseInstance = null;
export const getFirebase = () => {
  if (firebaseInstance !== null) {
    return firebaseIntance;
  }

  firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
  firebaseInstance = firebase;
  return firebaseInstance;
};
