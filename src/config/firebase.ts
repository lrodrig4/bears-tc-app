import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQ_FP-bcYZnC3qTtEOnpoEFWT_47wXfM0",
  authDomain: "bears-tc-app.firebaseapp.com",
  projectId: "bears-tc-app",
  storageBucket: "bears-tc-app.firebasestorage.app",
  messagingSenderId: "50244540408",
  appId: "1:50244540408:web:80fd1653ff64bf55f6e80d",
  measurementId: "G-CYY0XRYZBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
