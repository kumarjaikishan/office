import { FaUser, FaEnvelope } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Avatar } from "@mui/material";

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

  useEffect(() => {
    if (profile) setprofile(profile);
  }, [profile]);

  return (
    <div className="p-1 md:p-4">
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
        <div className="w-full mx-auto bg-white overflow-auto shadow rounded-lg p-1 md:p-4">
          <div className=" flex gap-3 justify-start md:justify-start">
            {/* Avatar container */}
            <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-full border-2 border-teal-500 border-dashed p-[2px] flex items-center justify-center">
              <Avatar
                sx={{ width: 72, height: 72 }}
                alt={profilee?.name}
                src={profilee?.profileImage}
              />
            </div>

            {/* Details */}
            <div className="">
              <h3 className="text-xl capitalize font-bold text-gray-800 break-words">
                {profilee?.name}
              </h3>
              <p className="text-sm text-gray-600">{profilee?.role}</p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2 break-words">
                  <FaEnvelope className="text-gray-500" />{" "}
                  {profilee?.email || "N/A"}
                </div>
              </div>

            </div>
          </div>

          <div>
            {/* Toggle Permissions */}
            {profilee?.role !== "superadmin" && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 text-sm mt-3 cursor-pointer hover:text-blue-800"
              >
                {expanded ? "Hide Permissions" : "View Permissions"}
              </button>
            )}

            {/* Permissions Table */}
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
        </div>
      )}
    </div>

  );
};

export default AdminManagerProfile;
