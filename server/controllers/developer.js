const user = require('../models/user');
const company = require('../models/company');
const permissionschema = require('../models/permission');
const permission = require('../utils/permission');

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
        const newuser = new user({ name, registeredName: name, email, password, permissions: permission.superAdmin, role: "superadmin" });
        const savedUser = await newuser.save();

        const newcompany = new company({ adminId: savedUser._id });
        const savedcompany = await newcompany.save();

        await user.findByIdAndUpdate(savedUser._id, { companyId: savedcompany._id })

        return res.status(201).json({
            message: "User created"
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const getDemo = async (req, res, next) => {
   
    const { id } = req.params;
    try {
        const demousers = await user.find({ companyId: id, role: 'demo' }).select('email name');

        return res.status(200).json({
            demousers
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const deleteDemo = async (req, res, next) => {
   
    const { id } = req.params;
    try {
        const demousers = await user.findByIdAndDelete(id);

        return res.status(200).json({
            message:'Demo User Deleted'
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const addDemo = async (req, res, next) => {
    const { companyId, name, email, password } = req.body;

    try {
        const newuser = new user({ name, companyId, email, password, permissions: permission.demo, role: "demo" });
        const savedUser = await newuser.save();

        return res.status(201).json({
            message: "User created"
        })

    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const editUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email } = req.body;
    // console.log(id, name, email)

    try {
        const query = await user.findByIdAndUpdate(id, {
            $set: {
                registeredName: name, email
            }
        });

        return res.status(200).json({
            message: "Edited Successfully"
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
    try {
        await permissionschema.insertMany(permission);
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }

}
const saveModule = async (req, res, next) => {
    // console.log(req.body);
    //   return res.status(200).json({
    //         message:'ok'
    //     })
    try {
        const permission = await user.findByIdAndUpdate(req.user.id, { AllPermissionNames: req.body.modules });

        return res.status(200).json({
            message: 'Module Updated'
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}
const getdefaultpermission = async (req, res, next) => {
    try {
        const permission = await permissionschema.find();
        const permissionnames = await user.findById(req.user.id).select('AllPermissionNames');

        return res.status(200).json({
            permission, permissionnames
        })
    } catch (error) {
        console.log(error.message)
        return next({ status: 500, message: error.message });
    }
}

const updatedefaultpermission = async (req, res, next) => {
    const { id } = req.params;

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


module.exports = { allUser, addUser, editUser, deleteUser, addDemo, getDemo,deleteDemo,saveModule, adddefaultpermission, updatedefaultpermission, getdefaultpermission };