const salarymodal = require('../models/salary');

const addsalary = async (req, res, next) => {
    try {
        const { employeeId, basicSalary, allowance, deductions, netSalary, payDate, department, description } = req.body;
        if (!employeeId) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = new salarymodal({ employeeId, basicSalary, allowance, deductions, netSalary, payDate, department, description });
        const result = await query.save();
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Salary added Successfully'
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const salaryfetch = async (req, res, next) => {
    try {
        const result = await salarymodal.find().populate({
            path:'employeeId',
            select:'department employeename',
            populate:{
                path:'department',
                 select:'department'
            }
        });
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            salary: result
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

module.exports = { addsalary, salaryfetch };