const express = require('express');
const app = express();
const router = express.Router();
const users = require('../controllers/user');
const admin = require('../controllers/admin');
const authmiddlewre = require('../middleware/auth_middleware');
const adminmiddleware = require('../middleware/isadmin_middleware');


router.route('/').get(async (req, res) => {
  return res.status(200).json({
    msg: "Welcome to Battlefiesta Backend"
  })
}); 


router.route('/signin').post(users.userLogin); 
router.route('/signup').post(users.userRegister); 

router.route('/departmentlist').get(authmiddlewre,adminmiddleware,admin.departmentlist); 
router.route('/adddepartment').post(authmiddlewre,adminmiddleware,admin.addDepartment); 
router.route('/updatedepartment').post(authmiddlewre,adminmiddleware,admin.updatedepartment); 
router.route('/deletedepartment').post(authmiddlewre,adminmiddleware,admin.deletedepartment); 

router.route('/employeelist').get(authmiddlewre,adminmiddleware,admin.employeelist); 
router.route('/addemployee').post(authmiddlewre,adminmiddleware,admin.addemployee); 
router.route('/updateemployee').post(authmiddlewre,adminmiddleware,admin.updateemployee); 
router.route('/deleteemployee').post(authmiddlewre,adminmiddleware,admin.deleteemployee); 


module.exports = router;