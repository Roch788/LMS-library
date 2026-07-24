const express = require('express');
const router = express.Router();
const { authenticateToken, authoriseRoles } = require('../middleware/authMiddleware');
const {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
    requestBook,
    getMyRequests,
    getAllRequests,
    updateRequestStatus,
} = require('../controllers/catalogController');

// Books — accessible to all authenticated users
router.get('/books', authenticateToken, getAllBooks);

// Books — admin only
router.post('/books', authenticateToken, authoriseRoles('admin'), addBook);
router.put('/books/:id', authenticateToken, authoriseRoles('admin'), updateBook);
router.delete('/books/:id', authenticateToken, authoriseRoles('admin'), deleteBook);

// Requests — student
router.post('/request', authenticateToken, authoriseRoles('user'), requestBook);
router.get('/my-requests', authenticateToken, authoriseRoles('user'), getMyRequests);

// Requests — admin
router.get('/requests', authenticateToken, authoriseRoles('admin'), getAllRequests);
router.put('/requests/:id', authenticateToken, authoriseRoles('admin'), updateRequestStatus);

module.exports = router;
