import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateAttendance } from '../redux/actions';

const useLiveAttendance = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/events');

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'attendance_update') {
        dispatch(updateAttendance(data.payload)); // update Redux
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);
};
