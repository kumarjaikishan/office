const user = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addtoqueue } = require('../utils/axiosRequest');

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
            role: isUser.role,
            profileImage:isUser.profileImage,
            email:isUser.email
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

const passreset = async (req, res, next) => {
  try {
    const temptoken = await random(20);
    const query = await user.findByIdAndUpdate(req.user.id, { temptoken: temptoken });
    if (!query) {
      return next({ status: 400, message: "UserId is Not Valid" });
    }
    const msg = `Hi <b>${query.name}</b>,
    <br>
    This mail is regards to your password reset request. 
    <br><br>
    <a href="https://office.battlefiesta.in/resetpassword/${temptoken}" style="display: inline-block; padding: 4px 20px; background-color: #007bff; color: #fff; text-decoration: none; letter-spacing: 1px;; border-radius: 5px;">Reset Password</a>
    `
    // await sendemail(req.user.email, 'Password Reset', msg);
    // await addJobToQueue(req.user.email, 'Password Reset || BattleFiesta', msg)
    await addtoqueue(req.user.email, 'Password Reset || BattleFiesta', msg)

    return res.status(200).json({
      message: 'Email sent',
      extramessage: `Email sent successfully to ${req.user.email}, Kindly check inbox or spam to proceed further. Thankyou`
    })
  } catch (error) {
    console.log(error);
    return next({ status: 500, message: error });
  }
}

const setpassword = async (req, res, next) => {
  const token = req.query.token;
  const password = req.body.password;
  try {
    const query = await user.findOne({ temptoken: token });

    if (!query) {
      return next({ status: 400, message: 'This link has been Expired' });
    }

    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, saltRound);
    const passupdated = await user.updateOne({ _id: query._id }, { password: hash_password, temptoken: '' })

    if (!passupdated) {
      return next({ status: 400, message: 'something went wrong' });
    }
    return res.status(200).json({
      message: 'Password Updated'
    })
  } catch (error) {
    console.log(error);
    return next({ status: 500, message: error });
  }
}

const random = async (len) => {
  const rand = 'abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * rand.length);
    result += rand[randomIndex];
  }
  return result;
};

module.exports = { userRegister, userLogin,passreset,setpassword };