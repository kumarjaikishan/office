const usermodel = require('../models/user')
const redisClient = require('../utils/redis');

const legends = ['Read', 'Create', 'Update', 'Delete'];

// const checkPermission = (permissionName, key) => {
//     return async (req, res, next) => {

//         let userapply = await usermodel.findById(req.user.id);
//         // console.log(Object.fromEntries(userapply.permissions))
//         const userRole = req.user.role;
//         // const userPermisson = req.user.permissions;
//         const userPermisson =  Object.fromEntries(userapply?.permissions);

//         if (userPermisson.hasOwnProperty(permissionName) && userPermisson[permissionName].includes(key)) {
//           next();
//         } else {
//             return res.status(403).json({ message: `Access denied: missing ${permissionName} permission for Action:${legends[key-1]}` });
//         }
//     };
// };

// FOR IMPLEMENTING REDISS
const checkPermission = (permissionName, key) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            if (req.user.role == 'superadmin') {
                return next();
            }

            // 1. Try Redis cache first
            let cachedPermissions = await redisClient.get(`permissions:${userId}`);
            let userPermissions;

            if (cachedPermissions) {
                userPermissions = JSON.parse(cachedPermissions);
                // console.log("✅ Loaded permissions from Redis");
            } else {
                // 2. Fallback to Mongo
                // console.log("approcing to database")
                const userapply = await usermodel.findById(userId);
                userPermissions = Object.fromEntries(userapply?.permissions);

                await redisClient.setEx(`permissions:${userId}`, 60 * 60 * 24 * 15, JSON.stringify(userPermissions));
                // console.log("⚡ Permissions cached in Redis");
            }

            // 4. Check permission
            if (
                userPermissions.hasOwnProperty(permissionName) &&
                userPermissions[permissionName].includes(key)
            ) {
                return next();
            } else {
                return res.status(403).json({
                    message: `Access denied: missing ${permissionName} permission for Action:${legends[key - 1]}`
                });
            }
        } catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

module.exports = checkPermission;

