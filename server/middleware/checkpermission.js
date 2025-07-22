// middleware/checkPermission.js
const permissions = require('./permission');

const checkPermission = (actionKey) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!permissions[userRole] || !permissions[userRole][actionKey]) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = checkPermission;