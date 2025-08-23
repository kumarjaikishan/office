const user = require('../models/user');
const company = require('../models/company');
const permissionschema = require('../models/permission');
const permission = require('../utils/mongodefaultpermission');

const allUser = async (req, res, next) => {
    try {

        const query = await user.find({ role: 'superadmin' }).sort({ createdAt: -1 });

        res.status(200).json({
            users: query
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}



const addUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const newuser = new user({ name, email, password, permissions: permission.superAdmin, role: "superadmin" });
        const savedUser = await newuser.save();

        const newcompany = new company({ adminId: savedUser._id });
        const savedcompany = await newcompany.save();

        await user.findByIdAndUpdate(savedUser._id, { companyId: savedcompany._id })

        return res.status(200).json({
            message: "User created"
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const editUser = async (req, res, next) => {
    // console.log(req.body);
    // console.log(permission.superAdmin)
    const { name, email, password } = req.body;
    return res.status(200).json({
        message: "User created"
    })

    try {
        const query1 = new user({ name, email, password, permissions: permission.superAdmin, role: "superadmin" });
        const query = await query1.save();

        return res.status(200).json({
            message: "User created"
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        const query1 = await user.findByIdAndDelete(id);
        await company.findByIdAndDelete(query1.companyId);

        return res.status(200).json({
            message: "User Deleted"
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const adddefaultpermission = async (req, res, next) => {
    // console.log(permission)
    try {
        await permissionschema.insertMany(permission);
        console.log("Permissions inserted successfully");
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }

}
const getdefaultpermission = async (req, res, next) => {
    try {
        const permission = await permissionschema.find();
        return res.status(200).json({
            permission
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const updatedefaultpermission = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    // return res.status(200).json({
    //     message: 'updated'
    // })

    try {
        const defaulte = await permissionschema.findByIdAndUpdate(id, {
            $set: {
                modules: req.body.modules
            }
        });
        return res.status(200).json({
            message: 'Permission Updated'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}


module.exports = { allUser, addUser, editUser, deleteUser, adddefaultpermission, updatedefaultpermission, getdefaultpermission };