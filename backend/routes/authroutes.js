const express = require('express');
const authRouter = express.Router();
const { authenticateToken, authoriseRoles } = require('../middleware/authMiddleware');
const { registerUser, verifyOtp, completeProfile, loginUser, getProfile, updateProfile, getAllStudents, registerAdmin } = require('../controllers/authController');


authRouter.post('/register', registerUser);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/complete-profile',completeProfile);

authRouter.post('/login', loginUser);
authRouter.post('/register-admin', registerAdmin);
authRouter.get('/me', authenticateToken, getProfile);
authRouter.put('/update-profile', authenticateToken, updateProfile);
authRouter.get('/students', authenticateToken, authoriseRoles('admin'), getAllStudents);

module.exports = authRouter;