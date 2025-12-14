const departmentModal = require('../models/department');
const employeeModal = require('../models/employee');
const usermodal = require('../models/user');
const leavemodal = require('../models/leave')
const holidaymodal = require('../models/holiday')
const LeaveBalance = require('../models/leavebalance')
const advancemodal = require('../models/advance')
const Ledger = require("../models/ledger");
const Entry = require("../models/entry");
const notificationmodal = require('../models/notification')
const attendanceModal = require('../models/attandence');
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

async function generateNextEmpId(companyId, prefix = "EMP", padding = 3) {
    try {
        // Find the latest employee for the company, sorted by empId descending
        const lastEmployee = await employeeModal.findOne({ companyId })
            .sort({ empId: -1 })
            .lean();

        let nextNumber = 1;

        if (lastEmployee && lastEmployee.empId) {
            // Extract numeric part from empId
            const match = lastEmployee.empId.match(/\d+$/);
            if (match) {
                nextNumber = parseInt(match[0], 10) + 1;
            }
        }

        // Pad number with leading zeros
        const nextEmpId = prefix + String(nextNumber).padStart(padding, "0");
        return nextEmpId;
    } catch (err) {
        console.error("Error generating next empId:", err);
        throw new Error("Failed to generate employee ID");
    }
}

const addDepartment = async (req, res, next) => {
    try {
        const { branchId, department, description } = req.body;

        if (!department) {
            return next({ status: 400, message: "Department name is required" });
        }

        const normalizedDept = department.toLowerCase();

        const isExist = await departmentModal.findOne({
            companyId: req.user.companyId,
            branchId,
            department: normalizedDept,
        });

        if (isExist) {
            return next({
                status: 400,
                message: "Department already exists for this branch",
            });
        }

        const newDepartment = new departmentModal({
            companyId: req.user.companyId,
            branchId,
            department: normalizedDept,
            description,
        });

        const result = await newDepartment.save();
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(201).json({
            message: "Department created successfully",
            department: result,
        });
    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};

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

    const { employeeName, branchId, department, email, password = 'employee', designation, salary } = req.body;

    if (!employeeName || !email || !department || !branchId) {
        return res.status(400).json({ message: "Please Fill required Fields" });
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
        const empId = await generateNextEmpId(req.user.companyId);

        const query = new employeeModal({
            companyId: req.user.companyId,
            userid: resulten._id, designation, salary, empId, employeeName, branchId, profileimage: uploadResult?.secure_url, department,
        });
        const resulte = await query.save({ session });

        // creating ledger for employee
        const ledger = new Ledger({ companyId: req.user.companyId, name: employeeName, employeeId: resulten._id, profileImage: uploadResult?.secure_url });
        const ledid = await ledger.save();

        await usermodal.findByIdAndUpdate(resulten._id, { employeeId: resulte._id }).session(session)
        await employeeModal.findByIdAndUpdate(resulte._id, { ledgerId: ledid._id }).session(session)

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
        const { employeeId, employeeName, branchId, department, email, empId } = req.body;

        if (!employeeId || !department || !branchId) {
            return next({ status: 400, message: "Required fields (employeeId, department, branchId) are missing." });
        }

        const existingEmployee = await employeeModal.findById(employeeId);
        if (!existingEmployee) {
            return next({ status: 404, message: "Employee not found." });
        }

        // Fields that may come as JSON strings from frontend
        const jsonFields = ["allowances", "bonuses", "deductions", "achievements", "education", "guardian"];

        let employeeUpdateData = {};
        let userUpdateData = {};

        for (const key in req.body) {
            let value = req.body[key];

            // Parse JSON fields if needed
            if (jsonFields.includes(key) && typeof value === "string") {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // fallback to empty array/object
                    if (["allowances", "bonuses", "deductions", "achievements", "education"].includes(key)) {
                        value = [];
                    } else if (key === "guardian") {
                        value = { name: "", relation: "S/o" };
                    }
                }
            }

            // Handle type conversion
            if (key === "salary") value = Number(value) || 0;
            if (key === "status" || key === "defaultPolicies") value = (value === true || value === "true");

            // Separate user and employee fields
            if (["employeeName", "email", "branchId", "department"].includes(key)) {
                userUpdateData[key] = value;
            } else if (key !== "employeeId") {
                employeeUpdateData[key] = value;
            }
        }

        // Handle empId uniqueness
        if (empId) {
            const empcode = "EMP" + String(empId).padStart(3, "0");
            const alreadyEmpId = await employeeModal.findOne({
                empId: empcode,
                companyId: req.user.companyId,
                _id: { $ne: employeeId }
            });
            if (alreadyEmpId) {
                return next({ status: 400, message: "This Employee ID already exists." });
            }
            employeeUpdateData.empId = empcode;
        }

        // Handle profile photo
        if (req.file) {
            const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "ems/employee"
            });
            fs.unlink(req.file.path, err => { if (err) console.log("File delete error:", err.message); });
            employeeUpdateData.profileimage = cloudinaryResult.secure_url;

            if (existingEmployee.profileimage) {
                await removePhotoBySecureUrl([existingEmployee.profileimage]);
            }
        }

        await usermodal.findByIdAndUpdate(existingEmployee.userid, userUpdateData, { new: true });
        const updatedEmployee = await employeeModal.findByIdAndUpdate(employeeId, employeeUpdateData, { new: true, runValidators: true });

        if (!updatedEmployee) {
            return next({ status: 400, message: "Failed to update employee." });
        }

        return res.status(200).json({ message: "Employee updated successfully." });

    } catch (error) {
        console.error("Update employee error:", error.message);
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

const updateprofile = async (req, res, next) => {
    try {
        const whichuser = await usermodal.findById(req.user.id);
        const oldprofile = whichuser?.profileImage || undefined;

        let uploadResult;
        if (req.file) {
            // upload new image
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "ems/employee",
            });

            if (uploadResult) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Failed to delete local file:", err);
                });
            }
        }

        // Build update object dynamically
        const updateData = { name: req.body.name };
        if (uploadResult?.secure_url) {
            updateData.profileImage = uploadResult.secure_url;

            // remove old image only if new one is uploaded
            if (oldprofile) {
                await removePhotoBySecureUrl([oldprofile]);
            }
        }

        await usermodal.findByIdAndUpdate(req.user.id, updateData, { new: true });

        return res.status(200).json({
            message: "Updated successfully",
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: "Server error",
        });
    }
};



const editAdmin = async (req, res, next) => {
    const { name, email, role, permissions } = req.body;
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
        const oldprofile = existingUser.profileImage || undefined;

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

            if (oldprofile) {
                await removePhotoBySecureUrl([oldprofile]);
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
    // console.log(req.user)
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
        let user;
        let leaveBalance = [];
        let advance = [];
        // let permissionName=[];
        // let defaultRolePermission=[];
        user = await usermodal.findById(req.user.id).select('name email profileImage role permissions branchIds');

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
                .sort({ empId: 1 });

            // console.log(employees)

            const employeeIds = employees.map(emp => emp._id);

            attendance = await attendanceModal.find({
                companyId: req.user.companyId,
                employeeId: {
                    $in: employeeIds
                }
            })
                .sort({ date: -1, empId: 1 })
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
            leaveBalance = await LeaveBalance.find({
                companyId: req.user.companyId,
                branchId: { $in: req.user.branchIds }
            }).populate({
                path: "employeeId",
                select: "userid profileimage empId designation",
                populate: { path: "userid", select: "name", },
            }).sort({ date: -1, createdAt: -1 });

            advance = await advancemodal.find({
                companyId: req.user.companyId,
                branchId: { $in: req.user.branchIds }
            }).populate({
                path: "employeeId",
                select: "userid profileimage empId",
                populate: { path: "userid", select: "name", },
            }).sort({ date: -1, createdAt: -1 });
        }

        if ((req.user.role == 'superadmin' || req.user.role == 'admin' || req.user.role == 'demo') && companye) {
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
                .populate('userid', 'email name role')
                .sort({ empId: 1 });

            attendance = await attendanceModal.find({ companyId: compId })
                .sort({ date: -1, empId: 1 })
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
            leaveBalance = await LeaveBalance.find({ companyId: compId, }).populate({
                path: "employeeId",
                select: "userid profileimage empId designation",
                populate: { path: "userid", select: "name", },
            }).sort({ date: -1, createdAt: -1 });

            advance = await advancemodal.find({ companyId: compId, }).populate({
                path: "employeeId",
                select: "userid profileimage empId designation",
                populate: { path: "userid", select: "name", },
            }).sort({ date: -1, createdAt: -1 });
            // console.log(advance)
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



        async function fixEmployeeEmpIds() {
            // find records where empId is missing or null
            const records = await attendanceModal.find({
                $or: [{ empId: { $exists: false } }, { empId: null }]
            });

            for (const rec of records) {
                if (!rec.employeeId) continue; // skip if employeeId itself is missing

                // find employee doc
                const employee = await employeeModal.findById(rec.employeeId).select("empId");
                if (employee && employee.empId) {
                    await attendanceModal.updateOne(
                        { _id: rec._id },
                        { $set: { empId: employee.empId } }
                    );
                }
            }

            console.log("✅ Employee empId fixed where missing!");
        }

        // fixEmployeeEmpIds()


        const response = {
            user: user,
            departmentlist,
            employee: employees,
            attendance, advance,
            holidays,
            ledger: ledgersWithBalance,
            leaveBalance
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
        if (!user) {
            return res.status(400).json({ message: 'User ID and password are required' });
        }
    }

    try {
        const user = await usermodal.findById(userid);
        if (!user) {
            return res.status(400).json({ message: 'User not Found' });
        }
        if (user?.companyId?.toString() !== req.user?.companyId) {
            return res.status(403).json({ message: 'You are not Authorised' });
        }

        user.password = pass;
        await user.save()

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        return next({ status: 500, message: error.message });
    }
};

const leavehandle = async (req, res, next) => {
    let { leaveid, status } = req.body;

    if (!leaveid || !status) return next({ status: 400, message: "Leave id and status is required" });

    try {
        const query = await leavemodal.findByIdAndUpdate(leaveid, { status }).populate('employeeId', 'userid');


        if (!query) return next({ status: 404, message: "Leave not found" });

        const userId = query.employeeId.userid;

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
            const branchId = query.branchId;

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
                        branchId,
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
const deleteleave = async (req, res, next) => {
    const { leaveid } = req.params;
    try {
        const query = await leavemodal.findByIdAndDelete(leaveid);

        if (!query) return next({ status: 404, message: "Leave not found" });

        return res.status(200).json({
            message: 'Deleted Successfully'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


module.exports = {
    addDepartment, addBranch, enrollFace, addAdmin, deleteBranch, updateprofile, deleteleave, getAdmin, editAdmin, deleteAdmin, deletefaceenroll, updatepassword, updateCompany, editBranch, firstfetch, getemployee, addcompany, departmentlist, leavehandle, updatedepartment, deletedepartment, employeelist, addemployee,
    updateemployee, deleteemployee
};