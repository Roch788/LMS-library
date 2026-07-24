const express=require('express');
const studentRouter=express.Router();
const {searchByRollNo}=require('../controllers/studentController');
const { authenticateToken, authoriseRoles } = require('../middleware/authMiddleware');


studentRouter.get('/search-by-roll', authenticateToken, authoriseRoles('admin'), searchByRollNo);


module.exports=studentRouter;