const express = require('express');
const app = express();
const router = express.Router();
const users = require('../controllers/user');
const admin = require('../controllers/admin');
const salary = require('../controllers/salary');
const attendance = require('../controllers/attandence');
const employee = require('../controllers/employee');
const holiday = require('../controllers/holiday');
const authmiddlewre = require('../middleware/auth_middleware');
const adminmiddleware = require('../middleware/isadmin_middleware');
const upload = require('../middleware/multer_middleware')


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
router.route('/firstfetch').get(authmiddlewre,adminmiddleware,admin.firstfetch); 
router.route('/leavehandle').post(authmiddlewre,adminmiddleware,admin.leavehandle); 
router.route('/setsetting').post(authmiddlewre,adminmiddleware,admin.setsetting); 
router.route('/addcompany').post(authmiddlewre,adminmiddleware,admin.addcompany); 
router.route('/updateCompany').post(authmiddlewre,adminmiddleware,admin.updateCompany); 
router.route('/addBranch').post(authmiddlewre,adminmiddleware,admin.addBranch); 
router.route('/editBranch').post(authmiddlewre,adminmiddleware,admin.editBranch); 
router.route('/getsetting').get(authmiddlewre,adminmiddleware,admin.getsetting); 
router.route('/getemployee').get(authmiddlewre,adminmiddleware,admin.getemployee); 
router.route('/updatepassword').post(authmiddlewre,adminmiddleware,admin.updatepassword); 

router.route('/employeelist').get(authmiddlewre,adminmiddleware,admin.employeelist); 
router.route('/addemployee').post(authmiddlewre,adminmiddleware,upload.single('photo'),admin.addemployee); 
router.route('/updateemployee').post(authmiddlewre,adminmiddleware,upload.single('photo'),admin.updateemployee); 
router.route('/deleteemployee').post(authmiddlewre,adminmiddleware,admin.deleteemployee); 

router.route('/addsalary').post(authmiddlewre,adminmiddleware,salary.addsalary); 
router.route('/salaryfetch').get(authmiddlewre,adminmiddleware,salary.salaryfetch); 

router.route('/allAttandence').get(authmiddlewre,attendance.allAttandence); 
router.route('/editattandence').post(authmiddlewre,attendance.editattandence); 
router.route('/webattandence').post(authmiddlewre,attendance.webattandence); 
router.route('/checkout').post(authmiddlewre,attendance.checkout); 
router.route('/checkin').post(authmiddlewre,attendance.checkin); 
router.route('/employeeAttandence').get(attendance.employeeAttandence);
router.route('/deleteattandence').post(attendance.deleteattandence);

router.route('/addholiday').post(authmiddlewre,holiday.addholiday); 
router.route('/deleteholiday').post(authmiddlewre,holiday.deleteholiday); 
router.route('/updateholiday').post(authmiddlewre,holiday.updateholiday); 
router.route('/getholidays').get(authmiddlewre,holiday.getholidays); 

router.route('/addleave').post(authmiddlewre,employee.addleave); 
router.route('/getleave').get(authmiddlewre,employee.getleave); 
router.route('/fetchleave').get(authmiddlewre,employee.fetchleave); 
router.route('/employeefetch').get(authmiddlewre,employee.employeefetch); 


module.exports = router;