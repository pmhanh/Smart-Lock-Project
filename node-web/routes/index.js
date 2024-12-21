const express = require('express');

const router = express.Router();


const firebaseAuth = require('../controllers/firebase-auth-controller');
const firebaseData = require('../controllers/firebase-data-controller')


router.post('/api/signup', firebaseAuth.registerUser);

router.post('/api/login', firebaseAuth.loginUser);

router.post('/api/forgot', firebaseAuth.resetPassword);


router.post("/:userId/add-history", firebaseData.addHistoryEntry);
router.get("/:userId/profile", firebaseData.getCurrentUserData);
router.post("/:userId/update-profile", firebaseData.updateUsername);
router.get("/:userId/history", firebaseData.getHistoryEntry);

router.get("/:userId/monitor", firebaseData.getMonitor);
//router.post("/:userId/send-notification", firebaseData.sendNotificationtoPhone);


module.exports = router;
