const holidaymodal = require('../models/holiday');

const addholiday = async (req, res) => {
    const { name, fromDate, toDate, type } = req.body;

    if (!name || !fromDate || !toDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const holiday = new holidaymodal({ name, fromDate, toDate, type });
        await holiday.save();
        res.json({ message: 'Holiday added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
const getholidays = async (req, res) => {
    try {
        const holidays = await holidaymodal.find();
        res.json({ holidays });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { addholiday, getholidays };