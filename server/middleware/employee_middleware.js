const employee = require('../models/employee');

const employeemiddlewre = async (req, res, next) => {

    try {
        const employeeee = await employee.findOne({ userid: req.userid }).populate('branchId','companyId');
        // console.log("emplyee middleware",employeeee)

        if (employeeee) {
            req.profile = employeeee
            req.empId = employeeee._id
            req.companyId = employeeee.branchId.companyId
            next();
        } else {
            return res.status(401).json({ message: 'No employee Found' });
        }

    } catch (error) {
        // console.log(error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid Token' });
        }
        res.status(401).json({ message: error.message })
    }
}
module.exports = employeemiddlewre;