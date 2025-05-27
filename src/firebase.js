import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDoXYg8s3aPPdiNywofEABbFrDlc2sXrI4',
  authDomain: 'mazingiraauth.firebaseapp.com',
  projectId: 'mazingiraauth',
  appId: '1:330017421288:web:c6f144e33c837b0467965d',
};

// https://mazingiraauth.firebaseapp.com/__/auth/handler

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
