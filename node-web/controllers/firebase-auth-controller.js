
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
 const {ref, set} = require('firebase/database')
 function generateUserId(){
  return uuidv4()

 }


 class FirebaseAuthController{
  registerUser(req, res) {
    console.log(req.body);
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

    const auth = getAuth(); // Initialize Firebase Auth

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Send verification email
        return sendEmailVerification(user).then(() => {
            // Store user data in Realtime Database
            let userId = generateUserId()
            return set(ref(db, 'users/' + userId),{
                username,
                email,
                createdAt: new Date(),
                emailVerified: false // Initially set to false
            });
        });
    })
      .then(() => {
          res.render('notify_password')
      })
      .catch((error) => {
          console.error(error);
          res.status(500).json({ error: error.message || "Error when registering user" });
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
      .then((userCredential) => {
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