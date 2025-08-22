import { FaBuilding } from "react-icons/fa"
import { FiClock, FiUsers } from "react-icons/fi"
import { SlBag } from "react-icons/sl"

const DashboardCard = ({ employee, todaypresent, currentpresent }) => {
    return (
        <div className="car grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
            <div className="relative px-1 md:px-4 py-1 md:py-2 shadow flex-1 flex-col bg-white rounded overflow-hidden">
                {/* Left color strip */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-slate-600 rounded-l`} />

                <div className="flex items-center gap-3 pl-2">
                    <span className={`p-2 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center`}>
                        <FiUsers />
                    </span>
                    <div className="text-gray-600 font-bold text-[12px] md:text-[16px]">Total Employee</div>
                </div>

                <div className="details px-2">
                    <p className="text-[22px] md:text-[28px] text-slate-800 font-bold mt-1 md:mt-2">{employee?.length || 0}</p>
                </div>
            </div>
            <div className="relative px-1 md:px-4 py-1 md:py-2 shadow flex-1 flex-col bg-white rounded overflow-hidden">
                {/* Left color strip */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-green-600 rounded-l`} />

                <div className="flex items-center gap-3 pl-2">
                    <span className={`p-2 bg-green-100 text-green-700 rounded-full flex items-center justify-center`}>
                        <FiClock />
                    </span>
                    <div className="text-gray-600 font-bold text-[12px] md:text-[16px]">Today Present</div>
                </div>

                <div className="details px-2">
                      <p className="text-[22px] md:text-[28px] text-slate-800 font-bold mt-1 md:mt-2">{todaypresent}</p>
                </div>
            </div>
            <div className="relative px-1 md:px-4 py-1 md:py-2 shadow flex-1 flex-col bg-white rounded overflow-hidden">
                {/* Left color strip */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-amber-600 rounded-l`} />

                <div className="flex items-center gap-3 pl-2">
                    <span className={`p-2 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center`}>
                        <SlBag />
                    </span>
                    <div className="text-gray-600 font-bold text-[12px] md:text-[16px]">On leave</div>
                </div>

                <div className="details px-2">
                      <p className="text-[22px] md:text-[28px] text-slate-800 font-bold mt-1 md:mt-2">{0}</p>
                </div>
            </div>
            <div className="relative px-1 md:px-4 py-1 md:py-2 shadow flex-1 flex-col bg-white rounded overflow-hidden">
                {/* Left color strip */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-violet-600 rounded-l`} />

                <div className="flex items-center gap-3 pl-2">
                    <span className={`p-2 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center`}>
                        <FaBuilding />
                    </span>
                    <div className="text-gray-600 font-bold text-[12px] md:text-[16px]">In office</div>
                </div>

                <div className="details px-2">
                      <p className="text-[22px] md:text-[28px] text-slate-800 font-bold mt-1 md:mt-2">{currentpresent}</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardCard
