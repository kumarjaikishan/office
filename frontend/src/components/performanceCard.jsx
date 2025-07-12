import React, { useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaSuitcase,
    FaTimesCircle,
    FaMobileAlt,
    FaChartBar,
    FaEnvelopeOpenText,
    FaUsers,
    FaUserClock,
    FaIdCard,
} from "react-icons/fa";

const EmployeeProfileCard = ({ user, attandence, employee, hell }) => {
    useEffect(() => {
        console.log(attandence)
    }, [attandence])

    const total = hell.present.length + hell.absent.length + hell.leave.length;

    const perc = {
        present: total ? Math.floor((hell.present.length / total) * 100) : 0,
        absent: total ? Math.floor((hell.absent.length / total) * 100) : 0,
        leave: total ? Math.floor((hell.leave.length / total) * 100) : 0,
    };

    const data = total
        ? [
            { id: 0, value: perc.present, color: 'teal', label: 'Present' },
            { id: 1, value: perc.leave, color: 'orange', label: 'Leave' },
            { id: 2, value: perc.absent, color: 'rgb(156 163 175)', label: 'Absent' },
        ]
        : [{ id: 0, value: 100, color: 'rgb(156 163 175)', label: 'No record' }];

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[200px] bg-[#e0e4e7] p-1 space-y-1 md:space-y-0 md:space-x-2">
            <div className="relative w-80 h-80 flex items-center justify-center z-2 rounded-full">
                <PieChart
                    series={[
                        {
                            innerRadius: 130,
                            outerRadius: 150,
                            data: data,
                            paddingAngle: 1,
                            cornerRadius: 5,
                        },
                    ]}
                    width={300}
                    height={300}
                    legend={{ hidden: true }}
                />

                <div className="absolute w-63 h-63 rounded-full overflow-hidden border-4 border-white">
                    <img
                        src={employee?.profileimage}
                        alt="Employee"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4 w-[550px]">
                <div className="attandencecarde">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaCalendarAlt /> Total Days</span>
                        <span className="font-bold text-gray-600">{total}</span>
                    </div>
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaCheckCircle /> Present</span>
                        <span className="font-bold text-gray-600">{hell?.present?.length} Days {perc.present ? `(${perc.present}%)` : ''}</span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-8">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaSuitcase /> Leave</span>
                        <span className="font-bold text-gray-600">{hell?.leave?.length}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaTimesCircle /> Absent</span>
                        <span className="font-bold text-gray-600">{hell?.absent?.length}</span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-12">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaMobileAlt /> Overtime</span>
                        <span className="font-bold text-gray-600">{hell?.overtime?.length || 0} {hell?.overtimemin > 0 && `(${hell?.overtimemin} min)`}</span>
                    </div>
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaChartBar /> Short Time</span>
                        {/* <span className="font-medium flex items-center gap-2 text-gray-800"><FaChartBar /> Short Attendance</span> */}
                        <span className="font-bold text-gray-600">{hell?.short?.length || 0} {hell?.shorttimemin > 0 && `(${hell?.shorttimemin} min)`}</span>
                    </div>
                </div>

                <div className="attandencecarde md:ml-8">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaEnvelopeOpenText /> Late Arrival</span>
                        <span className="font-bold text-gray-600">{hell?.latearrival?.length || 0}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaUsers /> Early Leave</span>
                        <span className="font-bold text-gray-600">{hell?.earlyLeave?.length || 0}</span>
                    </div>
                </div>

                <div className="attandencecarde">
                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaUserClock /> Early Arrival</span>
                        <span className="font-bold text-gray-600">{hell?.earlyarrival?.length || 0}</span>
                    </div>

                    <div className="flex w-full items-center justify-between neu text-gray-800 rounded-xl px-4 py-2 shadow">
                        <span className="font-medium flex items-center gap-2 text-gray-800"><FaIdCard /> Late Leave</span>
                        <span className="font-bold text-gray-600">{hell?.lateleave?.length || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileCard;
