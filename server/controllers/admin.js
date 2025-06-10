const departmentModal = require('../models/department');
const employeeModal = require('../models/employee');

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
const updatedepartment = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { department, description, departmentId } = req.body;
        if (!department || !departmentId) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = await departmentModal.findByIdAndUpdate( departmentId , { department, description });

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Department Updated Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deletedepartment = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { departmentId } = req.body;
        if (!departmentId) {
            return next({ status: 400, message: "departmentId is required" });
        }

        const query = await departmentModal.findByIdAndDelete(departmentId);

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Department Deleted Successfully'
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


const addemployee = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { employeeName, dob ,department,description,salary } = req.body;
        if (!department) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = new employeeModal({employeename:employeeName, dob,salary ,department,description });
        const result = await query.save();
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'employee Created Successfully'
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const updateemployee = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { employeeId, employeeName, dob,department,description } = req.body;
        if (!department || !employeeId) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = await employeeModal.findByIdAndUpdate( employeeId , {  employeeName, dob,department,description  });

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'employee Updated Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deleteemployee = async (req, res, next) => {
    // console.log(req.body)
    try {
        const { employeeId } = req.body;
        if (!employeeId) {
            return next({ status: 400, message: "employeeId is required" });
        }

        const query = await employeeModal.findByIdAndDelete(employeeId);

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'employee Deleted Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const employeelist = async (req, res, next) => {
    try {
        const query = await employeeModal.find().populate('department', 'department');
        const departmentlist  = await departmentModal.find().select('department');
        console.log(query)

        res.status(200).json({
            list: query,
            departmentlist
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


module.exports = { addDepartment, departmentlist, updatedepartment ,deletedepartment,employeelist,addemployee,
    updateemployee,deleteemployee
};