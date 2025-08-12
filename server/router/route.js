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

router.route('/departmentlist').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.departmentlist);
router.route('/adddepartment').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.addDepartment);
router.route('/updatedepartment').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.updatedepartment);
router.route('/deletedepartment').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.deletedepartment);
router.route('/firstfetch').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.firstfetch);
router.route('/leavehandle').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.leavehandle);
router.route('/addcompany').post(authmiddlewre, authorizeRoles('superadmin'), admin.addcompany);
router.route('/updateCompany').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('logo'), admin.updateCompany);
router.route('/addBranch').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.addBranch);
router.route('/editBranch').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.editBranch);
router.route('/getemployee').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.getemployee);
router.route('/updatepassword').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.updatepassword);

router.route('/employeelist').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.employeelist);
router.route('/addemployee').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), upload.single('photo'), admin.addemployee);
router.route('/updateemployee').post(authmiddlewre, checkPermission('canaddEmployee'), upload.single('photo'), admin.updateemployee);
router.route('/enrollFace').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.enrollFace);
router.route('/deletefaceenroll').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.deletefaceenroll);
router.route('/deleteemployee').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), admin.deleteemployee);

router.route('/addsalary').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), salary.addsalary);
router.route('/salaryfetch').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), salary.salaryfetch);

router.route('/allAttandence').get(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.allAttandence);
router.route('/editattandence').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.editattandence);
router.route('/webattandence').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.webattandence);
router.route('/bulkMarkAttendance').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.bulkMarkAttendance);
router.route('/checkout').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.checkout);
router.route('/checkin').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.checkin);
router.route('/facecheckin').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.facecheckin);
router.route('/facecheckout').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.facecheckout);
router.route('/employeeAttandence').get(attendance.employeeAttandence);
router.route('/deleteattandence').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), attendance.deleteattandence);

router.route('/addholiday').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), holiday.addholiday);
router.route('/deleteholiday').post(authmiddlewre, authorizeRoles('admine', 'superadmin'), holiday.deleteholiday);
router.route('/updateholiday').post(authmiddlewre, authorizeRoles('admin', 'superadmin'), holiday.updateholiday);
router.route('/getholidays').get(authmiddlewre, holiday.getholidays);

router.route('/addleave').post(authmiddlewre, employee.addleave);
router.route('/getleave').get(authmiddlewre, employee.getleave);
router.route('/fetchleave').get(authmiddlewre, employee.fetchleave);
router.route('/employeefetch').get(authmiddlewre, authorizeRoles('employee'), employeemiddlewre, employee.employeefetch);
router.route('/empFirstFetch').get(authmiddlewre, authorizeRoles('employee'), employee.employeefetch);

router.route('/addAdmin').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.addAdmin);
router.route('/getAdmin').get(authmiddlewre, authorizeRoles('superadmin'), admin.getAdmin);
router.route('/editAdmin/:id').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.editAdmin);


router.route('/superfirstfetch').post(authmiddlewre, employee.addleave);

router.route("/ledgerEntries")
  .get(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.ledgerEntries);
router.route("/ledger")
  .get(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.ledger);
router.route("/entries/:id")
  .get(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.Entries);

router.route("/ledger")
  .post(authmiddlewre, authorizeRoles('admin', 'superadmin'), upload.single('image'), ledger.createLedger)

router.route("/ledger/:id")
  .put(authmiddlewre, authorizeRoles('admin', 'superadmin'), upload.single('image'), ledger.updateLedger)
  .delete(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.deleteLedger);

router.route("/ledgerentry")
  .post(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.createEntry)

router.route("/ledgerentry/:id")
  .put(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.updateEntry)
  .delete(authmiddlewre, authorizeRoles('admin', 'superadmin'), ledger.deleteEntry);


module.exports = router;