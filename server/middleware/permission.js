// config/permissions.js
const permissions = {
  superadmin: {
    canCreateCompany: true,
    canManageBranches: true,
    canManageUsers: true,
    canAssignManagers: true,
    canViewAllReports: true,
    canViewOwnBranchReports: true,
    canMarkSelfAttendance: true,
    canEditSelfProfile: true,
    canaddEmployee: true,
  },
  admin: {
    canCreateCompany: false,
    canManageBranches: true,
    canManageUsers: true,
    canAssignManagers: true,
    canViewAllReports: true,
    canViewOwnBranchReports: true,
    canMarkSelfAttendance: true,
    canEditSelfProfile: true,
    canaddEmployee: true,
  },
  manager: {
    canCreateCompany: false,
    canManageBranches: false,
    canManageUsers: false,
    canAssignManagers: false,
    canViewAllReports: false,
    canViewOwnBranchReports: true,
    canMarkSelfAttendance: true,
    canEditSelfProfile: true,
    canaddEmployee: true,
  },
  employee: {
    canCreateCompany: false,
    canManageBranches: false,
    canManageUsers: false,
    canAssignManagers: false,
    canViewAllReports: false,
    canViewOwnBranchReports: false,
    canMarkSelfAttendance: true,
    canEditSelfProfile: true,
    canaddEmployee: false,
  }
};

module.exports = permissions;
