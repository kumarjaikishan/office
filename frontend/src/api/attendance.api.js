export const bulkMarkAttendanceApi = async (attendanceRecords) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_ADDRESS}bulkMarkAttendance`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("emstoken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendanceRecords }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit attendance");
  }

  return response.json();
};
