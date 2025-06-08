import React from 'react'

const DashboardCard = ({logo,head,number,color}) => {
    return (
        <div className="card" style={{display:'flex'}}>
            <div className="logo" style={{background:color}}>
                {logo}
            </div>
            <div className="details" style={{ padding:'2px 8px'}}>
                <div className="head" style={{fontWeight:600}}>{head}</div>
                <div className="number">{number}</div>
            </div>
        </div>
    )
}

export default DashboardCard
