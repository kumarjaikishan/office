const colorMap = {
  violet: 'violet',
  green: 'green',
  amber: 'amber',
  teal: 'teal',
  // add more mappings if needed
};

const DashboardCard = ({logo,head,number,color}) => {
    const safeColor = colorMap[color] || 'teal';
    return (
        <div className="px-4 py-2 shadow-xl flex-1 flex-col bg-white  rounded" >
            <div className="flex items-center gap-3" >
                <span className={`p-2 bg-${safeColor}-100 text-${safeColor}-700 
                rounded-full flex items-center justify-center`}>
                 {logo} </span>
                <div className="text-gray-800 font-bold text-[16px]" >{head}</div>
            </div>
            <div className="details" style={{ padding:'2px 8px'}}>
                <p className="text-[28px] font-bold mt-2">{number}</p>
            </div>
        </div>
    )
}

export default DashboardCard
