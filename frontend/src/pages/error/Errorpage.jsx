import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from '@mui/material';

const Errorpage = () => {
  const navigate = useNavigate();

  const handleback = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-full overflow-auto relative px-4">
      <div className="w-full h-full text-center flex flex-col items-center justify-center">
        
        {/* Image */}
        <div className="flex justify-center">
          <img
            src="https://res.cloudinary.com/dusxlxlvm/image/upload/v1720767933/accusoft/assets/404_page_1_kjlifa.svg"
            alt="404_page_Image"
            className="w-[30vw] max-w-sm sm:max-w-md"
          />
        </div>

        {/* Text */}
        <p className="text-[#555] text-base sm:text-lg mt-4 px-2">
          Sorry, the page you are looking for does not exist. If you believe there's an issue, 
          feel free to report it, and we'll look into it.
        </p>

        {/* Buttons */}
        <div className="w-full max-w-[400px] flex justify-center gap-4 mt-12">
          <NavLink
            to="/"
            className="px-4 py-1.5 rounded-lg text-blue-700 border border-blue-700 cursor-pointer text-sm sm:text-base hover:bg-blue-50 transition"
          >
            Return Home
          </NavLink>

          <Button
            variant="outlined"
            size="small"
            onClick={handleback}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              padding: "4px 16px", // smaller padding like Tailwind
              fontSize: "0.9rem"
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Errorpage