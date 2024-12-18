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
const { getFirestore, doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

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
  
      // Ensure the user has verified their email
      if (!user.emailVerified) {
        await signOut(auth);
        return res.status(403).json({
          error: "Please verify your email address before logging in.",
        });
      }
  
      // Check if Firestore document exists
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
  
      if (!snapshot.exists()) {
        // Create Firestore document after email verification
        await setDoc(userRef, {
          username: req.body.username || "Unknown",
          email: email,
          createdAt: new Date().toISOString(),
          activate_email: true,
        });
      }
  
      const idToken = userCredential._tokenResponse.idToken;
      if (idToken) {
        res.cookie("access_token", idToken, { httpOnly: true });
        return res.redirect("/");
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
//   async addHistoryEntry(req, res) {
//     const { userId, datetime, state, imageUrl, result } = req.body;

//     try {
//       const docRef = await db.collection('history').add({
//         userId: userId,
//         datetime: datetime,
//         state: state,
//         imageUrl: imageUrl,
//         result: result,
//       });

//       res.status(200).json({
//         message: 'History entry added successfully!',
//         id: docRef.id,
//       });
//     } catch (error) {
//       console.error('Error adding history entry:', error);
//       res.status(500).json({
//         message: 'Failed to add history entry.',
//         error: error.message,
//       });
//     }
//   }

//   async getUserHistory(req, res) {
//     const { userId } = req.params;

//     try {
//       const historySnapshot = await db.collection('history')
//                                       .where('userId', '==', userId)
//                                       .get();

//       const userHistory = historySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       res.render('history', { history: userHistory });
//     } catch (error) {
//       console.error('Error fetching user history:', error);
//       res.status(500).send('Failed to load history.');
//     }
//   }
// }

// module.exports = new FirebaseAuthController();


module.exports = new FirebaseAuthController();
