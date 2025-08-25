import { useDispatch, useSelector } from "react-redux";
import { setPrimaryColor, toogleextendedonMobile } from "../../store/userSlice";
import { useState } from "react";

const Settings = () => {
    const dispatch = useDispatch();
    const extendedMobile = useSelector((state) => state.user.extendedonMobile);
    const [color, setColor] = useState("#0d9488");

    const handleColorClick = (color) => {
        dispatch(setPrimaryColor(color));
        document.documentElement.style.setProperty("--color-primary", color); // ✅ update CSS var for Tailwind
    };

    const colors = [
        { name: "Teal", value: "#115e59" },    // teal-800
        { name: "Indigo", value: "#3730a3" },  // indigo-800
        { name: "Rose", value: "#9f1239" },    // rose-800
        { name: "Slate", value: "#1e293b" },   // slate-800
        { name: "Amber", value: "#92400e" },   // amber-800
        { name: "Purple", value: "#581c87" }   // purple-800
    ];

    return (
        <div className="p-1 py-2 md:p-4">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
                <span className="text-gray-700">Extended Sidebar on Mobile</span>
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={extendedMobile}
                        onChange={() => dispatch(toogleextendedonMobile())}
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-teal-600 relative transition">
                        <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${extendedMobile ? "translate-x-5" : ""
                                }`}
                        />
                    </div>
                </label>
            </div>
            <div className="p-1 relative mt-6 md:p-4 rounded border border-dashed border-teal-800">
                {/* Floating Label */}
                <span className="absolute translate-y-[-50%] top-0 left-3 px-1 text-sm font-medium text-teal-800 bg-gray-100">
                    Select Color
                </span>

                {/* Color Options */}
                <div className="flex gap-3 mt-2">
                    {colors.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => handleColorClick(c.value)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition"
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Settings;
