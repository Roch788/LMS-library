const User = require("../models/userSchema");
const {generate} = require("otp-generator")
const sendOtp = require("../utils/send-otp")
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
//step1:registration of a student and send otp
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                message: "Invalid phone number (must be 10 digits)",
            })
        }
        const normalizedEmail = email.trim().toLowerCase();

        // Check if email exists
        const existingEmailUser = await User.findOne({ email: normalizedEmail });
        if (existingEmailUser) {
            if (existingEmailUser.isVerified) {
                return res.status(400).json({
                    message: "User with this email already exists",
                });
            }
            await User.deleteOne({ email: normalizedEmail });
        }

        // Check if phone number exists
        const existingPhoneUser = await User.findOne({ phone: cleanPhone });
        if (existingPhoneUser) {
            if (existingPhoneUser.isVerified) {
                return res.status(400).json({
                    message: "User with this phone number already exists",
                });
            }
            await User.deleteOne({ phone: cleanPhone });
        }

        const otp = generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        //to send otp
        try {
            await sendOtp(normalizedEmail, otp);
        } catch (err) {
            console.log("Warning sending OTP email via Resend:", err.message || err);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        const studentId = `ST-${uuidv4().slice(0, 8).toUpperCase()}`

        const user = await User.create({
            name, email: normalizedEmail, phone: cleanPhone, password: hashedPassword, otp, otpExpiry, studentId
        });
        res.status(201).json({
            message: "User registered successfully, OTP sent to email", user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                studentId: user.studentId,
            },
        })
    } catch (err) {
        console.log("error registring the user", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({
                message: `A user with this ${field} already exists.`,
            });
        }
        res.status(500).json({
            message: "Failed to register user. Please try again later",
        })
    }
}

//step 2: verify the otp and activate the user
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        if (user.otp !== otp || new Date() > user.otpExpiry) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            })
        }
        Object.assign(user, { isVerified: true, otp: null, otpExpiry: null });
        await user.save();
        res.status(200).json({
            message: "OTP verified successfully, user activated",
        })
    } catch (err) {
        console.log("error verifying OTP", err);
        res.status(500).json({
            message: "Failed to verify OTP. Please try again later",
        })
    }
}

//step 3: complete profile and update user details
const completeProfile = async (req, res) => {
    try {
        const { email, department, stream, semester, year, rollNo } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        if (!user.isVerified) {
            return res.status(400).json({
                message: "User is not verified. Please verify your email first",
            })
        }
        Object.assign(user, { department, stream, semester, year, rollNo, isProfileComplete: true });
        await user.save();
        res.status(200).json({
            message: "Profile completed successfully",
        })
    } catch (error) {
        console.log("error completing profile", error);
        res.status(500).json({
            message: "Failed to complete profile. Please try again later",
        })
    }
}


//login as a student
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        if (!user.isVerified) {
            return res.status(400).json({
                message: "User is not verified. Please verify your email first",
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid password",
            })
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (err) {
        console.log("error logging in", err);
        res.status(500).json({
            message: "Failed to login user. Please try again later",
        })
    }
}

//get current user details
const getProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        res.status(200).json({
            message: "Profile fetched successfully",
            user,
        })
    } catch (error) {
        console.log("error fetching profile", error);
        res.status(500).json({
            message: "Failed to fetch profile. Please try again later",
        })
    }
}


//update profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, department, stream, semester, year, rollNo } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        if (email && email !== user.email) {
            const normalisedEmail = email.trim().toLowerCase();
            if (normalisedEmail !== user.email.toLowerCase()) {
                if (user.role === 'user') {
                    return res.status(400).json({
                        message: "Email cannot be changed for student users",
                    })
                }
                const existingUser = await User.findOne({ email: normalisedEmail });
                if (existingUser) {
                    return res.status(400).json({
                        message: "Email already exists",
                    });
                }
                user.email = normalisedEmail;
            }
            if (name) user.name = name;
            if (phone) user.phone = phone;
            if (department) user.department = department;
            if (stream) user.stream = stream;
            if (semester) user.semester = semester;
            if (year) user.year = year;
            if (rollNo) user.rollNo = rollNo;
            await user.save();
            res.status(200).json({
                message: "Profile updated successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    department: user.department,
                    stream: user.stream,
                    semester: user.semester,
                    year: user.year,
                    rollNo: user.rollNo
                },
            })
        }
    } catch (error) {
        console.log("error updating profile", error);
        res.status(500).json({
            message: "Failed to update profile. Please try again later",
        })
    }
}


//get all the student account(admin)
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "user", isVerified: true, isProfileComplete: true }).select("-password");
        res.status(200).json({
            message: "Students fetched successfully",
            students: students
        });
    } catch (err) {
        console.log("error fetching all students", err);
        res.status(500).json({
            message: "Failed to fetch all students. Please try again later",
        })
    }
}

//admin registration
const registerAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({
                message: "Admin already exists",
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email: email.trim().toLowerCase(), phone, password: hashedPassword, role: 'admin', isVerified: true, isProfileComplete: true
        });
        res.status(201).json({
            message: "Admin registered successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            }
        })
    } catch (err) {
        console.log("error registering admin", err);
        res.status(500).json({
            message: "Failed to register admin. Please try again later",
        })

    }
}

module.exports = { registerUser, verifyOtp, completeProfile, loginUser, getProfile, updateProfile, getAllStudents, registerAdmin };