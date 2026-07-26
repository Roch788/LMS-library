const Book = require('../models/bookSchema');
const BookRequest = require('../models/bookRequest');
const User = require('../models/userSchema');

// 1. Get all catalog books (with optional search & category filter)
const getAllBooks = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (category && category !== 'ALL') {
            filter.category = category;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { title: regex },
                { author: regex },
                { bookCode: regex },
            ];
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Books fetched successfully',
            count: books.length,
            books,
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ message: 'Error fetching books', error: err.message });
    }
};

// 2. Add a new book to catalog (admin)
const addBook = async (req, res) => {
    try {
        const { title, author, bookCode, category, publisher, totalCopies, description } = req.body;

        if (!title || !author || !bookCode) {
            return res.status(400).json({ message: 'Title, author, and book code are required' });
        }

        const existingBook = await Book.findOne({ bookCode: bookCode.trim() });
        if (existingBook) {
            return res.status(400).json({ message: 'A book with this code already exists' });
        }

        const copies = Number(totalCopies) || 1;
        const book = await Book.create({
            title: title.trim(),
            author: author.trim(),
            bookCode: bookCode.trim(),
            category: category?.trim() || 'General',
            publisher: publisher?.trim() || '',
            totalCopies: copies,
            availableCopies: copies,
            description: description?.trim() || '',
        });

        res.status(201).json({ message: 'Book added to catalog successfully', book });
    } catch (err) {
        console.error('Error adding book:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'A book with this code already exists' });
        }
        res.status(500).json({ message: 'Error adding book', error: err.message });
    }
};

// 3. Update a book in catalog (admin)
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { title, author, bookCode, category, publisher, totalCopies, availableCopies, description } = req.body;

        if (title) book.title = title.trim();
        if (author) book.author = author.trim();
        if (bookCode) book.bookCode = bookCode.trim();
        if (category) book.category = category.trim();
        if (publisher !== undefined) book.publisher = publisher.trim();
        if (totalCopies !== undefined) book.totalCopies = Number(totalCopies);
        if (availableCopies !== undefined) book.availableCopies = Number(availableCopies);
        if (description !== undefined) book.description = description.trim();

        await book.save();
        res.status(200).json({ message: 'Book updated successfully', book });
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).json({ message: 'Error updating book', error: err.message });
    }
};

// 4. Delete a book from catalog (admin)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ message: 'Error deleting book', error: err.message });
    }
};

// 5. Student requests a book
const requestBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const student = await User.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student already has a pending request for this book
        const existingRequest = await BookRequest.findOne({
            bookId,
            studentId: req.user.id,
            status: 'pending',
        });
       if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this book' });
        } 

        const request = await BookRequest.create({
            bookId,
            studentId: req.user.id,
            studentName: student.name,
            studentEmail: student.email,
            bookTitle: book.title,
            bookCode: book.bookCode,
        });

        res.status(201).json({ message: 'Book request submitted successfully', request });
    } catch (err) {
        console.error('Error requesting book:', err);
        res.status(500).json({ message: 'Error requesting book', error: err.message });
    }
};

// 6. Student views their own requests
const getMyRequests = async (req, res) => {
    try {
        const requests = await BookRequest.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Requests fetched successfully',
            count: requests.length,
            requests,
        });
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ message: 'Error fetching requests', error: err.message });
    }
};

// 7. Admin views all requests
const getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        const requests = await BookRequest.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'All requests fetched successfully',
            count: requests.length,
            requests,
        });
    } catch (err) {
        console.error('Error fetching all requests:', err);
        res.status(500).json({ message: 'Error fetching requests', error: err.message });
    }
};

// 8. Admin approves or rejects a request
const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
        }

        const request = await BookRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        if (adminNote !== undefined) request.adminNote = adminNote;
        await request.save();

        res.status(200).json({ message: `Request ${status} successfully`, request });
    } catch (err) {
        console.error('Error updating request status:', err);
        res.status(500).json({ message: 'Error updating request', error: err.message });
    }
};

module.exports = {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
    requestBook,
    getMyRequests,
    getAllRequests,
    updateRequestStatus,
};
