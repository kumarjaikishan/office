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

router.route('/departmentlist').get(authmiddlewre, authorizeRoles('admin', 'manager'), admin.departmentlist);
router.route('/adddepartment').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("department", 2), admin.addDepartment);
router.route('/updatedepartment').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("department", 3), admin.updatedepartment);
router.route('/deletedepartment').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("department", 4), admin.deletedepartment);
router.route('/firstfetch').get(authmiddlewre, authorizeRoles('admin', 'manager'), admin.firstfetch);
router.route('/leavehandle').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("leave", 3), admin.leavehandle);
router.route('/addcompany').post(authmiddlewre, authorizeRoles('superadmin'), admin.addcompany);
router.route('/updateCompany').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('logo'), admin.updateCompany);
router.route('/addBranch').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("branch", 2), admin.addBranch);
router.route('/editBranch').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("branch", 3), admin.editBranch);
router.route('/deleteBranch').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("branch", 4), admin.deleteBranch);
router.route('/getemployee').get(authmiddlewre, authorizeRoles('admin', 'manager'), admin.getemployee);
router.route('/updatepassword').post(authmiddlewre, authorizeRoles('admin', 'manager'), admin.updatepassword);

router.route('/employeelist').get(authmiddlewre, authorizeRoles('admin', 'manager'), admin.employeelist);
router.route('/addemployee').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("employee", 2), upload.single('photo'), admin.addemployee);
router.route('/updateemployee').post(authmiddlewre, checkPermission("enrty", 2), checkPermission("employee", 3), upload.single('photo'), admin.updateemployee);
router.route('/deleteemployee').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("employee", 4), admin.deleteemployee);
router.route('/enrollFace').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 2), admin.enrollFace);
router.route('/deletefaceenroll').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 4), admin.deletefaceenroll);

router.route('/addsalary').post(authmiddlewre, authorizeRoles('admin', 'manager'), salary.addsalary);
router.route('/salaryfetch').get(authmiddlewre, authorizeRoles('admin', 'manager'), salary.salaryfetch);

router.route('/allAttandence').get(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.allAttandence);
router.route('/editattandence').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 3), attendance.editattandence);
router.route('/webattandence').post(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.webattandence);
router.route('/bulkMarkAttendance').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 2), attendance.bulkMarkAttendance);
router.route('/checkout').post(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.checkout);
router.route('/checkin').post(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.checkin);
router.route('/facecheckin').post(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.facecheckin);
router.route('/facecheckout').post(authmiddlewre, authorizeRoles('admin', 'manager'), attendance.facecheckout);
router.route('/employeeAttandence').get(authmiddlewre, attendance.employeeAttandence);
router.route('/deleteattandence').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 4), attendance.deleteattandence);

router.route('/getholidays').get(authmiddlewre, holiday.getholidays);
router.route('/addholiday').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 2), holiday.addholiday);
router.route('/updateholiday').post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("attandence", 3), holiday.updateholiday);
router.route('/deleteholiday').post(authmiddlewre, authorizeRoles('admine', 'manager'), checkPermission("attandence", 4), holiday.deleteholiday);

router.route('/addleave').post(authmiddlewre, employee.addleave);
router.route('/getleave').get(authmiddlewre, employee.getleave);
router.route('/fetchleave').get(authmiddlewre, employee.fetchleave);
router.route('/employeefetch').get(authmiddlewre, authorizeRoles('employee'), employeemiddlewre, employee.employeefetch);
router.route('/empFirstFetch').get(authmiddlewre, authorizeRoles('employee'), employee.employeefetch);

router.route('/addAdmin').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.addAdmin);
router.route('/getAdmin').get(authmiddlewre, authorizeRoles('superadmin'), admin.getAdmin);
router.route('/editAdmin/:id').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.editAdmin);


router.route('/superfirstfetch').post(authmiddlewre, employee.addleave);

router.route("/ledgerEntries") .get(authmiddlewre, authorizeRoles('admin', 'manager'), ledger.ledgerEntries);
router.route("/ledger") .get(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledger", 1), ledger.ledger);
router.route("/entries/:id") .get(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledgerentry", 1), ledger.Entries);

router.route("/ledger") .post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledger", 2), upload.single('image'), ledger.createLedger)

router.route("/ledger/:id")
  .put(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledger", 3), upload.single('image'), ledger.updateLedger)
  .delete(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledger", 4), ledger.deleteLedger);

router.route("/ledgerentry") .post(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledgerentry", 2), ledger.createEntry)

router.route("/ledgerentry/:id")
  .put(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledgerentry", 3), ledger.updateEntry)
  .delete(authmiddlewre, authorizeRoles('admin', 'manager'), checkPermission("ledgerentry", 4), ledger.deleteEntry);


module.exports = router;