import { FaEnvelope } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { MdExpandLess, MdExpandMore, MdOutlineModeEdit } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, TextField } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import swal from "sweetalert";
import useImageUpload from "../../utils/imageresizer";
import { FirstFetch } from "../../../store/userSlice";
import Modalbox from "../../components/custommodal/Modalbox";

const PERMISSION_LABELS = {
  1: "Read",
  2: "Write",
  3: "Update",
  4: "Delete",
};

const AdminManagerProfile = () => {
  const [isload, setisload] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { profile } = useSelector((state) => state.user);
  const [profilee, setprofile] = useState(null);
  const [isLoading, setisloading] = useState(false);
  const { handleImage } = useImageUpload();
  const dispatch = useDispatch();
  const [EditOpen, setEditOpen] = useState(false);
  const [name, setname] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    // console.log(profile)
    if (profile) setprofile(profile);
  }, [profile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setprofile((prev) => ({ ...prev, profileImage: previewUrl }));
  };

  const resetpassword = async () => {
    let id;
    try {
      setisloading(true);
      id = toast.loading("Please wait...");
      const token = localStorage.getItem("emstoken");

      const res = await axios.get(
        `${import.meta.env.VITE_API_ADDRESS}resetrequest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setisloading(false);
      swal({ title: res.data.extramessage, icon: "success" });

      toast.update(id, {
        render: res.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2100,
      });
    } catch (error) {
      setisloading(false);
      toast.update(id, {
        render: error.response?.data?.message || error.message,
        type: "warn",
        isLoading: false,
        autoClose: 2200,
      });
    }
  };
  const handlesave = async () => {
    try {
      setisloading(true);
      const token = localStorage.getItem("emstoken");

      const formData = new FormData();
      formData.append("name", name);

      if (selectedFile) {
        const resizedFile = await handleImage(200, selectedFile); // resize if needed
        formData.append("profileImage", resizedFile);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_ADDRESS}update-profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data.message);
      dispatch(FirstFetch()); // Refresh profile
      setSelectedFile(null);
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setisloading(false);
    }
  };

  return (
    <div className="p-0 md:p-4">
      {isload ? (
        <div className="w-full h-[300px] flex gap-5 flex-col justify-center items-center overflow-auto bg-white">
          <div className="relative">
            <GoGear
              className="animate-spin"
              style={{ animationDuration: "2.5s" }}
              size={50}
              color="teal"
            />
            <GoGear
              className="absolute -bottom-4 left-0 animate-spin"
              style={{ animationDuration: "3s" }}
              size={20}
              color="teal"
            />
          </div>
          <p className="text-teal-600">loading...</p>
        </div>
      ) : (
        <div className="w-full mx-auto bg-white overflow-auto shadow rounded-lg p-1 py-2 md:p-4">
          <div className="flex gap-3 items-start">
            {/* Avatar with edit overlay */}
            <div className="relative">
              <Avatar
                sx={{ width: 72, height: 72 }}
                alt={profilee?.name}
                src={profilee?.profileImage}
              />
            </div>

            {/* Details */}
            <div>
              <h3 className="text-xl capitalize font-bold text-gray-800 break-words">
                {profilee?.name}
              </h3>
              <p className="text-sm text-gray-600">{profilee?.role}</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2 break-words">
                  <FaEnvelope className="text-gray-500" />
                  {profilee?.email || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions for non-superadmin/developer */}
          {profile?.role !== "superadmin" && profile?.role !== "developer" && (
            <div className="mt-2">
              <div
                className="flex justify-between items-center cursor-pointer bg-teal-100 px-4 py-1 md:py-2 rounded-md"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="font-semibold text-[16px] md:text-lg text-left">
                  {expanded ? "Hide Permissions" : "View Permissions"}
                </span>
                {expanded ? (
                  <MdExpandLess className="text-xl" />
                ) : (
                  <MdExpandMore className="text-xl" />
                )}
              </div>
              {expanded && (
                <div className="text-sm mt-3 overflow-x-auto">
                  <span className="font-semibold">Permissions:</span>
                  <table className="table-auto border-collapse border border-gray-300 mt-2 text-xs w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-left">
                          Module
                        </th>
                        {Object.values(PERMISSION_LABELS).map((label) => (
                          <th
                            key={label}
                            className="border border-gray-300 px-2 py-1"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(profilee?.permissions || {}).map(
                        ([module, levels]) => (
                          <tr key={module}>
                            <td className="border border-gray-300 px-2 py-1 font-semibold">
                              {module}
                            </td>
                            {Object.keys(PERMISSION_LABELS).map((permKey) => (
                              <td
                                key={permKey}
                                className="border border-gray-300 px-2 py-1 text-center"
                              >
                                {levels.includes(Number(permKey)) ? "✅" : "-"}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reset password for superadmin */}
          {profile?.role === "superadmin" && (
            <div className="my-2 flex flex-wrap gap-2">
              <Button

                onClick={() => { setname(profilee?.name); setEditOpen(true) }}
                disabled={isLoading}
                title="Send Password Reset Link"
                variant="contained"
                className="w-full md:w-fit"
              >
                Edit profile
              </Button>

              <Button
                onClick={resetpassword}
                disabled={isLoading}
                title="Send Password Reset Link"
                variant="outlined"
                className="w-full md:w-fit"
              >
                Send Password Reset Link
              </Button>
            </div>
          )}
        </div>
      )}

      <Modalbox open={EditOpen} onClose={() => {
        setEditOpen(false);
      }}>
        <div className="membermodal w-[300px]">
          <div className="whole" >
            <div className="modalhead">Edit Profile</div>
            <span className="modalcontent ">
              <TextField
                autoFocus
                size="small"
                fullWidth
                margin="dense"
                label="Ledger Name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />

              {/* Avatar + file input */}
              <div className=" flex justify-center">
                <div className="relative ">
                  <Avatar
                    sx={{ width: 72, height: 72 }}
                    alt={profilee?.name}
                    src={profilee?.profileImage}
                  />
                  <input
                    type="file"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                  <span
                    onClick={() => inputRef.current.click()}
                    className="absolute -bottom-1 -right-1 rounded-full bg-teal-900 text-white p-1 cursor-pointer"
                  >
                    <MdOutlineModeEdit size={18} />
                  </span>
                </div>
              </div>


            </span>
            <div className="modalfooter">
              <Button variant="outlined" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handlesave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modalbox>
    </div>
  );
};

export default AdminManagerProfile;
