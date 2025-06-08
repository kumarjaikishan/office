const adminmiddleware = async (req, res, next) => {
    // console.log('admin check',req.user);
    if(!req.user.role=="admin"){
        return next({ status: 403, message: "Forbidden: You are not an Admin" });
    }else{
        next();
    }
}

module.exports = adminmiddleware;