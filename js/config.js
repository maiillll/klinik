// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr9-ZC-Po3e-dH3WPAmc7fEXZ7peEtSN8",
  authDomain: "klinik-26f61.firebaseapp.com",
  projectId: "klinik-26f61",
  storageBucket: "klinik-26f61.firebasestorage.app",
  messagingSenderId: "388091198852",
  appId: "1:388091198852:web:11401553ab9bd4b1bb71d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
