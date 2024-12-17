
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail
 } = require('../config/firebase');


 const auth = getAuth();
 const fs = require('fs');


 class FirebaseAuthController{
  registerUser(req, res){
    console.log(req.body)
    const email = req.body.email;

    const password = req.body.password;
    if (!email || !password){
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required"
      });
    }
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(auth.currentUser).then(
          () => {
            res.status(201).json({message: "Verification email sent!"});
          }
        )
        .catch((error) => {
          console.error(error);
          res.status(500).json({error  : "Error in sending email"});
        })
      }
    )
    .catch((error) => {
      const errorMessage = error.message || "Error when registering user";
      res.status(500).json({error: errorMessage});

    });
  }
}

module.exports = new FirebaseAuthController();