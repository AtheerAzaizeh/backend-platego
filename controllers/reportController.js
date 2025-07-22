const Report = require('../models/Report');

// מביא את כל הדוחות של משתמש מחובר
exports.getReports = async (req, res) => {
    const userID = req.user.id;

    try {
        const reports = await Report.find({ userID });
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

// מביא דוח לפי מזהה
exports.getReportById = async (req, res) => {
    const { id } = req.params;

    try {
        const report = await Report.findById(id);
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching report' });
    }
};

// הוספת דוח חדש
exports.addReport = async (req, res) => {
    const userID = req.user.id;
    const { plate, reason, location, date, image, map, carID } = req.body;

    try {
        const newReport = new Report({
            plate,
            reason,
            location,
            date,
            image,
            map,
            userID,
            carID
        });

        await newReport.save();
        res.json(newReport);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding report' });
    }
};

// מחיקת דוח לפי מזהה
exports.deleteReport = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Report.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting report' });
    }
};
