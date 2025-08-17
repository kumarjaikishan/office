const user = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRegister = async (req, res, next) => {
    try {
        const { name, email, role, password } = req.body;
        if (!name || !email || !role || !password) {
            return next({ status: 400, message: "all fields are required" });
        }
        const checkemail = await user.findOne({ email });
        if (checkemail) {
            return next({ status: 400, message: "Email Already Exists" });
        }
        const query = new user({ name, email, role, password });
        const result = await query.save();
        if (!result) {
            return next({ status: 400, message: "Something went wrong" });
        }

        res.status(200).json({
            message: 'User Created Successfully'
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const userLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next({ status: 400, message: "Email & passowrd are required" });
    }
    try {
        const isUser = await user.findOne({ email });
        // console.log("inlogin", isUser)
        if (!isUser) {
            return next({ status: 400, message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, isUser.password);
        if (!passwordMatch) {
            return next({ status: 400, success: false, message: "Passowrd is incorrect" });

        }

        let tobe = {
            id: isUser._id,
            name: isUser.name,
            role: isUser.role
        }
        if (isUser.role !== 'admin' && isUser.role !== 'superadmin') {
            tobe.employeeId = isUser.employeeId;
        }
        if (isUser.role == 'admin' || isUser.role == 'manager') {
            tobe.permissions = isUser.permissions;
        }
        if (isUser.role == 'manager') {
            tobe.branchIds = isUser.branchIds;
        }
        if (isUser.companyId) {
            tobe.companyId = isUser.companyId;
        }

        const token = jwt.sign(tobe,
            process.env.JWT_Key,
            { expiresIn: '10d' }
        )

        isUser.password = undefined;
        isUser.createdAt = undefined;
        isUser._id = undefined;

        return res.status(200).json({
            success: true,
            message: 'login successfull',
            token,
            user: {
                name: isUser.name,
                email: isUser.email,
                role: isUser.role
            }
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

module.exports = { userRegister, userLogin };