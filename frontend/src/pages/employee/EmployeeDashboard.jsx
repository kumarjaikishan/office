import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import HolidayCalander from '../holidays/holidayCalander';
import dayjs from 'dayjs';

const EmployeeDashboard = () => {
  const { attendance, companysetting, holiday } = useSelector((state) => state.employee);
  const [holidaylist, setholidaylist] = useState(null)

  const weeklyOffs = companysetting?.weeklyOffs || [1];
  useEffect(() => {
    fun();
  }, [holiday])

  const fun = () => {
    const dateObjects = [];

    holiday.forEach(holiday => {
      let current = dayjs(holiday.fromDate);
      const end = holiday.toDate ? dayjs(holiday.toDate) : current;

      while (current.isSameOrBefore(end, 'day')) {
        dateObjects.push({
          date: current.format('MM/DD/YYYY'),
          name: holiday.name,
        });
        current = current.add(1, 'day');
      }

      setholidaylist(dateObjects);
    });
  }

  const highlightedDates = holidaylist?.map(dateObj => ({
    date: dayjs(dateObj.date).toDate(),
    name: dateObj.name
  }));
  console.log(highlightedDates)

  return (
    <div className='p-2 md:p-3 lg:p-4'>
      <HolidayCalander highlightedDates={highlightedDates} weeklyOffs={weeklyOffs} />
      
    </div>
  )
}

export default EmployeeDashboard;
