const departmentModal = require('../models/department');
const employeeModal = require('../models/employee');
const usermodal = require('../models/user');
const leavemodal = require('../models/leave')
const notificationmodal = require('../models/notification')
const attendanceModal = require('../models/attandence');
const comanysettingModal = require('../models/comanysetting')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { default: mongoose } = require('mongoose');


cloudinary.config({
    cloud_name: 'dusxlxlvm',
    api_key: '214119961949842',
    api_secret: "kAFLEVAA5twalyNYte001m_zFno"
});

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

        const query = await departmentModal.findByIdAndUpdate(departmentId, { department, description });

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
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded.'
        });
    }
    const { employeeName, email, username, password, department, dob = '' } = req.body;

    if (!employeeName || !email || !password || !department) {
        return next({ status: 400, message: "all fields are required" });
    }
    const role = 'employee';

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const existingUser = await usermodal.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'Email already in use.' });
        }

        let createUser = new usermodal({ name: employeeName, email, role, password });
        let resulten = await createUser.save({ session });

        // Step 2: Upload profile image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ems/employee'
        });

        const query = new employeeModal({ userid: resulten._id, employeename: employeeName, profileimage: uploadResult.secure_url, username, department, dob });
        const resulte = await query.save({ session });

        // Step 4: Commit transaction
        await session.commitTransaction();
        session.endSession();

        fs.unlink(req.file.path, (err => {
            if (err) {
                console.log(err);
            }
        }));

        res.status(200).json({
            message: 'employee Created Successfully'
        })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const updateemployee = async (req, res, next) => {
    try {
        const { employeeId, employeeName, dob, department, description, salary } = req.body;

        if (!employeeId || !department) {
            return next({ status: 400, message: "All fields are required" });
        }

        // Get existing employee data (to keep old image if no new one uploaded)
        const existingEmployee = await employeeModal.findById(employeeId);
        if (!existingEmployee) {
            return next({ status: 404, message: "Employee not found" });
        }

        let updatedFields = {
            employeename: employeeName,
            dob,
            department,
            description,
            salary,
        };

        // If a new photo is uploaded
        if (req.file) {
            const cloudinaryResult = await cloudinary.uploader.upload(
                req.file.path,
                { folder: 'ems/employee' }
            );

            // Delete local file
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log("Error deleting local file:", err.message);
                }
            });

            // Set new photo URL
            updatedFields.profileimage = cloudinaryResult.secure_url;
        }

        // Update employee
        const updatedEmployee = await employeeModal.findByIdAndUpdate(
            employeeId,
            updatedFields,
            { new: true }
        );

        if (!updatedEmployee) {
            return next({ status: 400, message: "Something went wrong while updating" });
        }

        res.status(200).json({
            message: 'Employee updated successfully'
        });

    } catch (error) {
        console.log(error.message);
        return next({ status: 500, message: error.message });
    }
};

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
        const query = await employeeModal.find()
            .populate('department', 'department')
            .populate('userid', 'email');
        const departmentlist = await departmentModal.find().select('department');
        // console.log(query)

        res.status(200).json({
            list: query,
            departmentlist
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const firstfetch = async (req, res, next) => {
    try {
        const query = await employeeModal.find().populate('department', 'department').sort({ employeename: 1 });
        const departmentlist = await departmentModal.find().select('department').sort({ department: 1 });
        const attendance = await attendanceModal.find()
            .populate('employeeId', 'employeename profileimage').sort({ date: -1 });
       const companySetting = await comanysettingModal.findOne();

        res.status(200).json({
            user: req.user,
            employee: query,
            departmentlist,
            attendance,
            companySetting
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const setsetting = async (req, res, next) => {
    console.log(req.body)
    const settingsData = req.body;
    // return  res.status(200).json({ message:'ok thik hai' })
    try {
        const updatedSetting = await comanysettingModal.findOneAndUpdate(
            {},                     // match all (singleton)
            settingsData,           // new data
            {
                new: true,            // return updated doc
                upsert: true,         // create if not exists
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({message:"updated", updatedSetting});

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const getsetting = async (req, res, next) => {
    try {
        const companySetting = await comanysettingModal.findOne();

        if (!companySetting) {
            return res.status(404).json({ message: 'Company settings not found' });
        }

        return res.status(200).json(companySetting);

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: 'Internal Server Error' });
    }
};

const leavehandle = async (req, res, next) => {
    // console.log(req.body)
    let { leaveid, status } = req.body;

    if (!leaveid || !status) return next({ status: 400, message: "Leave id and status is required" });

    try {
        const query = await leavemodal.findByIdAndUpdate(leaveid, { status }).populate('employeeId', 'userid');

        const userId = query.employeeId.userid;


        if (!query) return next({ status: 404, message: "Leave not found" });

        let message = '';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };

        const fromFormatted = new Date(query.fromDate).toLocaleDateString('en-GB', options); // "21 Jun, 2025"
        const toFormatted = new Date(query.toDate).toLocaleDateString('en-GB', options);
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        message = `Your leave request from ${fromFormatted} to ${toFormatted} has been ${formattedStatus}.`;

        if (message && userId) {
            await notificationmodal.create({ userId, message });
        }

        if (status == 'approved') {
            const fromDate = new Date(query.fromDate);
            const toDate = new Date(query.toDate);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(0, 0, 0, 0);

            const employeeId = query.employeeId._id;

            // Iterate from fromDate to toDate
            for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
                // Clone date to avoid reference issue
                const currentDate = new Date(date);
                currentDate.setHours(0, 0, 0, 0);

                // Check if attendance already exists
                const existing = await attendanceModal.findOne({ employeeId, date: currentDate });
                if (existing) {
                    if (existing.status === 'absent') {
                        // Update status from 'absent' to 'leave'
                        existing.status = 'leave';
                        existing.source = 'leaveApproval';
                        await existing.save();
                    }
                    // If status is already 'leave' or 'present', skip
                } else {
                    // Insert new leave attendance
                    const attendanceData = {
                        employeeId,
                        date: currentDate,
                        status: 'leave',
                        leave: leaveid,
                        source: 'leaveApproval'
                    };
                    await attendanceModal.create(attendanceData);
                }
            }
        }

        return res.status(200).json({
            message: 'Updated Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


module.exports = {
    addDepartment, firstfetch, setsetting,getsetting, departmentlist, leavehandle, updatedepartment, deletedepartment, employeelist, addemployee,
    updateemployee, deleteemployee
};