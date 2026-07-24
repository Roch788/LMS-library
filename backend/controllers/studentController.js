const User = require('../models/userSchema');

const searchByRollNo = async (req, res) => {
    try {
        const roll = String(req.query.rollNo || "").trim();

        if (!roll) {
            return res.status(400).json({
                message: "Roll number is required"
            });
        }

        // Case-insensitive exact match
        let student = await User.findOne({
            rollNo: { $regex: new RegExp(`^${roll}$`, "i") },
            role: "user"
        }).select("-password");

        // Partial match fallback if exact match not found
        if (!student) {
            student = await User.findOne({
                $or: [
                    { rollNo: { $regex: roll, $options: "i" } },
                    { studentId: { $regex: roll, $options: "i" } },
                    { name: { $regex: roll, $options: "i" } },
                    { email: { $regex: roll, $options: "i" } }
                ],
                role: "user"
            }).select("-password");
        }

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            message: "Student found",
            student: student,
            students: [student],
            _id: student._id,
            name: student.name,
            email: student.email,
            department: student.department,
            stream: student.stream,
            academicYear: student.year,
            semester: student.semester,
            rollNumber: student.rollNo,
            rollNo: student.rollNo,
            studentId: student.studentId
        });

    } catch (err) {
        console.error("Error searching by roll number:", err);
        return res.status(500).json({
            message: "Error fetching user by roll number",
            error: err.message
        });
    }
};

module.exports = { searchByRollNo };