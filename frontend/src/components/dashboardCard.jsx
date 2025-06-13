
const DashboardCard = ({logo,head,number,color}) => {
    return (
        <div className="px-4 py-2 flex-1 flex-col bg-white  rounded" >
            <div className="flex items-center gap-3" >
                <span className={`p-2 bg-${color}-100 text-${color}-700 
                rounded-full flex items-center justify-center`}>
                 {logo} </span>
                <div className="text-gray-800 font-bold text-[18px]" >{head}</div>
            </div>
            <div className="details" style={{ padding:'2px 8px'}}>
                <p className="text-2xl font-bold mt-2">{number}</p>
            </div>
        </div>
    )
}

export default DashboardCard
