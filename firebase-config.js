// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAh1iF_DmWmogEEdmk4UOG8Phdtgln134Y",
  authDomain: "smartlock-f37cb.firebaseapp.com",
  databaseURL: "https://smartlock-f37cb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartlock-f37cb",
  storageBucket: "smartlock-f37cb.firebasestorage.app",
  messagingSenderId: "637740604909",
  appId: "1:637740604909:web:65d6943f8a2abdb63ddbe4",
  measurementId: "G-CRRCENZXT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = firebase.auth();
const database = firebase.database();

module.exports = { auth, database };