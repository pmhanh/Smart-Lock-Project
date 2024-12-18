const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  db
} = require('../config/firebase');

const { v4: uuidv4 } = require('uuid');
const { getFirestore, doc, setDoc, getDoc, updateDoc, query, collection, where } = require('firebase/firestore');

const auth = getAuth();

function generateUserId() {
  return uuidv4();
}

class FirebaseAuthController {
  async registerUser(req, res) {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
  
    if (!email || !password || !username) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
        username: "User name is required",
      });
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send email verification
      await sendEmailVerification(user);
  
      res.render("notify_password", {
        message: "Check your email to activate your account.",
      });

      const userRef = doc(db, "users", user.uid);
      //const hisRef = doc(db, "history", new Date.toISOString());

      const snapshot = await getDoc(userRef);
      //const snapshot_history = await getDoc(hisRef);
  
      if (!snapshot.exists()) {
        // Create Firestore document after email verification
        await setDoc(userRef, {
          username: username || "Unknown",
          email: email,
          createdAt: new Date().toISOString(),
          activate_email: false,
          has_login : false,
        });
      }
      // if (!snapshot_history.exists()){
      //   await setDoc(hisRef, {
      //     email: email,
      //     date_time: null,
      //     image: null,
      //     state: null,
      //     result: null,
      //   })
      // }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  }
  

  async loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;
  
    
    if (!email || !password) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
      });
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid
      const user_email = user.email
  
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      // Ensure the user has verified their email
      if (!user.emailVerified) {
        await signOut(auth);
        return res.status(403).json({
          error: "Please verify your email address before logging in.",
        });
      }
      const new_id = user_email + "-" + new Date().toISOString()
      
      const hisRef = doc(db, "history", new_id);
      const snapshot_history = await getDoc(hisRef, `users/${userId}`);
      const docRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(docRef);
      const userData = userDoc.data();
      if (userData.has_login == false){
        if (snapshot.exists()) {
          // Create Firestore document after email verification
          await updateDoc(userRef, {
            activate_email: true,
            has_login: true
          });
        }
      }
      // Check if Firestore document exists
  
      const idToken = userCredential._tokenResponse.idToken;
      if (idToken) {
        res.cookie("access_token", idToken, { httpOnly: true });
        return res.redirect("/profile");
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  }
  

  async resetPassword(req, res) {
    const email = req.body.email;

    if (!email) {
      return res.status(422).json({ email: "Email is required" });
    }

    try {
      await sendPasswordResetEmail(auth, email);
      res.render('notify_password');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  
}

module.exports = new FirebaseAuthController();
