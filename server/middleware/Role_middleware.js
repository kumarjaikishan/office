const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // if (req.user.role == 'superadmin') {
    //   return next();
    // }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(401).json({ message: 'Role - Access Denied!' });
    }
    next();
  };
};

module.exports = authorizeRoles; 
