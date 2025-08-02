const express = require('express');
const app = express();
const router = express.Router();
const users = require('../controllers/user');
const admin = require('../controllers/admin');
const salary = require('../controllers/salary');
const ledger = require("../controllers/ledger");
const attendance = require('../controllers/attandence');
const employee = require('../controllers/employee');
const holiday = require('../controllers/holiday');
const authmiddlewre = require('../middleware/auth_middleware');
const authorizeRoles = require('../middleware/Role_middleware')
const upload = require('../middleware/multer_middleware')
const checkPermission = require('../middleware/checkpermission');
const employeemiddlewre = require('../middleware/employee_middleware');

router.route('/').get(async (req, res) => {
  return res.status(200).json({
    msg: "Welcome to office Backend"
  })
});


router.route('/signin').post(users.userLogin);
// router.route('/signup').post(users.userRegister);

router.route('/departmentlist').get(authmiddlewre, authorizeRoles('admin'), admin.departmentlist);
router.route('/adddepartment').post(authmiddlewre, authorizeRoles('admin'), admin.addDepartment);
router.route('/updatedepartment').post(authmiddlewre, authorizeRoles('admin'), admin.updatedepartment);
router.route('/deletedepartment').post(authmiddlewre, authorizeRoles('admin'), admin.deletedepartment);
router.route('/firstfetch').get(authmiddlewre, authorizeRoles('admin'), admin.firstfetch);
router.route('/leavehandle').post(authmiddlewre, authorizeRoles('admin'), admin.leavehandle);
router.route('/addcompany').post(authmiddlewre, authorizeRoles('admin'), admin.addcompany);
router.route('/updateCompany').post(authmiddlewre, authorizeRoles('admin'),upload.single('logo'), admin.updateCompany);
router.route('/addBranch').post(authmiddlewre, authorizeRoles('admin'), admin.addBranch);
router.route('/editBranch').post(authmiddlewre, authorizeRoles('admin'), admin.editBranch);
router.route('/getemployee').get(authmiddlewre, authorizeRoles('admin'), admin.getemployee);
router.route('/updatepassword').post(authmiddlewre, authorizeRoles('admin'), admin.updatepassword);

router.route('/employeelist').get(authmiddlewre, authorizeRoles('admin'), admin.employeelist);
router.route('/addemployee').post(authmiddlewre, authorizeRoles('admin'), upload.single('photo'), admin.addemployee);
router.route('/updateemployee').post(authmiddlewre, checkPermission('canaddEmployee'), upload.single('photo'), admin.updateemployee);
router.route('/enrollFace').post(authmiddlewre, authorizeRoles('admin'), admin.enrollFace);
router.route('/deletefaceenroll').post(authmiddlewre, authorizeRoles('admin'), admin.deletefaceenroll);
router.route('/deleteemployee').post(authmiddlewre, authorizeRoles('admin'), admin.deleteemployee);

router.route('/addsalary').post(authmiddlewre, authorizeRoles('admin'), salary.addsalary);
router.route('/salaryfetch').get(authmiddlewre, authorizeRoles('admin'), salary.salaryfetch);

router.route('/allAttandence').get(authmiddlewre,authorizeRoles('admin'), attendance.allAttandence);
router.route('/editattandence').post(authmiddlewre, authorizeRoles('admin'), attendance.editattandence);
router.route('/webattandence').post(authmiddlewre,authorizeRoles('admin'), attendance.webattandence);
router.route('/bulkMarkAttendance').post(authmiddlewre,authorizeRoles('admin'), attendance.bulkMarkAttendance);
router.route('/checkout').post(authmiddlewre,authorizeRoles('admin'), attendance.checkout);
router.route('/checkin').post(authmiddlewre,authorizeRoles('admin'), attendance.checkin);
router.route('/facecheckin').post(authmiddlewre,authorizeRoles('admin'), attendance.facecheckin);
router.route('/facecheckout').post(authmiddlewre,authorizeRoles('admin'), attendance.facecheckout);
router.route('/employeeAttandence').get(attendance.employeeAttandence);
router.route('/deleteattandence').post(authmiddlewre,authorizeRoles('admin'),attendance.deleteattandence);

router.route('/addholiday').post(authmiddlewre, holiday.addholiday);
router.route('/deleteholiday').post(authmiddlewre, holiday.deleteholiday);
router.route('/updateholiday').post(authmiddlewre, holiday.updateholiday);
router.route('/getholidays').get(authmiddlewre, holiday.getholidays);

router.route('/addleave').post(authmiddlewre, employee.addleave);
router.route('/getleave').get(authmiddlewre, employee.getleave);
router.route('/fetchleave').get(authmiddlewre, employee.fetchleave);
router.route('/employeefetch').get(authmiddlewre, authorizeRoles('employee'), employeemiddlewre, employee.employeefetch);
router.route('/empFirstFetch').get(authmiddlewre, authorizeRoles('employee'), employee.employeefetch);


router.route('/superfirstfetch').post(authmiddlewre, employee.addleave);

router.route("/ledgerEntries")
  .get(authmiddlewre, authorizeRoles('admin'), ledger.ledgerEntries);
router.route("/ledger")
  .get(authmiddlewre, authorizeRoles('admin'), ledger.ledger);
router.route("/entries/:id")
  .get(authmiddlewre, authorizeRoles('admin'), ledger.Entries);

router.route("/ledger")
  .post(authmiddlewre, authorizeRoles('admin'),upload.single('image'), ledger.createLedger)

router.route("/ledger/:id")
  .put(authmiddlewre, authorizeRoles('admin'),upload.single('image'), ledger.updateLedger)
  .delete(authmiddlewre, authorizeRoles('admin'), ledger.deleteLedger);

router.route("/ledgerentry")
  .post(authmiddlewre, authorizeRoles('admin'), ledger.createEntry)

router.route("/ledgerentry/:id")
  .put(authmiddlewre, authorizeRoles('admin'), ledger.updateEntry)
  .delete(authmiddlewre, authorizeRoles('admin'), ledger.deleteEntry);


module.exports = router;