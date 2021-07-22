const express = require('express');
const router = express.Router();

const { register, login, getMe, forgotPassword, resetPassword, updateDetails, logout } = require('../controller/authController');

const { protect, authorize } = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, authorize('admin'), getMe);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;