
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  db
 } = require('../config/firebase');


 const auth = getAuth();
 const { v4: uuidv4 } = require('uuid');
 const {ref, set, get, child,  update} = require('firebase/database')
 function generateUserId(){
  return uuidv4()

 }





 class FirebaseAuthController{
  registerUser(req, res) {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
  
    if (!email || !password || !username) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
        username: "User name is required"
      });
    }
  
    const auth = getAuth();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
        const user = userCredential.user;
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));
        if (!snapshot.exists()) {
          // Store user data in Realtime Database
          await set(ref(db, `users/${user.uid}`), {
            username: username ,
            email: email,
            createdAt: new Date().toISOString(),
            activate_email: false
          });
        } 
        // Send verification email
        return sendEmailVerification(user).then(() => {
          res.render("notify_password", {
            message: "Check your email to activate your account."
          });
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: error.message || "Registration failed" });
      });
  }
  
  


  
  loginUser(req, res){
    const email = req.body.email;

    const password = req.body.password;
    if (!email || !password){
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required"
      });
    }
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
        const user = userCredential.user;
        if (!user.emailVerified) {
          await signOut(auth)
          return res.status(403).json({
            error: "Please verify your email address before logging in."
          });
        }
        // Check if user exists in Realtime Database
        const updates = {
          activate_email: true
        }
        const dbRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));
        await update(dbRef, updates)
        const idToken = userCredential._tokenResponse.idToken
        if (idToken) {
            res.cookie('access_token', idToken, {
                httpOnly: true
            });
            return res.redirect('/');
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
        })
      .catch((error) => {
          console.error(error);
          const errorMessage = error.message || "An error occurred while logging in";
          res.status(500).json({ error: errorMessage });
      })

  }
  resetPassword(req, res){
    const email = req.body.email;
    if (!email){
      res.status(422).json({
        email: "Email is required"
      });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res.render('notify_password')
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({error : "Internal Server Error"})
      })
  }
}

module.exports = new FirebaseAuthController();