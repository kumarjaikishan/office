import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, IconButton, TextField, MenuItem } from "@mui/material";
import { MdExpandLess, MdExpandMore, MdDelete, MdEdit } from "react-icons/md";
import Modalbox from "../../components/custommodal/Modalbox";
import { toast } from "react-toastify";

const Permission = () => {
    const [permission, setPermission] = useState([]);
    const [passmodal, setPassmodal] = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [form, setForm] = useState({
        roleid: "",
        modules: {},
    });
    // Final allowed modules (whitelist)
    // const AllPermissionNames = ["branch", "department", "employee", "attandence",
    //     "ledger", "ledger_entry", "holiday", "leave", "notification", "salary",
    // ];
    const [moduleToAdd, setModuleToAdd] = useState("");
    const [modules, setModules] = useState(null);
    const [newModule, setNewModule] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    
    const AllPermissionNames = modules;


    const PERMISSION_LABELS = {
        1: "Read", 2: "Create", 3: "Update", 4: "Delete",
    };

    const colors = ["teal", "blue", "yellow", "red"];

    const fetche = async () => {
        try {
            const token = localStorage.getItem("emstoken");
            const res = await axios.get(
                `${import.meta.env.VITE_API_ADDRESS}permission`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // console.log(res.data)
            setPermission(res.data?.permission);
            setModules(res.data.permissionnames?.AllPermissionNames);
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || "Error", { autoClose: 3000 });
        }
    };

    useEffect(() => {
        fetche();
    }, []);

    const toggleSection = (section) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const edite = (per) => {
        setSelectedRole(per);
        // clone only modules that are in the allowed list (defensive)
        const sanitized = Object.fromEntries(
            Object.entries(per.modules || {}).filter(([m]) =>
                AllPermissionNames?.includes(m)
            )
        );
        setForm({
            roleid: per._id,
            modules: { ...sanitized },
        });
        setPassmodal(true);
    };

    const togglePermission = (module, level) => {
        setForm((prev) => {
            const currentLevels = prev.modules[module] || [];
            const exists = currentLevels.includes(level);
            const newLevels = exists
                ? currentLevels.filter((l) => l !== level)
                : [...currentLevels, level].sort();

            return {
                ...prev,
                modules: {
                    ...prev.modules,
                    [module]: newLevels,
                },
            };
        });
    };

    // Only allow adding modules from whitelist and not already present
    const availableModules = AllPermissionNames?.filter(
        (m) => !Object.prototype.hasOwnProperty.call(form.modules, m)
    );

    const addModule = () => {
        if (!moduleToAdd) {
            toast.warn("Please select a module to add");
            return;
        }
        if (!AllPermissionNames?.includes(moduleToAdd)) {
            toast.warn("Invalid module (not allowed)");
            return;
        }
        if (form.modules[moduleToAdd]) {
            toast.warn("Module already exists");
            return;
        }
        setForm((prev) => ({
            ...prev,
            modules: {
                ...prev.modules,
                [moduleToAdd]: [],
            },
        }));
        setModuleToAdd("");
    };

    const removeModule = (module) => {
        const updated = { ...form.modules };
        delete updated[module];
        setForm((prev) => ({ ...prev, modules: updated }));
    };

    const saveedit = async () => {
        try {
            // Only keep allowed modules and remove empties
            const cleanedModules = Object.fromEntries(
                Object.entries(form.modules)
                    .filter(
                        ([m, levels]) => AllPermissionNames?.includes(m) && levels.length > 0
                    )
                    .map(([m, levels]) => [m, [...new Set(levels)].sort()])
            );

            const token = localStorage.getItem("emstoken");
            const res = await axios.put(
                `${import.meta.env.VITE_API_ADDRESS}permission/${form.roleid}`,
                { modules: cleanedModules },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Updated successfully", {
                autoClose: 2000,
            });
            setPassmodal(false);
            setSelectedRole(null);
            fetche();
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || "Update failed", {
                autoClose: 3000,
            });
        }
    };

    const cancel = () => {
        setPassmodal(false);
        setSelectedRole(null);
    };

    const addModulee = () => {
        if (!newModule.trim()) return;
        if (modules.includes(newModule)) return alert("Already exists!");
        setModules([...modules, newModule.trim()]);
        setNewModule("");
    };

    const deleteModule = (index) => {
        const updated = [...modules];
        updated.splice(index, 1);
        setModules(updated);
    };

    const saveEdit = (index) => {
        if (!editValue.trim()) return;
        const updated = [...modules];
        updated[index] = editValue.trim();
        setModules(updated);
        setEditingIndex(null);
        setEditValue("");
    };
    const saveModule = async () => {
        // console.log(modules)
        // return
        try {

            const token = localStorage.getItem("emstoken");
            const res = await axios.put(
                `${import.meta.env.VITE_API_ADDRESS}saveModule`,
                { modules },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message || "Updated successfully", {
                autoClose: 2000,
            });
            fetche();
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || "Update failed", {
                autoClose: 3000,
            });
        }
    }

    return (
        <div>
            <div >
                <div
                    className={`flex w-full my-2 justify-between items-center cursor-pointer bg-teal-100 px-4 py-2 rounded-md`}
                    onClick={() => toggleSection('module')}
                >
                    <span className="font-semibold text-[16px] md:text-lg text-left">
                        Permission Modules
                    </span>
                    {openSection === `module` ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>
                {openSection === `module` && <>
                    {/* Add new */}
                    <div className="flex gap-2 mb-4">
                        <TextField
                            size="small"
                            label="New Module"
                            value={newModule}
                            onChange={(e) => setNewModule(e.target.value)}
                        />
                        <Button variant="contained" onClick={addModulee}>
                            Add
                        </Button>

                        <Button variant="contained" onClick={saveModule}>
                            Save Module
                        </Button>
                    </div>

                    {/* List */}
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr>
                                <th className="border p-2 text-left">Module</th>
                                <th className="border p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map((mod, i) => (
                                <tr key={i}>
                                    <td className="border p-1 capitalize">
                                        {editingIndex === i ? (
                                            <TextField
                                                size="small"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                        ) : (
                                            mod
                                        )}
                                    </td>
                                    <td className="border p-1 text-center">
                                        {editingIndex === i ? (
                                            <Button variant="contained" size="small" onClick={() => saveEdit(i)}>
                                                Save
                                            </Button>
                                        ) : (
                                            <>
                                                <IconButton color="primary" onClick={() => { setEditingIndex(i); setEditValue(mod); }}>
                                                    <MdEdit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => deleteModule(i)}>
                                                    <MdDelete />
                                                </IconButton>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>}
            </div>

            <div className="flex flex-col">
                {permission?.map((per, ind) => (
                    <div key={per._id}>
                        <div
                            className={`flex w-full my-2 justify-between items-center cursor-pointer bg-${colors[ind % colors.length]
                                }-100 px-4 py-2 rounded-md`}
                            onClick={() => toggleSection(per.role)}
                        >
                            <span className="font-semibold text-[16px] md:text-lg text-left">
                                {per.role}
                            </span>
                            {openSection === `${per.role}` ? (
                                <MdExpandLess className="text-xl" />
                            ) : (
                                <MdExpandMore className="text-xl" />
                            )}
                        </div>

                        {openSection === `${per.role}` && (
                            <div className="p-1 rounded border-teal-300 border-2 border-dashed mt-2">
                                <div className="flex w-full justify-end">
                                    <Button variant="contained" onClick={() => edite(per)} sx={{ mr: 2 }}>
                                        Edit
                                    </Button>
                                </div>
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
                                        {Object.entries(per.modules).map(([module, levels]) => (
                                            <tr key={module}>
                                                <td className="border border-gray-300 px-2 py-1 font-semibold">
                                                    {module}
                                                </td>
                                                {Object.keys(PERMISSION_LABELS).map((permKey) => (
                                                    <td key={permKey} className="border border-gray-300 px-2 py-1 text-center">
                                                        {levels.includes(Number(permKey)) ? "✅" : "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modalbox open={passmodal} onClose={() => setPassmodal(false)}>
                <div className="membermodal">
                    <form action="">
                        <h2 className="font-bold text-lg mb-3">Edit Permission - {selectedRole?.role}</h2>
                        <span className="modalcontent">
                            {/* Add module from whitelist */}
                            <div className="flex gap-2 mb-3 items-center">
                                <TextField
                                    select
                                    size="small"
                                    label="Add Module"
                                    value={moduleToAdd}
                                    onChange={(e) => setModuleToAdd(e.target.value)}
                                    sx={{ minWidth: 200 }}
                                >
                                    {availableModules?.length === 0 ? (
                                        <MenuItem disabled value="">
                                            No modules available
                                        </MenuItem>
                                    ) : (
                                        availableModules?.map((m) => (
                                            <MenuItem key={m} value={m} className="capitalize">
                                                {m}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                                <Button variant="contained" onClick={addModule} disabled={!moduleToAdd}>
                                    Add
                                </Button>
                            </div>

                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full text-sm border">
                                    <thead>
                                        <tr>
                                            <th className="border p-2 text-left">Module</th>
                                            {Object.entries(PERMISSION_LABELS).map(([code, label]) => (
                                                <th key={code} className="border p-2 text-center">
                                                    {label}
                                                </th>
                                            ))}
                                            <th className="border p-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(form.modules)
                                            .sort(
                                                (a, b) =>
                                                    AllPermissionNames?.indexOf(a) - AllPermissionNames?.indexOf(b)
                                            )
                                            .map((module) => {
                                                const levels = form.modules[module] || [];
                                                return (
                                                    <tr key={module}>
                                                        <td className="border p-2 capitalize">{module}</td>
                                                        {Object.keys(PERMISSION_LABELS).map((level) => (
                                                            <td key={level} className="border text-center">
                                                                <input
                                                                    className="h-3 w-3 md:h-5 md:w-5 cursor-pointer"
                                                                    type="checkbox"
                                                                    checked={levels.includes(Number(level))}
                                                                    onChange={() => togglePermission(module, Number(level))}
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="border text-center">
                                                            <IconButton color="error" size="small" onClick={() => removeModule(module)}>
                                                                <MdDelete />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outlined" onClick={cancel}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={saveedit}>
                                    Save
                                </Button>
                            </div>
                        </span>
                    </form>
                </div>
            </Modalbox>
        </div >
    );
};

export default Permission;
