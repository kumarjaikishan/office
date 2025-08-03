// config/permissions.js
const employeepermission = {
  attandence: [1], // 1 = read, 2 =write, 3 =update, 4= delete
  holiday: [1],
  leave: [1, 2],
  notification: [1],
  salary: [1],
};

module.exports = employeepermission;
