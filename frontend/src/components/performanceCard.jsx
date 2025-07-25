import { useEffect, useMemo } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaSuitcase,
    FaUserSlash,
    FaClock,
    FaCompressAlt,
    FaSignInAlt,
    FaSignOutAlt,
    FaArrowCircleLeft,
    FaArrowCircleRight,
} from "react-icons/fa";
import { Tooltip } from "@mui/material";

const EmployeeProfileCard = ({ user, attandence, employee, hell }) => {
    useEffect(() => {
        // console.log(attandence)
    }, [attandence]);

    const total =
        (hell?.present?.length || 0) +
        (hell?.absent?.length || 0) +
        (hell?.leave?.length || 0);

    const perc = useMemo(() => {
        return {
            present: total ? Math.floor((hell?.present?.length / total) * 100) : 0,
            absent: total ? Math.floor((hell?.absent?.length / total) * 100) : 0,
            leave: total ? Math.floor((hell?.leave?.length / total) * 100) : 0,
        };
    }, [hell, total]);

    const data = total
        ? [
            { id: 0, value: perc.present, color: "teal", label: "Present" },
            { id: 1, value: perc.leave, color: "orange", label: "Leave" },
            { id: 2, value: perc.absent, color: "rgb(156 163 175)", label: "Absent" },
        ]
        : [{ id: 0, value: 100, color: "rgb(156 163 175)", label: "No record" }];

    const pieChartSize = { width: 300, height: 300 };
    const pieRadius = { innerRadius: 130, outerRadius: 150 };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[200px] bg-[#e0e4e7] p-1 space-y-1 md:space-y-0 md:space-x-2">
            <div className="relative w-80 h-80 flex items-center justify-center z-2 rounded-full">
                <PieChart
                    series={[
                        {
                            innerRadius: pieRadius.innerRadius,
                            outerRadius: pieRadius.outerRadius,
                            data,
                            paddingAngle: 1,
                            cornerRadius: 5,
                        },
                    ]}
                    width={pieChartSize.width}
                    height={pieChartSize.height}
                    legend={{ hidden: true }} // ensure version supports this
                />

                <div className="absolute w-63 h-63 rounded-full overflow-hidden border-4 border-white">
                    <img
                        src={employee?.profileimage || "/default-avatar.png"}
                        alt={employee?.name || "Employee"}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4 w-[550px]">
                <div className="attandencecarde">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaCalendarAlt /> Total Days
                        </span>
                        <span className="font-bold text-gray-600">{total}</span>
                    </div>
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaCheckCircle /> Present
                        </span>
                        <span className="font-bold text-gray-600">
                            {hell?.present?.length || 0} Days{" "}
                            {perc.present ? `(${perc.present}%)` : ""}
                        </span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-8">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaSuitcase /> Leave
                        </span>
                        <span className="font-bold text-gray-600">{hell?.leave?.length || 0}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaUserSlash /> Absent
                        </span>
                        <span className="font-bold text-gray-600">{hell?.absent?.length || 0}</span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-12">
                    <Tooltip
                        placement="top"
                        enterDelay={800}
                        arrow
                        title={
                            <div className="flex gap-1 flex-col text-white">
                                <span className="flex w-full"> <span className="block w-[70px] ">Basic salary </span> <span> : {employee?.salary} ₹ </span></span>
                                <span className="flex w-full"> <span className="block w-[70px] ">Net Overtime </span> <span> : {(hell?.overtimemin || 0) - (hell?.shorttimemin || 0)} min </span></span>
                                <span className="flex w-full"> <span className="block w-[70px] ">Payment </span> <span> : {hell?.overtimesalary || 0} ₹</span></span>
                            </div>
                        }
                    >
                        <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow cursor-help">
                            <span className="font-medium flex items-center gap-2 text-gray-800">
                                <FaClock /> Overtime
                            </span>
                            <span className="font-bold text-gray-600">
                                {hell?.overtime?.length || 0}{" "}
                                {hell?.overtimemin > 0 && `(${hell?.overtimemin} min)`}
                            </span>
                        </div>
                    </Tooltip>
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaCompressAlt /> Short Time
                        </span>
                        <span className="font-bold text-gray-600">
                            {hell?.short?.length || 0}{" "}
                            {hell?.shorttimemin > 0 && `(${hell?.shorttimemin} min)`}
                        </span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-8">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaSignInAlt /> Late Arrival
                        </span>
                        <span className="font-bold text-gray-600">{hell?.latearrival?.length || 0}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaSignOutAlt /> Early Leave
                        </span>
                        <span className="font-bold text-gray-600">{hell?.earlyLeave?.length || 0}</span>
                    </div>
                </div>

                <div className="attandencecarde">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaArrowCircleLeft /> Early Arrival
                        </span>
                        <span className="font-bold text-gray-600">{hell?.earlyarrival?.length || 0}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800">
                            <FaArrowCircleRight /> Late Leave
                        </span>
                        <span className="font-bold text-gray-600">{hell?.lateleave?.length || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileCard;
