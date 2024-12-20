const { 
  getAuth, 
  db
} = require('../config/firebase');

const { getFirestore, doc, setDoc, getDoc, updateDoc, collection, data, addDoc, arrayUnion } = require('firebase/firestore');

const getCurrentUserData = async (req, res) => {
  try {
      const auth = getAuth()
      const userId = auth.currentUser.uid
      const docRef = doc(db, `users/${userId}`);

      const userDoc = await getDoc(docRef);
      console.log(userDoc)
      const userData = userDoc.data();
      console.log(userData)
      return res.render('profile', {user: userData, userId: userId})
  } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ message: "Error fetching user data" });
  }
};

const updateUsername = async (req, res) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = auth.currentUser.uid;

  if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
  }

  const newUsername = req.body.username;


  try {
      const docRef = doc(db, `users/${user.uid}`);
      
      // Update Firestore document with new username
      await updateDoc(docRef, { username: newUsername });
      username = {"username": newUsername }

      // Optionally redirect back to profile or send success message
      res.redirect(`/${userId}/profile`);
  } catch (error) {
      console.error("Error updating username:", error);
      return res.status(500).json({ message: "Error updating username" });
  }
}


const addHistoryEntry = async (req, res) => {
  try {
    const user = getAuth().currentUser;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user_email = user.email;
    const userId = user.uid;

    const docRef = doc(db, `history/${userId}`);

    // Adding a new history entry to the array
    const newHistoryEntry = {
      email: user_email,
      date_time: req.body.date_time,
      state: req.body.state,
      image: req.body.image,
      result: req.body.result,
    };

    const snapshot = await getDoc(docRef)
      
    if (!snapshot.exists()) {
      // Create Firestore document after email verification
      await setDoc(docRef, {
      });
    }
    // Use updateDoc and arrayUnion to append to the array
    await updateDoc(docRef, {
      entries: arrayUnion(newHistoryEntry), // 'entries' is the array field in the document
    });

    res.status(200).json({
      message: "History entry added successfully!",
    });
  } catch (error) {
    console.error("Error adding history entry:", error);
    res.status(500).json({
      message: "Failed to add history entry.",
      error: error.message,
    });
  }
};

const getHistoryEntry = async(req, res) =>{
  try {
    const userId = getAuth().currentUser.uid;
    const user = getAuth().currentUser;
    const docRef = doc(db, `history/${userId}`);
    const userInfo = (await getDoc(doc(db, `users/${userId}`))).data()
    const userDoc = await getDoc(docRef);
    let userHistory = [];
    if (userDoc.data().entries){
      userHistory = userDoc.data().entries;
    }
    return res.render('history', { history: userHistory , user: userInfo, userId : userId});

  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).send('Error fetching user history.');
  }
}

module.exports = {
  getCurrentUserData, updateUsername, addHistoryEntry, getHistoryEntry
};