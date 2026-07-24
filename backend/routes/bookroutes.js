const express = require('express');
const router = express.Router();
const { authenticateToken, authoriseRoles } = require('../middleware/authMiddleware');
const { issueManualBook, getAllManualIssuedBooks, getManualIssuesForStudent, returnManualIssuedBook, applyManualFine, clearFine, getActiveFineSetting, updateFineSetting } = require('../controllers/bookController');
router.get('/fine-settings', authenticateToken, getActiveFineSetting);
router.put('/issues/student', authenticateToken, authoriseRoles('user'), getManualIssuesForStudent);

//admin
router.get('/issues', authenticateToken, authoriseRoles('admin'), getAllManualIssuedBooks);
router.post('/issue-manual', authenticateToken, authoriseRoles('admin'), issueManualBook);


router.put('/return/:id/return', authenticateToken, authoriseRoles('admin'), returnManualIssuedBook);
router.put('/issues/:id/fine', authenticateToken, authoriseRoles('admin'), applyManualFine);
router.put('/issues/:id/clear-fine', authenticateToken, authoriseRoles('admin'), clearFine);
router.put('/fine-settings', authenticateToken, authoriseRoles('admin'), updateFineSetting);



module.exports = router;

