const handleCheckIn = async () => {
  await axios.post('/api/attendance/checkin', { employeeId });
};

const handleCheckOut = async () => {
  await axios.post('/api/attendance/checkout', { employeeId });
};

