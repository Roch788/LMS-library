const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: String,
    otp_expiry: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    department: String,
    stream: String,
    semester: String,
    year: String,
    rollNo: String,
    isProfileComplete: {
        type: Boolean,
        default: false,
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true,
    }, 
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

})

const User = mongoose.model('User', user);

module.exports = User;