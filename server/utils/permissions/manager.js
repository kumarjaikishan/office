// config/permissions.js
const managerpermissions = {
  attandence: [1, 2, 3], // 1 = read, 2 =write, 3 =update, 4= delete
  branch: [1],
  department: [1, 2, 3],
  employee: [1, 2, 3],
  ledgerentry:[1,2,3,4],
  holiday: [1, 2],
  leave: [1, 2, 3],
  ledger: [1, 2, 3,4],
  notification: [1, 2],
  salary: [1],
};

module.exports = managerpermissions;
