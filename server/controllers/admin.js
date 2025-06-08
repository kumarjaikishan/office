const departmentModal = require('../models/department');

const addDepartment = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { department, description } = req.body;
        if (!department) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = new departmentModal({ department, description });
        const result = await query.save();
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Department Created Successfully'
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const departmentlist = async (req, res, next) => {
    try {
        const query = await departmentModal.find();

        res.status(200).json({
            list: query
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


module.exports = { addDepartment, departmentlist };