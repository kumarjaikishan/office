import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import HolidayCalander from '../holidays/holidayCalander';
import dayjs from 'dayjs';
import OfficialNoticeBoard from './notice';

const EmployeeDashboard = () => {
  const { attendance, companysetting, holiday } = useSelector((state) => state.employee);
  const [holidaylist, setholidaylist] = useState(null);

  const weeklyOffs = companysetting?.weeklyOffs || [1];

  useEffect(() => {
    fun();
  }, [holiday]);

  const fun = () => {
    const dateObjects = [];
    holiday?.forEach(holiday => {
      let current = dayjs(holiday.fromDate);
      const end = holiday.toDate ? dayjs(holiday.toDate) : current;

      while (current.isSameOrBefore(end, 'day')) {
        dateObjects.push({
          date: current.format('MM/DD/YYYY'),
          name: holiday.name,
        });
        current = current.add(1, 'day');
      }
    });

    setholidaylist(dateObjects);
  };

  const highlightedDates = holidaylist?.map(dateObj => ({
    date: dayjs(dateObj.date).toDate(),
    name: dateObj.name
  }));

  // Example static notices (replace with Redux or API data)
  const notices = [
    { title: 'Annual General Meeting on Sep 10', date: '2025-08-01' },
    { title: 'New ID Cards to be issued by next week', date: '2025-07-30' },
    { title: 'Office renovation starts next Monday', date: '2025-07-28' }
  ];

  return (
    <div className="p-2 md:p-3 lg:p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className=" ">
          <HolidayCalander highlightedDates={highlightedDates} weeklyOffs={weeklyOffs} />
        </div>
        <div className=" " >

          <OfficialNoticeBoard notices={notices} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
