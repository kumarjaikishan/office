const departmentModal = require('../models/department');
const employeeModal = require('../models/employee');
const usermodal = require('../models/user');
const leavemodal = require('../models/leave')
const holidaymodal = require('../models/holiday')
const Ledger = require("../models/ledger");
const Entry = require("../models/entry");
const notificationmodal = require('../models/notification')
const attendanceModal = require('../models/attandence');
const salaryModal = require('../models/salary')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const company = require('../models/company');
const branch = require('../models/branch');
const removePhotoBySecureUrl = require('../utils/cloudinaryremove')
const redisClient = require('../utils/redis');


cloudinary.config({
    cloud_name: 'dusxlxlvm',
    api_key: '214119961949842',
    api_secret: "kAFLEVAA5twalyNYte001m_zFno"
});

const addDepartment = async (req, res, next) => {
    try {
        const { branchId, department, description } = req.body;
        if (!department) {
            return next({ status: 400, message: "all fields are required" });
        }

        const query = new departmentModal({ companyId: req.user.companyId, branchId, department, description });
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
        const query = await departmentModal.find().populate('branchId', 'name');

        res.status(200).json({
            list: query
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


const addemployee = async (req, res, next) => {

    const { employeeName, branchId, department, email, username, password, designation, salary } = req.body;

    if (!employeeName || !email || !password || !department || !designation || !salary || !username || !branchId) {
        return res.status(400).json({ message: "All fields are required" });
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

        let createUser = new usermodal({ companyId: req.user.companyId, name: employeeName, email, role, password });
        let resulten = await createUser.save({ session });

        // Step 2: Upload profile image to Cloudinary
        let uploadResult = null;
        if (req.file) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'ems/employee'
            });

            if (uploadResult) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Failed to delete local file:', err);
                });
            }
        }

        const query = new employeeModal({
            companyId: req.user.companyId,
            userid: resulten._id, designation, salary, branchId, profileimage: uploadResult?.secure_url, username, department,
        });
        const resulte = await query.save({ session });

        await usermodal.findByIdAndUpdate(resulten._id, { employeeId: resulte._id }).session(session)

        // Step 4: Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'employee Created Successfully'
        })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error.message)
        return res.status(500).json({
            message: 'serer error'
        })
    }
}

const updateemployee = async (req, res, next) => {
    try {
        const { employeeId, employeeName, branchId, department, email, username, designation,
            phone, address, gender, bloodGroup, dob, Emergencyphone, skills = [], maritalStatus, salary = 0, achievements,
            education } = req.body;

        if (!employeeId || !department || !branchId) {
            return next({ status: 400, message: "All fields are required" });
        }

        // Get existing employee data (to keep old image if no new one uploaded)
        const existingEmployee = await employeeModal.findById(employeeId);
        if (!existingEmployee) {
            return next({ status: 404, message: "Employee not found" });
        }
        // Define fields to update dynamically
        const possibleEmployeeFields = [
            'dob', 'designation', 'phone', 'address', 'gender', 'bloodGroup',
            'Emergencyphone', 'skills', 'department', 'maritalStatus', 'salary',
            'achievements', 'education'
        ];

        let updatedFields = {};

        possibleEmployeeFields.forEach(field => {
            let value = req.body[field];

            // Convert invalid values to empty string
            if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') {
                updatedFields[field] = '';
            } else if (field === 'achievements' || field === 'education') {
                try {
                    updatedFields[field] = JSON.parse(value);
                } catch (err) {
                    console.log(`Error parsing ${field}:`, err.message);
                    updatedFields[field] = []; // fallback to empty array
                }
            } else {
                updatedFields[field] = value;
            }
        });


        let userupdatedFields = {
            name: employeeName, email, branchId, department,
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
        const updatedUser = await usermodal.findByIdAndUpdate(
            existingEmployee.userid,
            userupdatedFields,
            { new: true }
        );
        const updatedEmployee = await employeeModal.findByIdAndUpdate(
            employeeId,
            updatedFields,
            { new: true }
        );

        if (existingEmployee.profileimage && existingEmployee.profileimage !== "") {
            let arraye = [];
            arraye.push(existingEmployee.profileimage);
            await removePhotoBySecureUrl(arraye);
        }

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

const enrollFace = async (req, res, next) => {
    try {
        const { employeeId, descriptor } = req.body;
        if (!employeeId || !descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
            return next({ status: 400, message: "Invalid employeeId or descriptor" });
        }

        const query = await employeeModal.findByIdAndUpdate(employeeId, { faceDescriptor: descriptor });

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Face enrolled Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deletefaceenroll = async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) {
            return next({ status: 400, message: "Invalid employeeId" });
        }

        const query = await employeeModal.findByIdAndUpdate(employeeId, { faceDescriptor: null });

        if (!query) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'Enrolled face deleted Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deleteemployee = async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) {
            return next({ status: 400, message: "employeeId is required" });
        }

        const employee = await employeeModal.findByIdAndDelete(employeeId);
        await usermodal.deleteMany({ employeeId });
        await leavemodal.deleteMany({ employeeId });
        await attendanceModal.deleteMany({ employeeId });
        await salaryModal.deleteMany({ employeeId });

        if (employee?.profileimage) {
            await removePhotoBySecureUrl([employee.profileimage]);
        }

        if (!employee) {
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

        res.status(200).json({
            list: query,
            departmentlist
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const addAdmin = async (req, res, next) => {

    // console.log(req.body);
    // return res.status(400).json({ message: "All fields are required" });
    const { name, email, role, password, permissions } = req.body;

    if (!name || !email || !role || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingUser = await usermodal.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const fields = {
            name,
            email,
            role,
            password,
            companyId: req.user.companyId,
        };

         // Convert permissions if stringified
        if (permissions && typeof permissions === 'string') {
            fields.permissions = JSON.parse(permissions);
        } else if (permissions && typeof permissions === 'object') {
            fields.permissions = permissions;
        }

        let uploadResult = null;
        if (req.file) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'ems/employee',
            });

            if (uploadResult?.secure_url) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Failed to delete local file:', err);
                });
                fields.profileImage = uploadResult.secure_url;
            }
        }

        const createUser = new usermodal({ ...fields }); // <-- FIXED
        await createUser.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: `${role} Created Successfully`,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};

const getAdmin = async (req, res, next) => {
    try {
        const admins = await usermodal.find({
            companyId: req.user.companyId,
            role: { $in: ["admin", "manager"] },
            _id: { $ne: req.userid }
        });

        res.status(200).json(admins);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};


const editAdmin = async (req, res, next) => {
    const { name, email, role, password, permissions } = req.body;
    const { id } = req.params;
    // console.log(req.body);
    // return res.status(400).json({ message: "All fields are required" });

    if (!name || !email || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingUser = await usermodal.findOne({ email }).session(session);

        if (existingUser.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: "Access denied: This user don't Belong to You" });
        }

        if (existingUser && existingUser._id.toString() !== id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const fields = {
            name,
            email,
            role,
            companyId: req.user.companyId
        };

        // Only update password if provided
        if (password) {
            fields.password = password;
        }

        // Convert permissions if stringified
        if (permissions && typeof permissions === 'string') {
            fields.permissions = JSON.parse(permissions);
        } else if (permissions && typeof permissions === 'object') {
            fields.permissions = permissions;
        }

        // Handle profile image upload
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'ems/employee'
            });

            if (uploadResult) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Failed to delete local file:', err);
                });
                fields.profileImage = uploadResult.secure_url;
            }
        }

        const updatedUser = await usermodal.findByIdAndUpdate(
            id,
            { $set: fields },
            { new: true, session }
        );
        await redisClient.del(`permissions:${id}`);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Admin updated successfully',
            user: updatedUser
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteAdmin = async (req, res, next) => {
    const { id } = req.params;

    try {
        const adminmanager = await usermodal.findOne({
            _id: id,
            role: { $in: ['admin', 'manager'] }
        });

        if (!adminmanager) {
            return res.status(400).json({ message: 'Wrong Id' });
        }

        if (!adminmanager.companyId.equals(req.user.companyId)) {
            return res.status(403).json({ message: "Access denied: This user doesn't belong to you" });
        }

        await usermodal.deleteOne({ _id: id });

        if (adminmanager.profileImage) {
            await removePhotoBySecureUrl([adminmanager.profileImage]);
        }

        if (adminmanager.role === 'manager') {
            for (const element of adminmanager.branchIds) {
                let previousmanager = await branch.findById(element);
                if (previousmanager) {
                    previousmanager.managerIds = previousmanager.managerIds.filter(
                        e => e.toString() !== adminmanager._id.toString()
                    );
                    await previousmanager.save();
                }
            }
        }

        res.status(200).json({
            message: 'Admin deleted successfully',
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};


const firstfetch = async (req, res, next) => {
    try {
        // 1️⃣ Find the company for this admin
        // const companye = await company.findOne({ adminId: req.user.id });
        const companye = await company.findOne({ _id: req.user.companyId });

        let branches = [];
        let departmentlist = [];
        let employees = [];
        let adminManager = [];
        let attendance = [];
        let holidays = [];
        let ledger = [];
        // let permissionName=[];
        // let defaultRolePermission=[];

        if (req.user.role == 'manager') {

            branches = await branch.find({ companyId: req.user.companyId })
                .populate({
                    path: 'managerIds',
                    select: 'name profileimage',
                });
            // const branchIds = branches.map(bran => bran._id);

            departmentlist = await departmentModal.find({
                companyId: req.user.companyId,
                branchId: { $in: req.user.branchIds }   // ✅ use $in, not $between
            })
                .populate('branchId', 'name')
                .select('department branchId')
                .sort({ department: 1 });

            employees = await employeeModal.find({ companyId: req.user.companyId, branchId: { $in: req.user.branchIds } })
                .populate('department', 'department')
                .populate('userid', 'email name ')
                .sort({ employeename: 1 });

            const employeeIds = employees.map(emp => emp._id);

            attendance = await attendanceModal.find({
                companyId: req.user.companyId,
                employeeId: {
                    $in: employeeIds
                }
            }).sort({ date: -1 })
                .populate({
                    path: 'employeeId',
                    select: 'userid profileimage department',
                    populate: { path: 'userid', select: 'name' }
                })
                .populate({
                    path: 'leave',
                    select: 'reason',
                });
            holidays = await holidaymodal.find({ companyId: req.user.companyId });
        }

        if ((req.user.role == 'superadmin' || req.user.role == 'admin') && companye) {
            const compId = companye._id;

            branches = await branch.find({ companyId: compId })
                .populate({
                    path: 'managerIds',
                    select: 'name profileImage',
                });

            departmentlist = await departmentModal.find({ companyId: compId })
                .populate('branchId', 'name')
                .select('department branchId')
                .sort({ department: 1 });

            adminManager = await usermodal.find({
                companyId: compId,
                role: { $in: ['admin', 'manager'] }
            }).select('-password');

            employees = await employeeModal.find({ companyId: compId })
                .populate('department', 'department')
                .populate('userid', 'email name ')
                .sort({ employeename: 1 });

            attendance = await attendanceModal.find({ companyId: compId })
                .sort({ date: -1 })
                .populate({
                    path: 'employeeId',
                    select: 'userid profileimage department',
                    populate: { path: 'userid', select: 'name' }
                })
                .populate({
                    path: 'leave',
                    select: 'reason',
                });
            holidays = await holidaymodal.find({ companyId: compId });
            // await usermodal.find({})
        }

        ledger = await Ledger.find({ userId: req.user.id });
        const ledgersWithBalance = await Promise.all(
            ledger.map(async (ledger) => {
                const lastEntry = await Entry.findOne({ ledgerId: ledger._id })
                    .sort({ date: -1 });

                return {
                    ...ledger.toObject(),
                    netBalance: lastEntry ? lastEntry.balance : 0
                };
            })
        );

        const response = {
            user: req.user,
            departmentlist,
            employee: employees,
            attendance,
            holidays,
            ledger: ledgersWithBalance
        }
        if (company?.length) response.company = companye;
        if (branches?.length) response.branch = branches;
        if (adminManager?.length) response.adminManager = adminManager;
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return next({ status: 500, message: error.message });
    }
};




const addcompany = async (req, res, next) => {
    const { name, industry } = req.body;

    try {
        // Check if a company already exists for this admin
        const existingCompany = await company.findOne({ adminId: req.userid });

        if (existingCompany) {
            return res.status(400).json({ message: "Company already created" });
        }

        // Create a new company
        const newCompany = new company({ name, industry, adminId: req.userid });
        await newCompany.save();

        await usermodal.findByIdAndUpdate(req.userid, { companyId: newCompany._id })

        return res.status(200).json({ message: "Created new company", company: newCompany });

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};

const updateCompany = async (req, res, next) => {
    const { _id, ...updateFields } = req.body;

    try {
        // Fetch the existing company document
        const companyDoc = await company.findById(_id);

        if (!companyDoc) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Keep track of the old logo before any changes
        const oldLogo = companyDoc.logo;

        // Update fields
        Object.assign(companyDoc, updateFields);

        // If a new file is uploaded
        if (req.file) {
            const cloudinaryResult = await cloudinary.uploader.upload(
                req.file.path,
                { folder: 'ems/company' }
            );

            // Delete local file
            fs.unlink(req.file.path, (err) => {
                if (err) console.log("Error deleting local file:", err.message);
            });

            // Set new logo URL
            companyDoc.logo = cloudinaryResult.secure_url;

            // Delete old logo from cloudinary if it exists
            if (oldLogo && oldLogo !== "") {
                await removePhotoBySecureUrl([oldLogo]);
            }
        }

        await companyDoc.save();

        return res.status(200).json({
            message: "Company updated successfully",
            logoUrl: companyDoc.logo
        });

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};


const addBranch = async (req, res, next) => {
    const { defaultsetting, name, location, companyId, managerIds = [] } = req.body;

    try {
        // Create new branch
        let fields = {
            name, location, companyId,
            managerIds, defaultsetting
        }
        if (!defaultsetting) {
            const setting = req.body.setting
            fields.setting = setting
        }
        const newBranch = new branch(fields);

        // Update user roles to 'manager' if managerIds provided
        if (managerIds.length > 0) {

            // Or, if you want faster parallel execution:
            await Promise.all(managerIds.map(empId =>
                usermodal.findOneAndUpdate({ employeeId: empId }, { role: 'manager' })
            ));
        }

        await newBranch.save();

        return res.status(200).json({ message: "Branch created", branch: newBranch });

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};


const editBranch = async (req, res, next) => {
    const { _id, name, location, companyId, defaultsetting, managerIds = [] } = req.body;

    try {
        const existingBranch = await branch.findById(_id);
        if (!existingBranch) {
            return next({ status: 404, message: "Branch not found" });
        }
        let updateDoc = {
            name, location, companyId, managerIds, defaultsetting
        }
        if (!defaultsetting) {
            const setting = req.body.setting
            updateDoc.setting = setting
        } else {
            updateDoc.$unset = { setting: 1 };
        }

        const previousManagerIds = existingBranch.managerIds.map(id => id.toString());
        const newManagerIds = managerIds.map(id => id.toString());

        const removedManagerIds = previousManagerIds.filter(id => !newManagerIds.includes(id));
        // console.log("removed id", removedManagerIds);

        const addedManagerIds = newManagerIds.filter(id => !previousManagerIds.includes(id));
        // console.log("new to be added id", addedManagerIds);

        await branch.findByIdAndUpdate(_id, updateDoc);

        // Remove this branch from removed managers
        for (const removedId of removedManagerIds) {
            await usermodal.findByIdAndUpdate(
                removedId,
                { $pull: { branchIds: _id } } // remove this branch from their array
            );
        }

        // Add this branch to added managers
        for (const addedId of addedManagerIds) {
            await usermodal.findByIdAndUpdate(
                addedId,
                { $addToSet: { branchIds: _id } } // add branch if not already in array
            );
        }

        return res.status(200).json({ message: "Branch Edited Successfully" });

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};

const deleteBranch = async (req, res, next) => {
    const { _id, name, location, companyId, managerIds = [] } = req.body;

    try {
        const existingBranch = await branch.findById(_id);
        if (!existingBranch) {
            return next({ status: 404, message: "Branch not found" });
        }

        const previousManagerIds = existingBranch.managerIds.map(id => id.toString());
        const newManagerIds = managerIds.map(id => id.toString());

        const removedManagerIds = previousManagerIds.filter(id => !newManagerIds.includes(id));
        // console.log("removed id", removedManagerIds);

        const addedManagerIds = newManagerIds.filter(id => !previousManagerIds.includes(id));
        // console.log("new to be added id", addedManagerIds);

        await branch.findByIdAndUpdate(_id, { name, location, companyId, managerIds });

        // Remove this branch from removed managers
        for (const removedId of removedManagerIds) {
            await usermodal.findByIdAndUpdate(
                removedId,
                { $pull: { branchIds: _id } } // remove this branch from their array
            );
        }

        // Add this branch to added managers
        for (const addedId of addedManagerIds) {
            await usermodal.findByIdAndUpdate(
                addedId,
                { $addToSet: { branchIds: _id } } // add branch if not already in array
            );
        }

        return res.status(200).json({ message: "Branch Edited Successfully" });

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};




const getemployee = async (req, res, next) => {
    const { empid } = req.query;
    try {
        const employe = await employeeModal.findById(empid)
            .populate('userid', '-password')
            .populate('department');

        return res.status(200).json(employe);
        // setTimeout(() => {
        //     return res.status(200).json(employe);
        // }, 100);

    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: 'Internal Server Error' });
    }
};
const updatepassword = async (req, res, next) => {
    const { userid, pass } = req.body.pass;

    if (!userid || !pass) {
        return next({ status: 400, message: "User ID and password are required" });
    }
    try {
        const user = await usermodal.findById(userid);
        if (!user) {
            return next({ status: 404, message: "User not found" });
        }
        user.password = pass;
        await user.save()

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: 'Internal Server Error' });
    }
};

const leavehandle = async (req, res, next) => {
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
                        companyId: req.user.companyId,
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
    addDepartment, addBranch, enrollFace, addAdmin, deleteBranch, getAdmin, editAdmin, deleteAdmin, deletefaceenroll, updatepassword, updateCompany, editBranch, firstfetch, getemployee, addcompany, departmentlist, leavehandle, updatedepartment, deletedepartment, employeelist, addemployee,
    updateemployee, deleteemployee
};