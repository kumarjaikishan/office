import React, { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

// Label mapping for readability
const PERMISSION_LABELS = {
  1: "Read",
  2: "Create",
  3: "Update",
  4: "Delete",
};

const AllPermissionNames = [
  "attandence", "branch", "company", "department", "employee", "enrty",
  "holiday", "leave", "ledger", "notification", "permission", "salary", "user"
];

// Default permissions for role
const MODULE_PERMISSIONS = {
  user: [1, 2, 3, 4],
  attandence: [1, 2, 3, 4],
  department: [1, 2, 3, 4],
  holiday: [1, 2, 3],
  leave: [1, 2, 3],
  salary: [1],
};

// Role presets
const ROLE_MODULES = {
  admin: AllPermissionNames,
  manager: ["attandence", "leave", "holiday"],
};

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    permissions: {},
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState("");

  const resetForm = () => {
    setForm({ name: "", email: "", role: "admin", permissions: {} });
    setNewModule("");
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...admins];
      updated[editingIndex] = form;
      setAdmins(updated);
    } else {
      setAdmins([...admins, form]);
    }
    resetForm();
  };

  const handleEdit = (index) => {
    setForm(admins[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = admins.filter((_, i) => i !== index);
    setAdmins(updated);
  };

  const togglePermission = (module, level) => {
    setForm((prev) => {
      const currentLevels = prev.permissions[module] || [];
      const exists = currentLevels.includes(level);
      const newLevels = exists
        ? currentLevels.filter((l) => l !== level)
        : [...currentLevels, level].sort();
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: newLevels,
        },
      };
    });
  };

  const currentModules = Array.from(
    new Set([
      ...(ROLE_MODULES[form.role] || []),
      ...Object.keys(form.permissions),
    ])
  );

  const availableModulesToAdd = AllPermissionNames.filter(
    (mod) => !currentModules.includes(mod)
  );

  const handleAddModule = () => {
    if (!newModule) return;
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [newModule]: [],
      },
    }));
    setNewModule("");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Admin List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Admin Management</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            Add Admin
          </button>
        </div>
        {admins.length === 0 ? (
          <p className="text-gray-500">No admins added yet.</p>
        ) : (
          <div className="space-y-4">
            {admins.map((admin, index) => (
              <div
                key={index}
                className="flex justify-between items-start border p-4 rounded-md"
              >
                <div>
                  <p className="font-medium">{admin.name}</p>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Role:</span> {admin.role}
                  </p>
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Permissions:</span>
                    {Object.entries(admin.permissions).map(([module, levels]) => (
                      <div key={module} className="ml-2 text-xs">
                        <strong>{module}:</strong>{" "}
                        {levels.map((l) => PERMISSION_LABELS[l]).join(", ")}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="p-2 border rounded hover:bg-gray-100"
                    onClick={() => handleEdit(index)}
                  >
                    <MdEdit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 border rounded text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(index)}
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingIndex !== null ? "Edit Admin" : "Add Admin"}
            </h2>
            <div className="space-y-4">
              <input
                className="w-full border p-2 rounded"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div>
                <label className="font-semibold block mb-1">Role</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setForm({
                      ...form,
                      role,
                      permissions: {},
                    });
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* Add Module Dropdown for Manager */}
              {form.role === "manager" && (
                <div className="flex items-center gap-2">
                  <select
                    className="border p-2 rounded w-full"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                  >
                    <option value="">-- Select Module to Add --</option>
                    {availableModulesToAdd.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Permission Table */}
              <div>
                <p className="font-semibold mb-2">Permissions</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="border p-2 text-left">Module</th>
                        {Object.entries(PERMISSION_LABELS).map(([code, label]) => (
                          <th key={code} className="border p-2 text-center">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentModules.map((module) => (
                        <tr key={module}>
                          <td className="border p-2 capitalize">{module}</td>
                          {Object.keys(PERMISSION_LABELS).map((level) => (
                            <td key={level} className="border text-center">
                              <input
                                type="checkbox"
                                checked={form.permissions[module]?.includes(Number(level)) || false}
                                onChange={() =>
                                  togglePermission(module, Number(level))
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSave}
                >
                  {editingIndex !== null ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
