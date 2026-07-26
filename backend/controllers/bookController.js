const Issue = require('../models/issue');
const User = require('../models/userSchema');
const FineSetting = require('../models/finesetting');

//helper function
const getLocalIsoDate = (value = new Date()) => {
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getStartOfDay = (value) => new Date(new Date(value).setHours(0, 0, 0, 0));

const getDiffInDays = (targetDateString) =>
    Math.round((getStartOfDay(targetDateString) - getStartOfDay(new Date())) / 86400000);

const getOverdueUnits = (overdueDays, interval) => {
    if (overdueDays <= 0) return 0;
    const divisor = { week: 7, month: 30, year: 365 }[interval] || 1;
    return Math.ceil(overdueDays / divisor);
};

const calculateFine = (issue, fineRate = 10, fineInterval = "day") => {
    if (!issue || issue.fineCleared || issue.returnedOn) return 0;
    const overdueDays = Math.max(0, -getDiffInDays(issue.dueDate));
    return getOverdueUnits(overdueDays, fineInterval) * fineRate + (Number(issue.manualFine) || 0);
};


//1. Issue a manual book to a student
const issueManualBook = async (req, res) => {
    try {
        const { studentDetails, books } = req.body;
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ message: "No books provided for issuing" });
        }

        // Find student by roll number
        const rollNo = String(studentDetails?.rollNo || "").trim();
        const student = await User.findOne({ rollNo: rollNo });

        if (!student) {
            return res.status(404).json({ message: "Student not found in system. Please select a valid registered student." });
        }

        const validBooks = books.filter(b => b.bookCode && b.title && b.dueDate);
        if (validBooks.length === 0) {
            return res.status(400).json({ message: "No valid books provided for issuing." });
        }

        // Check if any requested book is ALREADY issued and NOT yet returned
        for (const book of validBooks) {
            const code = book.bookCode.trim();

            const existingIssue = await Issue.findOne({
                bookCode: code,
                returnedOn: null
            });

            if (existingIssue) {
                return res.status(400).json({
                    message: `Book "${code}" is already issued to ${existingIssue.userName} and has not been returned yet.`
                });
            }
        }

        // Create issue records for each book
        const today = getLocalIsoDate();
        const createdIssues = [];

        for (const book of validBooks) {
            const newIssue = await Issue.create({
                source: "manual",
                bookCode: book.bookCode.trim(),
                title: book.title.trim(),
                userEmail: student.email,
                userName: student.name,
                issuedOn: today,
                dueDate: book.dueDate,
                returnedOn: null,
                fineRate: Number(book.fineRate || 10),
                fineInterval: book.fineInterval || "day",
                department: studentDetails.department || student.department || "General",
                stream: studentDetails.stream || student.stream || "General",
                year: studentDetails.academicYear || student.year || "1st Year",
                semester: studentDetails.semester || student.semester || "Semester 1",
                rollNumber: student.rollNo,
                studentId: student.rollNo || `ST-${student._id.toString().slice(-4)}`
            });
            createdIssues.push(newIssue);
        }

        return res.status(201).json({
            message: "Books issued successfully",
            count: createdIssues.length,
            issues: createdIssues
        });
    } catch (err) {
        console.error("Error issuing manual book:", err);
        return res.status(500).json({
            message: "Error issuing manual book",
            error: err.message
        });
    }
}


//2. get all the manual issued books
const getAllManualIssuedBooks = async (req, res) => {
    try {
        const issues = await Issue.find({ source: "manual" }).sort({ createdAt: -1 }).lean();
        const formattedIssues = issues.map(issue => {
            const isReturned = Boolean(issue.returnedOn);
            const fine = calculateFine(issue, issue.fineRate || 10, issue.fineInterval || "day");
            const overdueDays = Math.max(0, -getDiffInDays(issue.dueDate));
            const isOverdue = !isReturned && overdueDays > 0;
            return {
                ...issue,
                fineAmount: `$${fine.toFixed(2)}`,
                fineValue: fine,
                status: isReturned ? 'returned' : (isOverdue ? 'overdue' : 'active'),
            };
        });
        res.status(200).json({ message: "Manual issued books fetched successfully", count: formattedIssues.length, issues: formattedIssues });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching manual issued books",
            error: err.message
        });
    }
}

//3. get manual issues for logged in student
const getManualIssuesForStudent = async (req, res) => {
    try {
        const issues = await Issue.find({ source: "manual", userEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Manual issued books for student fetched successfully", count: issues.length, issues });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching manual issued books for student",
            error: err.message
        });
    }
}

//4. retrun the manual issued book
const returnManualIssuedBook = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Manual issued book not found" });
        }
        if (issue.returnedOn) {
            return res.status(400).json({ message: "Book already returned" });
        }
        issue.returnedOn = getLocalIsoDate();
        await issue.save();
        return res.status(200).json({ message: "Manual issued book returned successfully", issue });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error returning manual issued book",
            error: err.message
        });
    }
}


//5.) apply manual fine to a manual issued book
const applyManualFine = async (req, res) => {
    try {
        const fineAmount = Number(req.body.fineAmount);
        if (isNaN(fineAmount) || fineAmount < 0) {
            return res.status(400).json({ message: "Invalid fine amount" });
        }
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Manual issued book not found" });
        }
        issue.manualFine = fineAmount;
        if (fineAmount > 0) issue.fineCleared = false;
        await issue.save();
        return res.status(200).json({ message: "Manual fine applied successfully", issue });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error applying manual fine",
            error: err.message
        });
    }
}


//6.)clear manual fine
const clearFine = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Manual issued book not found" });
        }
        Object.assign(issue, { manualFine: 0, fineCleared: true, clearedFineAmount: calculateFine(issue, issue.fineRate, issue.fineInterval) });
        await issue.save();
        return res.status(200).json({ message: "Manual fine cleared successfully", issue });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error clearing manual fine",
            error: err.message
        });
    }
}

//7. get active fine setting
const getActiveFineSetting = async (req, res) => {
    try {
        const settings = await FineSetting.findOne({});
        if (!settings) {
            return res.status(404).json({ message: "No active fine setting found" });
        }
        return res.status(200).json({ message: "Active fine setting fetched successfully", settings });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching active fine setting",
            error: err.message
        });
    }
}

//8.)const update fine setting
const updateFineSetting = async (req, res) => {
    try {
        const { amount, interval } = req.body;

        let settings = await FineSetting.findOne({});

        if (settings) {
            if (amount !== undefined)
                settings.amount = Number(amount);

            if (interval !== undefined)
                settings.interval = interval;

            await settings.save();
        } else {
            settings = await FineSetting.create({
                amount: Number(amount) || 10,
                interval: interval || "day"
            });
        }

        return res.status(200).json({
            message: "Fine settings updated successfully",
            settings
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error updating fine setting",
            error: err.message
        });
    }
};

module.exports = {
    issueManualBook,
    getAllManualIssuedBooks,
    getManualIssuesForStudent,
    returnManualIssuedBook,
    applyManualFine,
    clearFine,
    getActiveFineSetting,
    updateFineSetting
}