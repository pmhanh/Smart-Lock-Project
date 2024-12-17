const express = require('express');

const router = express.Router();


const firebaseAuth = require('../controllers/firebase-auth-controller');


router.post('/api/signup', firebaseAuth.registerUser);

router.post('/api/login', firebaseAuth.loginUser);

router.post('/api/forgot', firebaseAuth.resetPassword);

module.exports = router;

