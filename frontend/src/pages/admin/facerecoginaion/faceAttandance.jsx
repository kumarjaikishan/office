import { useState } from "react";
import FaceAttendance from "./faceAtten";
import FaceEnrollment from "./facerecog";
import { Tabs, Tab, Box, Paper } from "@mui/material";

const FaceAttandance = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <div className="m-2 bg-white rounded">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tabIndex} onChange={handleChange} aria-label="Face Tabs">
                    <Tab label="Face Attendance" />
                    <Tab label="Face Enrollment" />
                </Tabs>
            </Box>

            {tabIndex === 0 && <FaceAttendance />}
            {tabIndex === 1 && <FaceEnrollment />}
        </div>
    );
};

export default FaceAttandance;
