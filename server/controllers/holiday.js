const holidaymodal = require('../models/holiday');
const companymodal = require('../models/company')

const addholiday = async (req, res) => {
    const { name, fromDate, toDate, type, description } = req.body;

    if (!name || !fromDate || !toDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const holiday = new holidaymodal({ companyId:req.user.companyId , userid: req.user.id, name, description, fromDate, toDate, type });
        await holiday.save();
        res.json({ message: 'Holiday added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteholiday = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Id is required' });
    }
    try {
        await holidaymodal.findByIdAndDelete(id);
        res.status(200).json({ message: 'Holiday Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
const updateholiday = async (req, res) => {
    const { holidayId, name, fromDate, toDate, type, description } = req.body;
    if (!holidayId || !name || !fromDate || !toDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const companyid = await holidaymodal.findByIdAndUpdate(holidayId, { name, fromDate, toDate, type, description })
        res.json({ message: 'Holiday Updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getholidays = async (req, res) => {
    try {
        const holidays = await holidaymodal.find({ companyId: req.user.companyId }).sort({fromDate:-1});
        res.json({ holidays });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { addholiday, getholidays, updateholiday, deleteholiday };