const express = require('express');

const router = express.Router();


const firebaseAuth = require('../controllers/firebase-auth-controller');


router.post('/api/signup', firebaseAuth.registerUser);

module.exports = router;

