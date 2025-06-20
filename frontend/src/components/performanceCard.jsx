import React, { useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const EmployeeProfileCard = ({ user, attandence,employee, hell }) => {
    useEffect(() => {
        // console.log(user)
    }, [])
    const total = hell.present.length +hell.absent.length+hell.leave.length;
    // const attendancePercent = 95;
    const perc = {
        present : Math.floor((hell.present.length / total)*100),
        absent : Math.floor((hell.absent.length / total)*100),
        leave : Math.floor((hell.leave.length / total)*100)
    };
     const data = [
        { id: 0, value: perc.present, color: 'teal',  },
        { id: 1, value: perc.leave, color: 'orange',  },
        { id: 2, value: perc.absent, color: '#e5e7eb',  },
    ];

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[200px] bg-gray-100 p-1 space-y-1 md:space-y-0 md:space-x-2">
           <div className="relative w-80 h-80 flex items-center justify-center z-2 bg-gray-100 rounded-full ">
                <PieChart
                    series={[
                        {
                            innerRadius: 130,
                            outerRadius: 150,
                            data:data,
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

            {/* Right: Info Cards */}
            <div className="flex flex-col gap-4 w-[550px]">
                <div className="w-full flex justify-center items-center gap-5 relative before:absolute before:top-1/2 before:-left-1/2 before:w-1/2 before:h-0.5 before:bg-gray-400 before:content-['']">
                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-yellow-300 to-yellow-400 text-black rounded-full px-4 py-2 shadow">
                        <span className="font-medium">👤 Name</span>
                        <span className="font-bold">{user.name}</span>
                    </div>

                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-yellow-300 to-yellow-400 text-black rounded-full px-4 py-2 shadow">
                        <span className="font-medium">🆔 Employe id</span>
                        <span className="font-bold">1001</span>
                    </div>
                </div>

              <div className="w-full  ml-8 flex justify-center items-center gap-5 relative before:absolute before:top-1/2 before:-left-1/2 before:w-1/2 before:h-0.5 before:bg-gray-400 before:content-['']">
                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-orange-300 to-orange-500 text-black rounded-full px-4 py-2 shadow">
                        <span className="font-medium">✉️ Email</span>
                        <span className="text-sm ">{user.email}</span>
                    </div>

                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-orange-300 to-orange-500 text-black rounded-full px-4 py-2 shadow">
                        <span className="font-medium">👥 Designation</span>
                        <span className="font-bold">{user?.desgination}</span>
                    </div>
                </div>

                <div className="w-full  ml-16 flex justify-center items-center gap-5 relative before:absolute before:top-1/2 before:-left-1/2 before:w-1/2 before:h-0.5 before:bg-gray-400 before:content-['']">
                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">📱 Phone</span>
                        <span className="font-bold">{user?.phone}</span>
                    </div>

                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">✅ Present</span>
                        <span className="font-bold">{hell?.present?.length}</span>
                    </div>
                </div>

                <div className="w-full  ml-8 flex justify-center items-center gap-5 relative before:absolute before:top-1/2 before:-left-1/2 before:w-1/2 before:h-[1px] before:bg-gray-400 before:content-['']">
                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">🧳 Leave</span>
                        <span className="font-bold">{hell?.leave?.length}</span>
                    </div>

                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">❌ Absent</span>
                        <span className="font-bold">{hell?.absent?.length}</span>
                    </div>
                </div>

                 <div className="w-full flex justify-center items-center gap-5 relative before:absolute before:top-1/2 before:-left-1/2 before:w-1/2 before:h-0.5 before:bg-gray-400 before:content-['']">
                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-orange-400 to-purple-600 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">📅 Total Days</span>
                        <span className="font-bold">{total}</span>
                    </div>

                    <div className="flex w-full items-center justify-between bg-gradient-to-r from-orange-400 to-purple-600 text-white rounded-full px-4 py-2 shadow">
                        <span className="font-medium">📊 Attend. Percent</span>
                        <span className="font-bold">{perc.present}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileCard;
