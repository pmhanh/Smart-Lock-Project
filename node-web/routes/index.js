const express = require('express');

const router = express.Router();


const firebaseAuth = require('../controllers/firebase-auth-controller');
const firebaseData = require('../controllers/firebase-data-controller')


router.post('/api/signup', firebaseAuth.registerUser);

router.post('/api/login', firebaseAuth.loginUser);

router.post('/api/forgot', firebaseAuth.resetPassword);

router.post(`/add-history`, firebaseData.addHistoryEntry); // POST to add history
router.get('/profile', firebaseData.getCurrentUserData);
router.post('/update-profile', firebaseData.updateUsername);
router.get('/history', firebaseData.getHistoryEntry);


module.exports = router;
