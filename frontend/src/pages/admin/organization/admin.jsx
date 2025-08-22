import React, { useEffect, useRef, useState } from "react";
import { MdEdit, MdDelete, MdOutlineModeEdit } from "react-icons/md";
import useImageUpload from "../../../utils/imageresizer";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosArrowDown } from "react-icons/io";
import { Avatar, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

// Permission labels
const PERMISSION_LABELS = {
    1: "Read",
    2: "Create",
    3: "Update",
    4: "Delete",
};

const AllPermissionNames = [
    "attandence", "branch", "department", "employee", "ledgerentry",
    "holiday", "leave", "ledger", "notification", "salary"];

// const adminPermission = Object.fromEntries(
//   AllPermissionNames.map((name) => [name, [1, 2, 3, 4]])
// );

const adminPermission = {
    attandence: [1, 2, 3, 4], // 1 = read, 2 =create, 3 =update, 4= delete
    branch: [1, 2, 3, 4],
    department: [1, 2, 3, 4],
    employee: [1, 2, 3, 4],
    ledgerentry: [1, 2, 3, 4],
    holiday: [1, 2, 3, 4],
    leave: [1, 3, 4],
    ledger: [1, 2, 3, 4],
    notification: [1, 2, 3, 4],
    salary: [1, 2, 3],
}

const managerPermission = {
    employee: [1, 2, 3],
    attandence: [1, 2, 3],
    department: [1, 2, 3],
    holiday: [1, 2],
    leave: [1, 3],
    ledger: [1, 2, 3, 4],
    ledgerentry: [1, 2, 3, 4],
    notification: [1, 2],
    salary: [1],
};

export default function SuperAdminDashboard() {
    const [admins, setAdmins] = useState([]);
    const [isload, setisload] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
        profileImage: null,
        profilePreview: "",
        permissions: { ...adminPermission },
    });

    useEffect(() => {
        fetech()
    }, [])
    const inputref = useRef(null);

    const { handleImage } = useImageUpload();
    const [editingIndex, setEditingIndex] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newModule, setNewModule] = useState("");
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
    };

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            role: "admin",
            profileImage: null,
            profilePreview: "",
            permissions: { ...adminPermission },
        });
        setNewModule("");
        setEditingIndex(null);
        setShowForm(false);
    };

    const handleSave = async () => {
        const newEntry = { ...form };
        console.log(form)
        //  return
        const formData = new FormData();

        try {
            const resizedFile = newEntry.profileImage
                ? await handleImage(300, newEntry.profileImage)
                : null;

            if (resizedFile) {
                formData.append("photo", resizedFile);
            }

            formData.append("name", newEntry.name);
            formData.append("email", newEntry.email);
            formData.append("role", newEntry.role);
            formData.append("password", newEntry.password);
            formData.append("permissions", JSON.stringify(newEntry.permissions));

            const token = localStorage.getItem("emstoken");
            setisload(true);

            const endpoint = editingIndex !== null
                ? `${import.meta.env.VITE_API_ADDRESS}editAdmin/${admins[editingIndex]._id}`
                : `${import.meta.env.VITE_API_ADDRESS}addAdmin`;

            const method = editingIndex !== null ? "post" : "post";

            const res = await axios[method](endpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(res.data.message, { autoClose: 1200 });
            console.log(res.data)
            resetForm();
            fetech(); // refresh list

        } catch (error) {
            console.error(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                toast.error("Something went wrong", { autoClose: 1200 });
            }
        } finally {
            setisload(false);
        }
    };


    const fetech = async () => {
        try {
            const token = localStorage.getItem("emstoken");
            // setisload(true);

            const res = await axios.get(
                `${import.meta.env.VITE_API_ADDRESS}getAdmin`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // toast.success(res.data.message, { autoClose: 1200 });
            console.log(res.data)
            setAdmins(res.data);
            // resetForm();
            // resetPhoto();
        } catch (error) {
            console.error(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                toast.error("Something went wrong", { autoClose: 1200 });
            }
        } finally {
            setisload(false);
        }
    }


    const handleEdit = (index) => {
        const current = admins[index];
        setForm({
            ...current,
            profilePreview: current.profileImage || "",
            profileImage: null, // Don't persist File object
        });
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

    const handleRoleChange = (role) => {
        const defaultPermissions = role === "admin"
            ? { ...adminPermission }
            : { ...managerPermission };
        setForm({
            ...form,
            role,
            permissions: defaultPermissions,
        });
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm((prev) => ({
            ...prev,
            profileImage: file,
            profilePreview: URL.createObjectURL(file),
        }));
    };

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

    const currentModules = Array.from(new Set([
        ...(form.role === "admin" ? AllPermissionNames : Object.keys(form.permissions)),
        ...Object.keys(form.permissions),
    ]));

    const availableModulesToAdd = AllPermissionNames.filter(
        (mod) => !currentModules.includes(mod)
    );

    return (
        <div className="p-1 w-full">
            {/* Admin List */}
            <div className="bg-white shadow-md rounded-lg p-2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Admin Management</h2>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        Add Admin
                    </button>
                </div>
                {admins.length === 0 ? (
                    <p className="text-gray-500">No admins added yet.</p>
                ) : (
                    <div className="space-y-3">
                        {admins.map((admin, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start border border-dashed p-2 rounded-md"
                            >
                                <div className="flex gap-4">
                                    <Avatar
                                        sx={{ width: 60, height: 60 }}
                                        alt={admin.name} src={admin?.profileImage}
                                    />

                                    <div>
                                        <p className="font-medium">{admin.name} ({admin.role})</p>
                                        <p className="text-sm text-gray-500">{admin.email}</p>

                                        {/* Toggle Button */}
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="text-blue-600 cursor-pointer text-sm mt-1 "
                                        >
                                            {expandedIndex === index ? "Hide Permissions" : `View Permissions `}
                                        </button>

                                        {/* Expandable Permissions */}
                                        {expandedIndex === index && (
                                            <div className="text-sm mt-2">
                                                <span className="font-semibold">Permissions:</span>

                                                <table className="table-auto border-collapse border border-gray-300 mt-2 text-xs w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Module</th>
                                                            {Object.values(PERMISSION_LABELS).map((label) => (
                                                                <th key={label} className="border border-gray-300 px-2 py-1">
                                                                    {label}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(admin.permissions).map(([module, levels]) => (
                                                            <tr key={module}>
                                                                <td className="border border-gray-300 px-2 py-1 font-semibold">
                                                                    {module}
                                                                </td>
                                                                {Object.keys(PERMISSION_LABELS).map((permKey) => {
                                                                    return <td
                                                                        key={permKey}
                                                                        className="border border-gray-300 px-2 py-1 text-center"
                                                                    >
                                                                        {levels.includes(Number(permKey)) ? "✅" : "-"}
                                                                    </td>
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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

            <Dialog open={showForm} onClose={() => setShowForm(false)}>
                <DialogTitle>
                    {editingIndex !== null ? "Edit Admin" : "Add Admin"}
                </DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-1 flex items-center gap-5 flex-col w-[500px]">
                        <div className="mt-1 items-center  w-fit relative">
                            <input style={{ display: 'none' }} type="file" onChange={handleProfileImageChange} ref={inputref} accept="image/*" name="" id="fileInput" />

                            <Avatar
                                sx={{ width: 70, height: 70 }}
                                alt={form.name} src={form.profilePreview} />

                            <span onClick={() => inputref.current.click()}
                                className="absolute -bottom-1 -right-1 rounded-full bg-teal-900 text-white p-1"
                            >
                                <MdOutlineModeEdit size={18} />
                            </span>
                        </div>
                        {/* <input
                            className="w-full border p-2 rounded"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        /> */}
                        <TextField fullWidth required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            label="Name" size="small"
                        />
                        {/* <input
                            className="w-full border p-2 rounded"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        /> */}
                        <TextField fullWidth required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            label="Email" size="small"
                            helperText="*Note - you can also use companyname as mail handler, e.g. xyz@companyname.com"
                        />
                        {/* <input
                            className="w-full border p-2 rounded"
                            placeholder="Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        /> */}
                        <TextField fullWidth required
                            value={form.password}
                            type="password"
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            label="Password" size="small"
                        />

                        {/* <div>
                            <label className="block mb-1 font-semibold">Profile Image</label>
                            <input type="file" accept="image/*" onChange={handleProfileImageChange} />
                            {form.profilePreview && (
                                <img
                                    src={form.profilePreview}
                                    alt="Preview"
                                    className="w-20 h-20 mt-2 rounded-full object-cover border"
                                />
                            )}
                        </div> */}


                        <div className="w-full">
                            <label className="font-semibold block mb-1">Role</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={form.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                            >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>

                        {/* Add Module (Manager only) */}
                        {form.role === "manager" && (
                            <div className="flex w-full items-center gap-2">
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

                        {/* Permissions Table */}
                        <div className="w-full">
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
                                                            className="h-5 w-5 cursor-pointer rounded-md border-2 border-gray-400 
                                                             checked:bg-teal-600 checked:border-teal-600 
                                                             focus:ring-2 focus:ring-teal-400 focus:outline-none 
                                                             transition duration-200 ease-in-out"
                                                            type="checkbox"
                                                            checked={form.permissions[module]?.includes(Number(level)) || false}
                                                            onChange={() => togglePermission(module, Number(level))}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
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
                </DialogActions>
            </Dialog>

        </div>
    );
}
