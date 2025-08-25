const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    branchIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['developer', 'superadmin', 'admin', 'manager', 'employee'],
        required: true,
    },
    profileImage: {
        type: String,
    },
    permissions: {
        type: Map,
        of: [Number],
        default: {}
    },
    temptoken: {
        type: String,
        default: ""
    },
}, { timestamps: true })


// secure the password
userSchema.pre("save", async function () {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    try {
        const saltRound = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(user.password, saltRound);
        user.password = hash_password;
    } catch (error) {
        console.log(error);
        next(error);
    }
})

userSchema.methods.generateToken = async function () {
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email: this.email,
            isAdmin: this.isadmin
        },
            process.env.jwt_token,
            {
                expiresIn: "30d",
            }
        );
    } catch (error) {
        console.error(error);
    }
};


userSchema.methods.checkpassword = async function (pass) {
    try {
        return await bcrypt.compare(pass, this.password);
    } catch (error) {
        console.error(error);
    }
};

const user = mongoose.model("user", userSchema);
module.exports = user;