const jwt = require('jsonwebtoken');

const authmiddlewre = async (req, res, next) => {
    const bearertoken = req.header('Authorization');
    if (!bearertoken) {
        return next({ status: 401, message: "Unauthorizes HTTP, token not provided" });
    }

    try {
        const token = bearertoken.replace("Bearer", "").trim();
        const verified = jwt.verify(token, process.env.JWT_Key);
        // console.log(verified);

        req.user = verified;
        req.userid = verified.userId;
        req.token = token;
        next();
    } catch (error) {
        // console.log(error.message);
         if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid Token' });
        }
        res.status(401).json({ message: error.message })
    }
}
module.exports = authmiddlewre;