// Import the functions you need from the SDKs you need
require("dotenv").config();
const firebase = require("firebase/app");
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

const app = firebase.initializeApp(firebaseConfig);
let db = firebasedb.getDatabase(app);
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  sendSignInLinkToEmail

} = require("firebase/auth") ;

module.exports = {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  db
};
