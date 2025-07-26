import axios from 'axios'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';

const EmployeeDashboard = () => {
   const { attendance } = useSelector((state) => state.employee);

  useEffect(() => {
    // xdfd();
    console.log(attendance)
  }, [attendance])
  

  return (
    <div>
      emplye dashboard
    </div>
  )
}

export default EmployeeDashboard
