// src/components/OfficialNoticeBoard.jsx
import React from 'react';

const OfficialNoticeBoard = ({ notices }) => {
  return (
    <div className="bg-white h-full shadow-lg rounded-lg p-4 w-full md:w-[350px]">
      <h3 className="text-lg font-bold mb-2 border-b pb-1">📌 Official Notices</h3>
      {notices?.length ? (
        <ul className="space-y-2 text-sm">
          {notices.map((notice, idx) => (
            <li key={idx} className="border-l-4 border-blue-500 pl-2">
              <p className="font-semibold">{notice.title}</p>
              <p className="text-gray-600 text-xs">{notice.date}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No official notices available.</p>
      )}
    </div>
  );
};

export default OfficialNoticeBoard;
