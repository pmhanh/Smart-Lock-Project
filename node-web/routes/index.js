const express = require('express');

const router = express.Router();


const firebaseAuth = require('../controllers/firebase-auth-controller');


router.post('/api/signup', firebaseAuth.registerUser);

router.post('/api/login', firebaseAuth.loginUser);

router.post('/api/forgot', firebaseAuth.resetPassword);

router.post('/user/:userId/add-history', firebaseAuth.addHistoryEntry); // POST to add history
router.get('/history/:userId', firebaseAuth.getUserHistory);       // GET to retrieve history

module.exports = router;
