const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    studentEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    bookTitle: {
        type: String,
        required: true,
    },
    bookCode: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminNote: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const BookRequest = mongoose.model('BookRequest', bookRequestSchema);
module.exports = BookRequest;
