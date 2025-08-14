// middleware/checkPermission.js
const permissions = require('./permission');
const usermodel = require('../models/user')

const legends =['Read','Create','Update','Delete'];

const checkPermission = (permissionName, key) => {
    return async (req, res, next) => {

        let userapply = await usermodel.findById(req.user.id);
        // console.log(Object.fromEntries(userapply.permissions))
        const userRole = req.user.role;
        // const userPermisson = req.user.permissions;
        const userPermisson =  Object.fromEntries(userapply?.permissions);
       
        if (userPermisson.hasOwnProperty(permissionName) && userPermisson[permissionName].includes(key)) {
          next();
        } else {
            return res.status(403).json({ message: `Access denied: missing ${permissionName} permission for Action:${legends[key-1]}` });
        }
    };
};

module.exports = checkPermission;