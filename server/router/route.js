const express = require('express');
const app = express();
const router = express.Router();
const users = require('../controllers/user');
const admin = require('../controllers/admin');
const salary = require('../controllers/salary');
const ledger = require("../controllers/ledger");
const attendance = require('../controllers/attandence');
const employee = require('../controllers/employee');
const developer = require('../controllers/developer');
const holiday = require('../controllers/holiday');
const authmiddlewre = require('../middleware/auth_middleware');
const authorizeRoles = require('../middleware/Role_middleware')
const upload = require('../middleware/multer_middleware')
const checkPermission = require('../middleware/checkpermission');
const checkpermissionchange = require('../middleware/checkpermissionchange');
const employeemiddlewre = require('../middleware/employee_middleware');

router.route('/').get(async (req, res) => {
  return res.status(200).json({
    msg: "Welcome to office Backend"
  })
});

router.route('/jwtcheck').get(authmiddlewre, (req, res) => {
  res.status(201).json({
    message: "ok"
  })
});

router.route('/signin').post(users.userLogin);
router.route('/resetrequest').get(authmiddlewre,authorizeRoles('superadmin'),users.passreset);  
router.route('/setpassword').post(users.setpassword);   
// router.route('/signup').post(users.userRegister);

router.route('/departmentlist').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), admin.departmentlist);
router.route('/adddepartment').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("department", 2), admin.addDepartment);
router.route('/updatedepartment').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("department", 3), admin.updatedepartment);
router.route('/deletedepartment').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("department", 4), admin.deletedepartment);
router.route('/firstfetch').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), admin.firstfetch);
router.route('/leavehandle').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("leave", 3), admin.leavehandle);
// router.route('/addcompany').post(authmiddlewre, authorizeRoles('superadmin','superadmin'), admin.addcompany);
router.route('/updateCompany').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('logo'), admin.updateCompany);
router.route('/addBranch').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("branch", 2), admin.addBranch);
router.route('/editBranch').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("branch", 3), admin.editBranch);
router.route('/deleteBranch').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("branch", 4), admin.deleteBranch);
router.route('/getemployee').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), admin.getemployee);
router.route('/updatepassword').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), admin.updatepassword);

router.route('/employeelist').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), admin.employeelist);
router.route('/addemployee').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("employee", 2), upload.single('photo'), admin.addemployee);
router.route('/updateemployee').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("employee", 3), upload.single('photo'), admin.updateemployee);
router.route('/deleteemployee').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("employee", 4), admin.deleteemployee);
router.route('/enrollFace').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 2), admin.enrollFace);
router.route('/deletefaceenroll').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 4), admin.deletefaceenroll);

router.route('/addsalary').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), salary.addsalary);
router.route('/salaryfetch').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), salary.salaryfetch);

router.route('/allAttandence').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), attendance.allAttandence);
router.route('/editattandence').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 3), attendance.editattandence);
router.route('/webattandence').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), attendance.webattandence);
router.route('/bulkMarkAttendance').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 2), attendance.bulkMarkAttendance);
router.route('/checkout').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 2), attendance.checkout);
router.route('/checkin').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 2), attendance.checkin);
router.route('/facecheckin').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), attendance.facecheckin);
router.route('/facecheckout').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), attendance.facecheckout);
router.route('/employeeAttandence').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'),checkPermission("attandence", 1), attendance.employeeAttandence);
router.route('/deleteattandence').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("attandence", 4), attendance.deleteattandence);

router.route('/getholidays').get(authmiddlewre, holiday.getholidays);
router.route('/addholiday').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("holiday", 2), holiday.addholiday);
router.route('/updateholiday').post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("holiday", 3), holiday.updateholiday);
router.route('/deleteholiday').post(authmiddlewre, authorizeRoles('superadmin','admine', 'manager'), checkPermission("holiday", 4), holiday.deleteholiday);

router.route('/addleave').post(authmiddlewre, authorizeRoles('employee'), employee.addleave);
router.route('/getleave').get(authmiddlewre, employee.getleave);
router.route('/fetchleave').get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("leave", 1), employee.fetchleave);
router.route('/employeefetch').get(authmiddlewre, authorizeRoles('employee'), employeemiddlewre, employee.employeefetch);
router.route('/empFirstFetch').get(authmiddlewre, authorizeRoles('employee'), employee.employeefetch);
router.route('/updatenotification').get(authmiddlewre, employee.updatenotification);

router.route('/addAdmin').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.addAdmin);
router.route('/getAdmin').get(authmiddlewre, authorizeRoles('superadmin'), admin.getAdmin);
router.route('/editAdmin/:id').post(authmiddlewre, authorizeRoles('superadmin'), upload.single('photo'), admin.editAdmin);
router.route('/deleteAdmin/:id').delete(authmiddlewre, authorizeRoles('superadmin'), admin.deleteAdmin);

router.route('/developerfetch').get(authmiddlewre, authorizeRoles('developer'), developer.allUser);
router.route('/User').post(authmiddlewre, authorizeRoles('developer'), developer.addUser)
router.route('/User/:id')
  .put(authmiddlewre, authorizeRoles('developer'), developer.editUser)
  .delete(authmiddlewre, authorizeRoles('developer'), developer.deleteUser);

// router.route('/User').get(developer.adddefaultpermission)
// router.route('/Userper').get(developer.getdefaultpermission)
router.route('/saveModule').put(authmiddlewre, authorizeRoles('developer'), developer.saveModule)
router.route('/permission').get(authmiddlewre, authorizeRoles('developer'), developer.getdefaultpermission)
router.route('/permission/:id')
  .put(authmiddlewre, authorizeRoles('developer'), developer.updatedefaultpermission)


router.route('/superfirstfetch').post(authmiddlewre, employee.addleave);

router.route("/ledgerEntries").get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), ledger.ledgerEntries);
router.route("/ledger").get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger", 1), ledger.ledger);
router.route("/entries/:id").get(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger_entry", 1), ledger.Entries);

router.route("/ledger").post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger", 2), upload.single('image'), ledger.createLedger)

router.route("/ledger/:id")
  .put(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger", 3), upload.single('image'), ledger.updateLedger)
  .delete(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger", 4), ledger.deleteLedger);

router.route("/ledgerentry").post(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger_entry", 2), ledger.createEntry)

router.route("/ledgerentry/:id")
  .put(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger_entry", 3), ledger.updateEntry)
  .delete(authmiddlewre, authorizeRoles('superadmin','admin', 'manager'), checkPermission("ledger_entry", 4), ledger.deleteEntry);


module.exports = router;