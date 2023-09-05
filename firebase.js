// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const {initializeApp } = require("firebase/app")
const {getFirestore} = require("firebase/firestore")

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiZguLCM8ji6xM3xEAC_0HqVnu4gDHL7s",
  authDomain: "cyber-conquest.firebaseapp.com",
  projectId: "cyber-conquest",
  storageBucket: "cyber-conquest.appspot.com",
  messagingSenderId: "271710164578",
  appId: "1:271710164578:web:dd650dd28c61eacd87a33b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

module.exports = {app, db}
