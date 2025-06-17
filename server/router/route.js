const express = require('express');
const app = express();
const router = express.Router();
const users = require('../controllers/user');
const admin = require('../controllers/admin');
const salary = require('../controllers/salary');
const attendance = require('../controllers/attandence');
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

router.route('/employeelist').get(authmiddlewre,adminmiddleware,admin.employeelist); 
router.route('/addemployee').post(authmiddlewre,adminmiddleware,upload.single('photo'),admin.addemployee); 
router.route('/updateemployee').post(authmiddlewre,adminmiddleware,upload.single('photo'),admin.updateemployee); 
router.route('/deleteemployee').post(authmiddlewre,adminmiddleware,admin.deleteemployee); 

router.route('/addsalary').post(authmiddlewre,adminmiddleware,salary.addsalary); 
router.route('/salaryfetch').get(authmiddlewre,adminmiddleware,salary.salaryfetch); 

router.route('/allAttandence').get(authmiddlewre,attendance.allAttandence); 
router.route('/webattandence').post(authmiddlewre,attendance.webattandence); 
router.route('/checkout').post(authmiddlewre,attendance.checkout); 
router.route('/checkin').post(authmiddlewre,attendance.checkin); 


module.exports = router;